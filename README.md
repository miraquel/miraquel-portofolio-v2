# Chaidir Ali Assegaf: portfolio and blog

The personal site of a Dynamics 365 Finance & Operations and .NET developer, live at
[chaidiraliassegaf.vercel.app](https://chaidiraliassegaf.vercel.app).

The homepage is laid out as an ocean bill of lading:
- **The first screen** is numbered fields: shipper, consignee, notify party, ports and current carrier.
- **Four case studies** are stencilled containers with ISO 6346 marks. Each opens onto its data flow.
- **The manifest** lists every project.

A blog sits behind a small editorial admin.

## Stack

- [Astro 7](https://astro.build) with server rendering on Vercel (`@astrojs/vercel`)
- Tailwind CSS 4, with tokens in `src/styles/global.css`
- Firebase:
  - Firestore holds blog posts. Public reads are limited to published posts.
  - Auth signs in the admin.
  - Analytics is the only Firebase code on public pages.
- Self-hosted fonts through Fontsource: Big Shoulders Stencil, Overpass, Overpass Mono

## Run it

```sh
npm install
cp .env.example .env   # then fill in the Firebase web-app config
npm run dev            # http://localhost:4321
npm test               # unit and security-regression tests
npm run build
```

All `PUBLIC_FIREBASE_*` variables in `.env.example` are needed in development and in Vercel. The homepage's Notices field reads the latest published post straight from Firestore's REST endpoint in the browser.

## Where things live

| Path | What it holds |
|---|---|
| `src/data/` | All homepage content: profile, case studies with their routes, the project manifest, employers, credentials. Edit content here, not in components. |
| `src/components/lading/` | The bill-of-lading components (fields, container bays, routes, manifest, stamps) |
| `src/pages/` | The homepage, blog index, blog posts (404 and 503 states included), the 404 page, and the admin under `admin/` |
| `src/lib/` | Firestore access (`blog.ts`), ISO 6346 check digits (`container-mark.ts`), the guilloche pattern, date formatting |
| `public/resume.pdf` | The résumé the site links to |
| `public/og.png` | The social preview card |
| `scripts/` | Post seeding and admin scripts, and the card renderer |

## Blog and admin

Posts are written at `/admin`, which only accounts on the Firestore admin allowlist can use. Setup is covered in [BLOG_SETUP.md](BLOG_SETUP.md) and [STATUS_SETUP.md](STATUS_SETUP.md). Security rules are in `firestore.rules`. `tests/security-regressions.test.ts` guards the allowlist, the published-only reads and HTML sanitising.

## Design records

- [PRODUCT.md](PRODUCT.md) holds the audience, positioning and claim rules. Use only the numbers it allows.
- [DESIGN.md](DESIGN.md) and `.impeccable/design.json` describe the design system as built.
- `.impeccable/surfaces/` holds the homepage brief.

## Social preview card

`public/og.png` is rendered from `scripts/og-card/card.html`, using the same tokens and fonts as the site. Regenerate it after changing the name, title or case studies:

```sh
pip install playwright && python -m playwright install chromium
python scripts/og-card/render.py
```
