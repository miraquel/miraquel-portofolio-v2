"""Render the 1200x630 social preview cards.

    python scripts/og-card/render.py
        card.html -> public/og.png, the site card.

    python scripts/og-card/render.py post --slug <slug> --title "..." --date 2026-10-08 --tags "X++, AIF"
        post-card.html -> public/blog/<slug>/og.png, one post's card. Then set the post's
        socialImage field in Firestore to /blog/<slug>/og.png so the post page uses it.

Needs Python Playwright with Chromium (pip install playwright; python -m playwright install chromium)
and npm dependencies installed, since the cards load the self-hosted fonts from node_modules.
Run from the project root.
"""
import argparse
import re
from pathlib import Path

from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parents[2]
cards = root / "scripts" / "og-card"


def render(card: Path, out: Path, data: dict | None = None) -> int | None:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1)
        page.goto(card.as_uri())
        page.evaluate("document.fonts.ready")
        loaded = page.evaluate("[...document.fonts].filter(f => f.status === 'loaded').length")
        if loaded < 3:
            raise SystemExit(f"Only {loaded} of 3 fonts loaded; run npm install first")
        size = page.evaluate("data => window.render(data)", data) if data else None
        out.parent.mkdir(parents=True, exist_ok=True)
        page.screenshot(path=str(out))
        browser.close()
    print(f"Wrote {out.relative_to(root)}")
    return size


def main() -> None:
    parser = argparse.ArgumentParser(description="Render the social preview cards")
    sub = parser.add_subparsers(dest="kind")
    post = sub.add_parser("post", help="render one blog post's card")
    post.add_argument("--slug", required=True)
    post.add_argument("--title", required=True)
    post.add_argument("--date", required=True, help="publish date, YYYY-MM-DD")
    post.add_argument("--tags", default="", help="comma-separated, as they should read on the card")
    post.add_argument("--author", default="Chaidir Ali Assegaf")
    post.add_argument("--role", default="Dynamics 365 F&O & .NET Developer")
    args = parser.parse_args()

    if args.kind != "post":
        render(cards / "card.html", root / "public" / "og.png")
        return

    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", args.slug):
        raise SystemExit(f"Not a post slug: {args.slug!r}")
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", args.date):
        raise SystemExit(f"--date must be YYYY-MM-DD, got {args.date!r}")

    size = render(
        cards / "post-card.html",
        root / "public" / "blog" / args.slug / "og.png",
        {
            "title": args.title,
            "author": args.author,
            "role": args.role,
            "date": args.date,
            "tags": [t.strip() for t in args.tags.split(",") if t.strip()],
        },
    )
    print(f"Title set at {size}px; set socialImage to /blog/{args.slug}/og.png")


if __name__ == "__main__":
    main()
