from pydantic import BaseModel, Field
from typing import Optional


class AdInsights(BaseModel):
    headline: str = Field(description="Main headline or hook from the ad")
    sub_headline: Optional[str] = Field(default=None, description="Secondary headline if present")
    offer: str = Field(description="The core offer or value proposition")
    cta: str = Field(description="Call-to-action text from the ad")
    tone: str = Field(description="Tone of the ad, e.g. urgent, friendly, professional")
    target_audience: str = Field(description="Who this ad is targeting")
    key_messages: list[str] = Field(description="Up to 5 key messages or benefits mentioned")
    visual_style: Optional[str] = Field(default=None, description="Visual style, colors, mood of the ad")


class PageElement(BaseModel):
    selector: str = Field(description="CSS selector uniquely identifying this element")
    tag: str = Field(description="HTML tag, e.g. h1, h2, p, button, a")
    current_text: str = Field(description="Current text content of this element")
    purpose: str = Field(description="Role of this element on the page, e.g. hero headline, CTA button")
    above_fold: bool = Field(default=True, description="Whether this element is visible without scrolling")


class PageStructure(BaseModel):
    page_title: str
    main_headline: Optional[str] = None
    elements: list[PageElement] = Field(description="List of editable elements found on the page")


class ChangeItem(BaseModel):
    selector: str = Field(description="CSS selector of the element to change")
    original_text: str = Field(description="Original text before change")
    new_text: str = Field(description="New personalized text")
    reason: str = Field(description="Why this change was made")
    cro_principle: str = Field(description="CRO principle applied, e.g. message match, urgency, social proof")


class PersonalizationPlan(BaseModel):
    changes: list[ChangeItem] = Field(description="List of surgical text changes, max 7")
    summary: str = Field(description="One sentence summary of the personalization strategy")


class PersonalizeResponse(BaseModel):
    session_id: str
    modified_html: str
    changes: list[ChangeItem]
    summary: str
    original_url: str
