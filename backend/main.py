import os
import uuid

from google import genai
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from agents.ad_analyzer import analyze_ad
from agents.page_analyzer import analyze_page
from agents.personalizer import create_personalization_plan
from agents.validator import validate_and_filter_changes
from schemas import PersonalizeResponse
from utils.html_editor import apply_changes
from utils.scraper import scrape_page

app = FastAPI(title="AdMatch API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store: {session_id: modified_html}
sessions: dict[str, str] = {}

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
MODEL_NAME = os.environ.get("GEMINI_MODEL", "gemini-2.5-pro-preview-03-25")


def get_client() -> genai.Client:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not set")
    return genai.Client(api_key=GEMINI_API_KEY)


@app.get("/api/health")
def health():
    return {"status": "ok", "model": MODEL_NAME}


@app.post("/api/personalize", response_model=PersonalizeResponse)
async def personalize(
    page_url: str = Form(...),
    ad_url: str | None = Form(default=None),
    ad_file: UploadFile | None = File(default=None),
):
    if not ad_url and not ad_file:
        raise HTTPException(status_code=400, detail="Provide either ad_url or ad_file")

    client = get_client()

    # Step 1: Read ad image bytes if uploaded
    image_bytes = None
    if ad_file:
        image_bytes = await ad_file.read()

    # Step 2: Scrape the landing page
    try:
        page_data = await scrape_page(page_url)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to scrape page: {e}")

    # Step 3: Analyze the ad creative
    try:
        ad_insights = analyze_ad(image_bytes, ad_url, client, MODEL_NAME)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ad analysis failed: {e}")

    # Step 4: Analyze the landing page structure
    try:
        page_structure = analyze_page(
            page_data["html"],
            page_data["screenshot_b64"],
            page_data["title"],
            client,
            MODEL_NAME,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Page analysis failed: {e}")

    # Step 5: Generate personalization plan
    try:
        plan = create_personalization_plan(ad_insights, page_structure, client, MODEL_NAME)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Personalization planning failed: {e}")

    # Step 6: Validate changes against real DOM
    valid_changes = validate_and_filter_changes(plan, page_data["html"])

    # Step 7: Apply changes to HTML
    modified_html, applied_changes = apply_changes(page_data["html"], valid_changes)

    # Inject a small banner into the modified page to identify it as personalized
    modified_html = _inject_banner(modified_html)

    # Store session
    session_id = str(uuid.uuid4())
    sessions[session_id] = modified_html

    return PersonalizeResponse(
        session_id=session_id,
        modified_html=modified_html,
        changes=applied_changes,
        summary=plan.summary,
        original_url=page_url,
    )


@app.get("/api/preview/{session_id}", response_class=HTMLResponse)
def preview(session_id: str):
    html = sessions.get(session_id)
    if not html:
        raise HTTPException(status_code=404, detail="Session not found")
    return HTMLResponse(content=html)


def _inject_banner(html: str) -> str:
    banner = (
        '<div style="position:fixed;top:0;left:0;right:0;z-index:99999;'
        'background:linear-gradient(90deg,#6366f1,#8b5cf6);color:#fff;'
        'font-family:system-ui,sans-serif;font-size:13px;font-weight:600;'
        'padding:8px 16px;text-align:center;letter-spacing:0.02em;">'
        '✦ AdMatch — Personalized Version'
        "</div>"
        '<div style="height:36px;"></div>'
    )
    if "<body" in html:
        idx = html.find("<body")
        close = html.find(">", idx)
        return html[: close + 1] + banner + html[close + 1 :]
    return banner + html
