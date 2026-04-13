import base64
from playwright.async_api import async_playwright


async def scrape_page(url: str) -> dict:
    """
    Fetch a landing page using Playwright.
    Returns raw HTML and a base64-encoded screenshot.
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
        )
        page = await context.new_page()

        try:
            await page.goto(url, wait_until="networkidle", timeout=30000)
            await page.wait_for_timeout(2000)

            html = await page.content()

            screenshot_bytes = await page.screenshot(full_page=True, type="jpeg", quality=80)
            screenshot_b64 = base64.b64encode(screenshot_bytes).decode("utf-8")

            title = await page.title()
        finally:
            await browser.close()

    return {
        "html": html,
        "screenshot_b64": screenshot_b64,
        "title": title,
        "url": url,
    }
