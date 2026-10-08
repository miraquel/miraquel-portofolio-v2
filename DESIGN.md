---
name: Chaidir Ali Assegaf, Portfolio
description: An ocean bill of lading for a developer, printed in one green ink on security-tinted form paper, with the case studies carried as stencilled steel containers.
colors:
  paper: "#e3ede3"
  paper-deep: "#d2e2d5"
  form: "#24543f"
  form-soft: "#5d8571"
  ink: "#17212b"
  cobalt: "#1d4a96"
  cobalt-deep: "#173c7a"
  oxide: "#9a3a25"
  oxide-deep: "#7d2f1e"
  stencil: "#f5f7f2"
  signal: "#f2c21b"
  stamp: "#b3261e"
typography:
  display:
    fontFamily: "Big Shoulders Stencil Variable, Arial Narrow, sans-serif"
    fontSize: "clamp(3.5rem, 8.4vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "0.01em"
  mark-md:
    fontFamily: "Big Shoulders Stencil Variable, Arial Narrow, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.04em"
  mark-sm:
    fontFamily: "Big Shoulders Stencil Variable, Arial Narrow, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.04em"
  band-title:
    fontFamily: "Big Shoulders Stencil Variable, Arial Narrow, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.08em"
  headline:
    fontFamily: "Overpass Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.25rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Overpass Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 3.4vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  field-value:
    fontFamily: "Overpass Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 800
    lineHeight: 1.25
  secondary:
    fontFamily: "Overpass Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.375
  body:
    fontFamily: "Overpass Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.625
  body-post:
    fontFamily: "Overpass Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Overpass Variable, Segoe UI, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.25
  data:
    fontFamily: "Overpass Mono Variable, ui-monospace, Cascadia Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
    fontFeature: "\"tnum\", \"lnum\""
rounded:
  none: "0px"
spacing:
  hairline: "1px"
  field-x-sm: "16px"
  field-x: "20px"
  field-y: "20px"
  gutter-sm: "16px"
  gutter: "32px"
  section: "64px"
  section-lg: "96px"
  container: "85rem"
components:
  form-band:
    backgroundColor: "{colors.form}"
    textColor: "{colors.paper}"
    typography: "{typography.band-title}"
    rounded: "{rounded.none}"
    padding: "8px 20px"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "20px"
  field-live:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "20px"
  field-label:
    textColor: "{colors.form}"
    typography: "{typography.label}"
  button-primary:
    backgroundColor: "{colors.form}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
    padding: "0 20px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.form}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "44px"
  button-outline-hover:
    backgroundColor: "{colors.form}"
    textColor: "{colors.paper}"
  tag-chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.form}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "44px"
  tag-chip-selected:
    backgroundColor: "{colors.form}"
    textColor: "{colors.paper}"
  steel-bay-cobalt:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.stencil}"
    rounded: "{rounded.none}"
    padding: "80px 32px"
  steel-bay-oxide:
    backgroundColor: "{colors.oxide}"
    textColor: "{colors.stencil}"
    rounded: "{rounded.none}"
    padding: "80px 32px"
  stamp:
    textColor: "{colors.stamp}"
    typography: "{typography.band-title}"
    rounded: "{rounded.none}"
    padding: "6px 12px 4px"
  strip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.form}"
    height: "44px"
---

# Design System: Chaidir Ali Assegaf, Portfolio

## Overview

**Creative North Star: "The Bill of Lading"**

The site is an original ocean bill of lading issued for one developer. The ground is pale green security-tinted form paper; every rule, label and field number is printed in a single deep green ink, and every fact is typed over it in carbon. Claims live in numbered fields, never in free-floating copy. Where the document needs to carry weight, it hands off to cargo: each case study is a full-bleed band of painted container steel, cobalt or oxide red, with its ISO 6346 mark stencilled in off-white.

Density is that of a working form: tight hairline grids of boxes, small semibold labels, heavy data. Decoration is limited to what a real shipping document or container carries: a generated guilloche rosette as the security print, rubber stamps that certify a status and a date, a check-digit box on every mark. One signal yellow marks what is live right now, and nothing else competes with it.

The world rejects the developer-portfolio template (sticky sidebar, project card grids) and its minimal-editorial opposite, and it rejects cream paper. There are no rounded corners and no soft shadows anywhere on the public surfaces.

**Key Characteristics:**
- One green ink for structure, carbon for data, signal yellow for live facts only.
- Numbered dt/dd fields on a 12-column form grid, separated by 1px hairlines and framed by 2px rules.
- Full-bleed steel container bands carrying stencilled ISO 6346 marks.
- A condensed stencil face for marks, the name and printed band titles; a highway-signage grotesk for everything read; its mono for codes and dates.
- One authored motion: container door leaves swinging open on arrival.

## Colors

A single-ink form palette (paper, green ink, carbon) with two container-steel paints, one signal yellow and one stamp red.

### Primary
- **Form Green Ink** (form): the printing ink. Frames, section rules, field labels and numbers, the form band and table header grounds, link underlines (at 40% at rest, full on hover), the primary button. It is also the ground that shows through as the 1px hairlines between fields.

### Secondary
- **Container Cobalt** (cobalt) and **Cobalt Door Steel** (cobalt-deep): one of the two steel paints. Cobalt is the ground of a container band and its swatch beside a mark; the deep shade is reserved for that bay's door leaves.
- **Oxide Red** (oxide) and **Oxide Door Steel** (oxide-deep): the second steel paint, used exactly like cobalt. Bays alternate between the two by data, not by decoration.

### Tertiary
- **Signal Yellow** (signal): reserved for live facts. Port of discharge and Current carrier print on it as whole fields, and the current employer's period sits on a yellow slip. It also serves as the interaction mark: text selection, the focus outline on dark grounds (steel bands and form-green bands), and the focused skip link.
- **Stamp Red** (stamp): rubber-stamp ink only, used at full strength with multiply blending and the stamp-ink displacement filter.

### Neutral
- **Security Paper** (paper): the page ground and the ground of every field.
- **Deep Tint Paper** (paper-deep): the second paper tone. Hover and cross-highlight state for marks and manifest rows, the standing tint on manifest lines that are containers, the closing Notify party footer, blockquotes and inline code in posts.
- **Carbon** (ink): all field data and reading text; the 2px frame of a route card; the code-block ground in posts; the default focus outline.
- **Stencil White** (stencil): text and marks on container steel; labels there run at 85%.
- **Faded Ink** (form-soft): the scrollbar thumb only.

### Named Rules
**The One Ink Rule.** Every printed element of the form (rules, labels, numbers, band grounds) is Form Green. Data is Carbon. A third text color on paper is a defect.

**The Live Fact Rule.** Signal Yellow marks only what is current: an open port of discharge, the current carrier, the current employer's period, plus selection and focus. A static fact on yellow is a lie about the document.

**The Two Paints Rule.** Cobalt and oxide appear only as container steel (a bay ground or the small swatch beside its mark). They are never text accents, buttons or borders on paper.

## Typography

**Display Font:** Big Shoulders Stencil Variable, opsz and wght axes (with Arial Narrow)
**Body Font:** Overpass Variable (with Segoe UI, system-ui)
**Label/Mono Font:** Overpass Mono Variable (with ui-monospace, Cascadia Mono)

**Character:** A condensed military stencil, as painted on container doors, against a grotesk descended from US highway signage; the mono is that grotesk's own sibling, so codes sit in the same voice as the prose. All three are self-hosted.

### Hierarchy
- **Display** (stencil, 800, clamp 3.5rem to 6rem, line-height 0.9, uppercase): the name in the Shipper field. The 6rem ceiling is the largest type on the site.
- **Mark** (stencil, 800, uppercase, 0.04em tracking, line-height 1): ISO 6346 container marks in two named sizes: medium in a bay header, after the title, client and period and keyed below by "Serial is the start month" in the label role (small on phones, so the title stays the largest thing in the head); small at the foot of each Marks and numbers card, beside its swatch and above the period, and in the manifest. No other mark sizes. A mark never leads: the project title does. The check digit sits in a box bordered at 0.07em.
- **Band title** (stencil, 800, 1.375rem, 0.08em tracking, uppercase): printed band titles ("Bill of lading", "Notices") reversed out of the form band, and the name in the strip.
- **Headline** (Overpass, 800, clamp 2rem to 3.25rem, line-height 1, -0.02em): section heads, preceded by their mono section number in form green. Blog and post titles use the same weight and tracking up to 4rem.
- **Title** (Overpass, 800, clamp 1.875rem to 2.5rem, line-height 1.1, balanced): a container's project title; it leads its bay. In a Marks and numbers card the same role runs at 1.25rem.
- **Field value** (Overpass, 800, 1.625rem): the typed answer in a primary field; 1.25rem and 1.125rem for denser fields and list entries.
- **Secondary** (Overpass, 400 or 600, 0.9375rem, line-height 1.375): supporting lines under a field value, section notes, route stop descriptions and leg labels, return flows, credential details, employer roles, the manifest's platform column.
- **Body** (Overpass, 400, 1.0625rem, line-height 1.625): reading text, held to about 55 to 65 characters a line. Overpass's ch is about 1.4 average characters, so body copy, notes and excerpts use 44 to 48ch. Post bodies run at 1.125rem, line-height 1.75: prose at 48ch (about 60 characters) inside a 42rem column that code blocks and headings fill, so a 66-character line of 0.9375rem mono fits without scrolling. Inline code wraps anywhere rather than widen the page.
- **Label** (Overpass, 600, 0.8125rem, form green, sentence case): field labels, column headers, section notes.
- **Data** (Overpass Mono, 500, 0.75rem to 0.875rem, tabular lining figures): field numbers, dates, periods, line numbers, tech lists.

### Named Rules
**The Stencil Is Paint Rule.** The stencil face is for what would be painted or printed large: container marks, the name, band titles, and the word of a rubber stamp. Never for headings, buttons or reading.

**The Mono Is A Code Rule.** Overpass Mono carries only codes, dates, numbers and tech lists. A sentence in mono is a defect.

## Layout

The page is the document. A 2px-ruled sticky strip (44px) sits above a centred container of 85rem with 16px gutters on mobile and 32px from 640px. The first viewport is the bill itself: a form band, then a 12-column `dl` grid whose fields span 7/5 at 1024px and wider (Shipper over two rows; Consignee and Notify party stacked), then 3/4/5 for the port and carrier row, then full-width Marks and numbers (4 columns from 1280px, 2 from 640px) and Description of goods. Every field collapses to 12 columns on mobile, and below 1024px the boxes reflow in the order a skimming reader needs them: Shipper, Port of loading, Port of discharge, Current carrier, Notify party, Consignee, then Marks and numbers, Description of goods and Notices. The numbers stay with their boxes, as on a printed form, and no moved box holds a link, so focus order is unchanged.

Fields pad 16px on mobile and 20px from 640px, with a 10px gap between label and value. Sections pad 64px vertically, 96px from 1024px; section heads sit 32px above their content.

Container bands break out full-bleed. Inside, a 5/7 two-column grid (head and fields left, route right) from 1024px, stacking head, route, fields below it, with 56px column and 40px row gaps and 80px vertical padding at desktop.

The manifest is a real table that stacks below 64rem into a two-column grid per row (line number left, the rest right), its header visually hidden but kept for assistive technology.

## Elevation & Depth

Flat. Depth is printed, not lit: the form stacks by rule weight and paper tone, and the only dimensional object is the container door leaf during its swing. Paper-deep is the single raised tone, used for state (hover, cross-highlight) and for the closing footer.

### Named Rules
**The Printed Depth Rule.** No box-shadows on paper. Separation comes from a 2px rule, a 1px hairline, or the paper-deep tone. The one box-shadow in the system is the 2px light ring on a door leaf's locking rod.

**The Two Rules Rule.** Two weights only: 2px for frames and section rules, 1px for the hairlines between fields, drawn as a 1px grid gap over the form-green ground rather than as borders. In-field row dividers inside tables may use form green at 25 to 40%.

## Shapes

Square everywhere: 0px radius on fields, buttons, chips, cards, stamps and images. The vocabulary is ruled boxes. Recurring geometry: the boxed check digit on every mark, the small square steel swatch (14px) beside a mark, the double-ruled 3px stamp border rotated -6deg, and square list markers in post bodies. The guilloche rosette is the only curve, printed at 16% in form green behind the Shipper field at 1024px and wider.

## Components

### Buttons
Printed and plain: square, 2px framed, 44px tall.
- **Shape:** square (0px), 2px border, minimum height 44px.
- **Primary:** form-green ground, paper text, 600 at 0.875rem, 20px side padding. Used for Reload and See all posts.
- **Hover / Focus:** primary darkens to carbon ground and border over 150ms; focus is the global 3px carbon outline at a 3px offset.
- **Outline (Copy address):** paper ground, form-green text and border, a 16px inline stroke icon; inverts to green ground on hover. Hidden until its script runs.

### Chips
- **Style:** blog tag filters are 44px square chips, 2px form border, form text on paper, with the count in mono.
- **State:** the selected tag inverts to form ground and paper text and carries `aria-current`; unselected chips hover to paper-deep.

### Cards / Containers
There are no cards. Content sits in fields.
- **Field:** a numbered dt/dd box on paper, label in form green prefixed by a two-digit mono number, value in carbon. Live fields print on signal yellow.
- **Corner Style:** square.
- **Border:** 2px form frame around the grid; 1px hairlines between fields from the grid gap.
- **Internal Padding:** 16px, 20px from 640px.

### Inputs / Fields
No public inputs. "Field" means a form box, above.

### Navigation
The strip: sticky, paper ground, 2px form bottom rule. The name in stencil at left; section links in Overpass 600 at 0.875rem, form green, turning carbon and underlined on hover. Below 768px the strip keeps Work (the phone's short label for the case studies), Blog and Contact; below 360px Blog drops to the footer so Work and Contact fit beside the name. The strip's name steps down to 1rem, and 1.125rem from 380px, so the links fit without crowding the 16px gutters. Every link is 44px tall. A skip link appears on focus on signal yellow.

### Container Bay (signature)
A case study as a full-bleed band of steel: the title, client and period on the left, then the medium mark with its key; on the right the hold, a paper card framed 2px in carbon carrying the Route; below the head, Cargo, Evidence and Status as stencil-white labelled fields. The field is titled Evidence only when something in it can be opened (source, a write-up, a file to download); a bay holding only facts on file and cross-references titles it Record. Links to other sites open a new tab and say so to screen readers; links within the site and downloads stay in the tab. Status always carries a "Delivered" stamp with its month, set on a paper slip. Below 1024px a bay stacks head, then its fields (cargo first), then the route, so the one-sentence explanation leads and the diagram follows as the detail. Focus outlines inside a bay turn signal yellow.

**Door-leaf material** (component-local, not palette): each leaf is painted in its bay's -deep steel (cobalt-deep or oxide-deep), corrugated by a repeating 90deg gradient of 14px plain, a 4px rib at rgb(0 0 0 / 0.16) and a 4px highlight at rgb(255 255 255 / 0.06); its edge is a 2px border at rgb(0 0 0 / 0.35); a 6px locking rod at rgb(0 0 0 / 0.4) runs from 6% to 94% of its height, 18% in from the meeting edge, ringed by the rod-ring shadow. These translucent values exist only on the leaves.

**Door arrival.** Following a container link shuts that bay's two door leaves (deeper steel, corrugated by a repeating gradient, each with a locking rod) while it is off-screen, then swings them open once 35% of the hold (the route the leaves cover) is in view, which on a phone is when the reader scrolls down to it: rotateY to 92deg over 1100ms on cubic-bezier(0.16, 1, 0.3, 1) under 4000px perspective, fading out over 350ms from 700ms and hidden at rest so they never cover content. Under reduced motion the leaves are `display: none`.

### Route
A data-flow diagram drawn in code: lettered stops (A, B, C) as 2px carbon-framed paper boxes with name, role and mono tech line; between stops, 2px stroked down-arrows labelled with what travels; return flows listed under a form hairline with a return arrow.

### Container Mark and Cross-highlight
An ISO 6346 mark (owner code, serial, boxed check digit). Standalone (bay header, manifest) it is an image named "Container CAAU 202204, check digit 0"; inside a link it is hidden, so the link is named by its project title first. Hovering or focusing a mark in Marks and numbers lights its manifest row in paper-deep, and the reverse.

### Stamp
A rubber stamp in stamp red: stencil word over a mono date, 3px double border, rotated -6deg, multiply-blended and roughened by the stamp-ink displacement filter. It carries a status and a date and nothing else (Delivered on bays, Expired on a lapsed certificate).

### Manifest
A form-framed table with a form-green header row; container lines carry their small mark and a standing paper-deep tint, and link to their bay. A link that lands on a line (a bay's record cross-references one) stops 5rem below the top, clear of the strip, and tints that line paper-deep. Stacks per row below 64rem, since its six columns need about 820px.

## Do's and Don'ts

### Do:
- **Do** put every claim in a numbered field: a form-green label with its two-digit mono number over carbon data.
- **Do** draw grids of fields as a 1px gap over the form-green ground inside a 2px form frame.
- **Do** reserve signal yellow for live facts (the open port, the current carrier, the current employer's period) and for selection and focus.
- **Do** carry case studies as full-bleed cobalt or oxide bands with a stencilled ISO 6346 mark and a code-drawn route.
- **Do** keep every tap target at least 44px tall on mobile.
- **Do** focus with a 3px carbon outline at a 3px offset, switching to signal yellow on dark grounds (steel bands and form-green bands, marked `data-dark`). These base styles apply only under `html[data-world='lading']`; the admin workspace keeps its own.
- **Do** keep smooth scrolling and the door swing behind `prefers-reduced-motion: no-preference`.

### Don't:
- **Don't** round a corner or cast a shadow on paper.
- **Don't** use a stamp without a status and a date.
- **Don't** set headings, buttons or reading text in the stencil face, or sentences in mono.
- **Don't** use cobalt or oxide as accent colors on paper.
- **Don't** lay work out as a card grid or add a sticky sidebar.
- **Don't** add a field without a real fact in it.
- **Don't** let anything animated cover content at rest.
