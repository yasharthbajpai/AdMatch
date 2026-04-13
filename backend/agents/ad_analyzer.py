import json
import base64
from google import genai
from google.genai import types
from schemas import AdInsights

SYSTEM_PROMPT = """You are an expert ad creative analyst.
Analyze the provided ad image and extract structured insights.
Be specific about the headline, offer, CTA, tone, target audience, and key messages.
Respond ONLY with valid JSON matching the schema exactly."""

SCHEMA = """{
  "headline": "string",
  "sub_headline": "string or null",
  "offer": "string",
  "cta": "string",
  "tone": "string",
  "target_audience": "string",
  "key_messages": ["string", ...],
  "visual_style": "string or null"
}"""


def analyze_ad(image_bytes: bytes | None, ad_url: str | None, client: genai.Client, model_name: str) -> AdInsights:
    """
    Analyze an ad creative (image bytes or URL) and return structured insights.
    """
    prompt = f"{SYSTEM_PROMPT}\n\nExtract insights from this ad creative. Return JSON matching:\n{SCHEMA}"

    parts: list = [prompt]

    if image_bytes:
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        parts.append(types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"))
    elif ad_url:
        parts.append(f"\nAd URL: {ad_url}\nAnalyze this ad based on the URL and any context you can infer.")
    else:
        raise ValueError("Either image_bytes or ad_url must be provided")

    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=parts,
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    response_mime_type="application/json",
                ),
            )
            data = json.loads(response.text)
            return AdInsights(**data)
        except Exception as e:
            if attempt == 1:
                raise RuntimeError(f"Ad analysis failed after 2 attempts: {e}")
