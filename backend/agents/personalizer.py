import json
from google import genai
from google.genai import types
from schemas import AdInsights, PageStructure, PersonalizationPlan

SYSTEM_PROMPT = """You are an expert CRO (Conversion Rate Optimization) copywriter.
Your job is to personalize an existing landing page to match a specific ad creative.

RULES:
1. Ensure MESSAGE MATCH — the landing page headline must echo the ad headline
2. Maintain the offer from the ad prominently on the page
3. Align the CTA text with the ad's CTA
4. Keep changes surgical — only change text, max 7 elements
5. Never change navigation, footer, legal text, or form labels
6. Write copy that is concise, persuasive, and matches the ad's tone
7. Apply CRO principles: urgency, specificity, benefit-focused language, social proof hooks

Respond ONLY with valid JSON."""

SCHEMA = """{
  "changes": [
    {
      "selector": "string (CSS selector from the page elements)",
      "original_text": "string",
      "new_text": "string",
      "reason": "string",
      "cro_principle": "string"
    }
  ],
  "summary": "string"
}"""


def create_personalization_plan(
    ad_insights: AdInsights,
    page_structure: PageStructure,
    client: genai.Client,
    model_name: str,
) -> PersonalizationPlan:
    """
    Generate a surgical personalization plan mapping ad insights to page elements.
    """
    elements_json = json.dumps(
        [e.model_dump() for e in page_structure.elements], indent=2
    )

    prompt = f"""
{SYSTEM_PROMPT}

AD CREATIVE INSIGHTS:
- Headline: {ad_insights.headline}
- Sub-headline: {ad_insights.sub_headline or 'N/A'}
- Offer: {ad_insights.offer}
- CTA: {ad_insights.cta}
- Tone: {ad_insights.tone}
- Target Audience: {ad_insights.target_audience}
- Key Messages: {', '.join(ad_insights.key_messages)}
- Visual Style: {ad_insights.visual_style or 'N/A'}

CURRENT PAGE ELEMENTS:
{elements_json}

Generate a personalization plan. Return JSON matching:
{SCHEMA}
"""

    for attempt in range(2):
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2,
                    response_mime_type="application/json",
                ),
            )
            data = json.loads(response.text)
            if "changes" in data:
                data["changes"] = data["changes"][:7]
            return PersonalizationPlan(**data)
        except Exception as e:
            if attempt == 1:
                raise RuntimeError(f"Personalization planning failed after 2 attempts: {e}")
