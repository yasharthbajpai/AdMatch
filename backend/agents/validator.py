from bs4 import BeautifulSoup
from schemas import ChangeItem, PersonalizationPlan

# Tags that are safe to modify
SAFE_TAGS = {"h1", "h2", "h3", "h4", "p", "span", "a", "button", "li", "strong", "em"}

# Selectors that must never be touched
BLOCKED_SELECTORS = {"nav", "footer", "header nav", ".nav", ".footer", ".legal", "form"}


def validate_and_filter_changes(
    plan: PersonalizationPlan,
    html: str,
) -> list[ChangeItem]:
    """
    Validate each change against the actual DOM:
    - Selector must resolve to a real element
    - Element must be a safe tag
    - Selector must not match blocked areas
    - New text must not be empty
    Returns only the valid subset of changes.
    """
    soup = BeautifulSoup(html, "lxml")
    valid: list[ChangeItem] = []

    for change in plan.changes:
        # Block obviously dangerous selectors
        if any(blocked in change.selector for blocked in BLOCKED_SELECTORS):
            continue

        # New text must be meaningful
        if not change.new_text or len(change.new_text.strip()) < 3:
            continue

        # Selector must find an element
        element = _find_element(soup, change.selector)
        if element is None:
            continue

        # Must be a safe tag
        if element.name not in SAFE_TAGS:
            continue

        # Must not be inside nav or footer
        if _is_in_blocked_parent(element):
            continue

        valid.append(change)

    return valid


def _find_element(soup: BeautifulSoup, selector: str):
    try:
        result = soup.select_one(selector)
        if result:
            return result
    except Exception:
        pass
    try:
        tag = selector.split(":")[0].split(".")[0].split("#")[0].strip()
        return soup.find(tag)
    except Exception:
        return None


def _is_in_blocked_parent(element) -> bool:
    blocked_tags = {"nav", "footer"}
    for parent in element.parents:
        if hasattr(parent, "name") and parent.name in blocked_tags:
            return True
    return False
