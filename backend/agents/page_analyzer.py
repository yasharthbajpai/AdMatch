import json
import base64
from google import genai
from google.genai import types
from schemas import PageStructure

SYSTEM_PROMPT = """You are a landing page analyst specializing in CRO (Conversion Rate Optimization).
Analyze the provided landing page HTML and screenshot.
Identify ONLY elements that contain marketing copy and can be safely edited:
- Main headlines (h1, h2, h3)
- Hero subheadlines and paragraphs
- CTA buttons and links
- Key benefit statements

NEVER include: navigation links, footer, form labels, legal text, image alt text.
For each element, provide a CSS selector that uniquely identifies it.
Prefer specific selectors (e.g. "h1", "section.hero h2", ".cta-button") over generic ones.
Respond ONLY with valid JSON."""

SCHEMA = """{
  "page_title": "string",
  "main_headline": "string or null",
  "elements": [
    {
      "selector": "string",
      "tag": "string",
      "current_text": "string",
      "purpose": "string",
      "above_fold": true/false
    }
  ]
}"""


def analyze_page(html: str, screenshot_b64: str, title: str, client: genai.Client, model_name: str) -> PageStructure:
    """
    Identify editable marketing elements on the landing page.
    """
    html_truncated = html[:15000]
    screenshot_bytes = base64.b64decode(screenshot_b64)

    prompt = (
        f"{SYSTEM_PROMPT}\n\nPage title: {title}\n\n"
        f"Analyze this landing page and return JSON matching:\n{SCHEMA}\n\n"
        f"HTML (truncated):\n```html\n{html_truncated}\n```"
    )

    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=[
                    prompt,
                    types.Part.from_bytes(data=screenshot_bytes, mime_type="image/jpeg"),
                ],
                config=types.GenerateContentConfig(
                    temperature=0.1,
                    response_mime_type="application/json",
                ),
            )
            data = json.loads(response.text)
            return PageStructure(**data)
        except Exception as e:
            if attempt == 1:
                raise RuntimeError(f"Page analysis failed after 2 attempts: {e}")
