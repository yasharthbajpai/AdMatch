from bs4 import BeautifulSoup
from schemas import ChangeItem


# Tags we're allowed to change — never touch nav, footer, forms, scripts
SAFE_TAGS = {"h1", "h2", "h3", "h4", "p", "span", "a", "button", "li", "strong", "em"}


def apply_changes(html: str, changes: list[ChangeItem]) -> tuple[str, list[ChangeItem]]:
    """
    Apply surgical text-only changes to HTML using BeautifulSoup.
    Only changes text content, never alters structure or attributes.
    Returns (modified_html, applied_changes) where applied_changes excludes
    any changes where the selector wasn't safely found.
    """
    soup = BeautifulSoup(html, "lxml")
    applied: list[ChangeItem] = []

    for change in changes:
        element = _find_element(soup, change.selector)

        if element is None:
            continue

        if element.name not in SAFE_TAGS:
            continue

        # Only replace direct text nodes, preserving child elements
        if element.string is not None:
            element.string.replace_with(change.new_text)
        else:
            # Element has mixed content — replace all direct NavigableString children
            from bs4 import NavigableString
            replaced = False
            for child in list(element.children):
                if isinstance(child, NavigableString) and child.strip():
                    child.replace_with(change.new_text)
                    replaced = True
                    break
            if not replaced:
                continue

        applied.append(change)

    return str(soup), applied


def _find_element(soup: BeautifulSoup, selector: str):
    """
    Try CSS selector first; fall back to tag+index parsing if needed.
    Returns the first matching element or None.
    """
    try:
        result = soup.select_one(selector)
        if result:
            return result
    except Exception:
        pass

    # Fallback: if selector is just a tag name, return first of that tag
    try:
        tag = selector.split(":")[0].split(".")[0].split("#")[0].strip()
        return soup.find(tag)
    except Exception:
        return None
