---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: ["src/pages/blog/index.astro","src/pages/blog/[slug].astro"]
---

# Homepage surface brief

## Scope and mode
- **Mode:** Experience: the work leads from the first viewport.
- **Rebuilt in full:** `/` (`src/pages/index.astro`), replacing the slate/teal sticky-sidebar world.
- **Re-skinned in the same pass, inheriting the world:** `/blog` and `/blog/[slug]`.
- **Untouched:** `/admin`, the harden behaviour (contact copy button, résumé, 404/503 states), security code and URLs.

## Audience, job, action
- **Audience:** hiring managers and recruiters abroad (D365 F&O or .NET roles) first, Dynamics partners second. They skim for one to two minutes on a laptop or phone.
- **Job:** understand the combined ERP + .NET profile, check the work, make contact.
- **Primary action:** contact, through the Notify party: email with copy, LinkedIn, GitHub, résumé PDF.

## Proof and content
- **Case studies:**
  - the AX 2012 R3 → D365 F&O migration (Mitra Pinasthika Mustika Rent);
  - Sparepart Management v2;
  - AXFinMobile (about 60% less manual entry);
  - Futurist.

  Each carries a code-drawn data-flow diagram, plus an image slot for screenshots later.
- **Manifest:** the other 15 projects.
- **Employers:** three.
- **Credentials:** the F&O Developer Associate is stamped expired (October 2025).
- **Claims:** only PRODUCT.md's allowed numbers.
- **Profile links:** GitHub and LinkedIn only.
- **Notices:** one live field showing the latest post, hidden when there are no posts or the read fails. The homepage stays free of the Firestore and Auth SDKs.

## Constraints
- Fonts are self-hosted.
- WCAG AA, with themed focus rings.
- Reduced motion is honoured.
- Touch targets are 44px.
- The design holds 3–6 case studies and up to about 40 manifest rows.

## Anti-goals
- No person-as-cargo jokes.
- No field without a real fact.
- No corrugated-steel wallpaper.
- No card grid.
- No cream paper.
- No sticky sidebar.

## Unresolved
- None. Routing facts, the Alliance One entry (Business Central) and the AX version (R2) were confirmed on 2026-10-08.

## Direction contract

THESIS: The homepage is an original ocean bill of lading for a developer. Every claim sits in a numbered field, the four case studies are stencilled containers whose doors open onto their real data flows, and the remaining projects ride a cargo manifest. It refuses both the dev-portfolio template (sticky sidebar and project cards) and its minimal-editorial opposite.

OWN-WORLD: Pale green security-tinted form paper with an authored guilloche. Form rules and labels are printed in one deep green ink; field data is set in carbon. Full-bleed container bands in cobalt and oxide red carry stencil-white marks. One signal yellow is reserved for live facts. Rubber stamps appear only where they carry a date or a status. Type: a condensed stencil for marks and the name, a highway-signage grotesk for reading, and its mono only for codes and dates. Two rule weights on one 12-column form grid.

STORY: A hiring manager sees, in order:
1. who ships (Shipper) and the combined F&O + .NET profile;
2. where: Indonesia (country only, by the owner's choice), open to relocating with sponsorship;
3. the four containers of work;
4. how to reach out (Notify party).

They then follow a container mark to check a data flow, scan the manifest, and make contact.

FIRST VIEWPORT: At 1440×900 the viewport is the document, under a thin strip.
- **Shipper:** spans 7 of 12 columns, with the name in stencil at the 6rem ceiling and the title beneath.
- **Consignee and Notify party:** stacked in the right 5 columns. Notify party holds email with copy, LinkedIn, GitHub and résumé, the primary action.
- **A row of three fields:** Port of loading, Port of discharge (yellow) and Current carrier (yellow).
- **Marks & numbers:** runs full width, with four stencilled container marks, each a link carrying its project name and one line.

SIGNATURE: Hovering or focusing a container mark lights its row in the manifest. Following the mark lands on its container, whose door leaves swing open in one exponential ease-out to reveal the route. Content is never hidden at rest, and reduced motion arrives with the doors already open.

FORM: Bill of Lading. Grounded candidate #7 of 7, assigned by the roll; seed key 1f893e98.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
