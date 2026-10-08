"""Render scripts/og-card/card.html to public/og.png (1200x630).

Needs Python Playwright with Chromium (pip install playwright; python -m playwright install chromium)
and npm dependencies installed, since the card loads the self-hosted fonts from node_modules.
Run from the project root: python scripts/og-card/render.py
"""
from pathlib import Path

from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[2]
card = root / "scripts" / "og-card" / "card.html"
out = root / "public" / "og.png"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
    page.goto(card.as_uri())
    page.evaluate("document.fonts.ready")
    loaded = page.evaluate("[...document.fonts].filter(f => f.status === 'loaded').length")
    if loaded < 3:
        raise SystemExit(f"Only {loaded} of 3 fonts loaded; run npm install first")
    page.screenshot(path=str(out))
    browser.close()

print(f"Wrote {out.relative_to(root)}")
