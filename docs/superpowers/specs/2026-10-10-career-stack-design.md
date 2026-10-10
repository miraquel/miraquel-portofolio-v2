# Career stack: all projects as a 3D container stack

Date: 2026-10-10. Status: approved in chat, awaiting review of this written spec.

## Why

The owner asked for a three.js idea that harnesses 3D better than the case-study doors (PR #25, closed): the doors were the CSS effect redone and seen only after a click. The career stack does what HTML can't. It puts the 19 projects of the All projects manifest into one navigable 3D scene that shows when each ran, how long, on which platform, and which overlapped. At a glance it argues the site's positioning: one combined Dynamics ERP + .NET profile, neither side a footnote.

## Owner decisions (from the chat)

- Idea: the career stack (chosen over a case-study yard and a live data route).
- Motion: a crane loads the stack once when it first comes into view (recommended option). DESIGN.md's "one authored motion" becomes two.
- PR #25 is closed; the CSS bay doors stay as they are.

## What it shows

One container per manifest line (19), standing on a quay printed on the page.

- **Time runs along the quay (x).** The quay spans January 2018 to January 2026, with a year tick at each January. A container occupies its project's months, end month exclusive: `start` to `end`, so it is `end - start` months long, minimum one. Adjacent projects that hand over in the same month (AXFinMobile ends February 2024, Sparepart starts February 2024) touch rather than overlap. Each box is shortened by a small seam so neighbours read as separate boxes.
- **Platform runs across the quay (z), in three lanes, back to front:**
  - **Dynamics ERP:** the platform names Dynamics and no .NET technology.
  - **ERP + .NET:** the platform names both.
  - **.NET:** the platform names ASP.NET, .NET, Blazor or C#, and no Dynamics product.
- The lane comes only from the manifest's existing `platform` text. For today's 19 lines that gives 11 ERP, 2 ERP + .NET (AXFinMobile, Sparepart) and 6 .NET. The SSIS + C# migrations count as .NET because of C#. The owner was told this and didn't object. A test pins all 19.
- **Overlaps stack upward (y), as a crane would drop them.** Containers are placed in date order (start ascending, then longer first, then line order). Each sits one level above the highest container already in its lane whose months overlap its own, or on the quay if none does. So every raised container rests on one beneath it. Today the ERP lane rises five high in 2020.
- **Paint.** The four case studies (lines with a `container`) are painted steel in their bay's paint (cobalt or oxide). Their mark (e.g. CAAU 202204 0) is stencilled in stencil white on the long side that faces the viewer, so they read as the same containers as the bays above. The other 15 are printed: paper-tone faces, unlit, with form-green edges, drawn like the rest of the form. No new colours; the Two Paints Rule and the One Ink Rule hold.
- **Printing on the quay:** the quay is drawn in form green lines, the page's ink on the page's paper: its outline, faint dividers between the lanes, and a tick at each January on the front edge. The year labels (Overpass Mono) sit under the ticks. The lane names (Overpass, plain words: "Dynamics ERP", "ERP + .NET", ".NET") sit at the quay's newest end, where every lane has free floor and where a phone's view opens; they stay pinned to the canvas edge while the view is panned back. Both are HTML laid over the canvas at projected positions, so they stay crisp; text printed on the quay's surface would be a few pixels tall at this camera angle.
- **Night print:** paper and form colours are read from the CSS custom properties and re-read when the look changes (the strip's Dark switch or the device setting), then the printed parts are redrawn. Steel and stencil white stay the same in both prints.

## Interaction

- **Hover (mouse) or first tap (touch) on a container:** it lifts slightly over about 150 ms (instant under reduced motion). A label shows its title, client and period in the field style: paper, 2px form frame, carbon text, the period in mono. The label is HTML positioned over the canvas at the container's projected top, kept inside the canvas.
- **Click, or a second tap on the same container:** go to its manifest row by setting the location hash to `#manifest-N`. The existing `tr:target` styles tint and frame it, and the existing scroll margin clears the strip. A tap elsewhere clears the selection.
- **Drag sideways:** pan along the quay. On touch, a vertical swipe still scrolls the page (`touch-action: pan-y`).
- **What's visible:** from 1024px the whole quay is in view and panning is off. Below 1024px about three years are in view, starting at the most recent, and a drag pans back in time, clamped to the quay's ends.
- **Accessibility:** the canvas and label are decorative (`aria-hidden`). The table below is unchanged and stays the complete, accessible manifest. Nothing is reachable only through the stack.

## Motion

- **Crane loading, once:** the first time the stack is 40% in view, the containers are lowered in date order. Each descends from above the canvas to its place on a thin cable over 420 ms, on the bays' curve (cubic-bezier(0.16, 1, 0.3, 1)). Starts are staggered so the whole sequence takes about 2 s. The cable disappears as each container lands. After that the scene is still.
- **Reduced motion:** the stack appears already loaded. Hover lifts are instant.
- **Drawing:** frames are drawn only while something changes (the loading, a lift, a drag, a resize, a theme change). At rest no frames are requested.
- **DESIGN.md:** "One authored motion" becomes two: the door swing and the crane loading.

## Placement and loading

- **Where:** in the All projects section, between the section head and the table, the full width of the content column. About 22rem tall from 1024px, 17rem below.
- **Reserved space:** the slot is reserved by default so the table never moves once the page has loaded. The component script hides it when WebGL 2 is unavailable, which is rare and happens before a reader reaches the section.
- **Fetching three.js:** three.js is fetched when the slot comes within one viewport of view (IntersectionObserver), on any page load that reaches it. It's the same `three` chunk the 404 page uses, about 131 KB gzipped. If loading fails, the slot is hidden.
- **Chunk name:** the build names the three.js chunk `three` (`manualChunks` in astro.config.mjs).

## Code

- **`src/lib/stack-layout.ts`** (pure, no three.js, unit-tested):
  - `laneOf(platform)`;
  - month arithmetic: month index from `YYYY-MM`, span start, length;
  - `stackLayout(lines)`, which returns per line its lane, x start, length and level;
  - the crane schedule: per container a start delay, and the progress of its descent at a given elapsed time.
- **`src/components/lading/CareerStack.astro`:**
  - the slot, a canvas and a label element;
  - the layout from `stackLayout(manifest)`, serialized into a data attribute at build time, with title, client, period text, row number and, for case studies, the mark id and steel;
  - the script: WebGL 2 check, reveal or hide, lazy import on approach.
- **`src/lib/career-stack.ts`:** the three.js scene:
  - the printed quay texture, printed boxes (unlit faces + edge lines) and painted case-study boxes with their side mark;
  - the camera fitted to the canvas (whole quay from 1024px, about three years below);
  - raycast hover and selection, the label placement, drag panning, the crane sequence, theme updates and draw-on-demand.
- **`src/lib/css-color.ts`:** reads a colour from a CSS custom property. Moved out of `lost-container.ts` (its `token`), which then imports it.
- **`src/components/lading/Manifest.astro`:** renders `<CareerStack />` between the section head and the table.
- **`astro.config.mjs`:** names the three.js chunk.
- **`DESIGN.md`:** a "Career Stack" component entry, the two-motions rule and the depth note.

## Tests

- **`tests/stack-layout.test.ts`:**
  - all 19 manifest lines get the expected lane (11 / 2 / 6), and the two integration case studies are ERP + .NET;
  - month spans are end-exclusive with a one-month minimum;
  - no two containers in the same lane and level overlap;
  - every container above level 0 overlaps one at the level below in its lane;
  - the 2020 ERP tower reaches level 4;
  - the layout is the same on every run;
  - the crane schedule finishes within 2.1 s, starts the first container at 0 and keeps date order.
- **Browser checks (Playwright, scratchpad scripts, dev then the Vercel preview):**
  - **Load and approach:** no three.js on load at the top of the page; it is fetched when scrolling towards All projects.
  - **Crane:** frames at the start, middle and end, captured with a paused page clock.
  - **Hover:** the label shows the right project; a click lands on and tints the right row.
  - **Phone:** pans by sideways drag, and a vertical swipe scrolls the page.
  - **Night print:** redraws the printed parts.
  - **Reduced motion:** stacked at once.
  - **Without WebGL:** the slot is hidden and the table is unmoved.
  - **At rest:** no frames are requested.
  - **404 container:** still works after the `css-color` move.
- `npm test`, `astro check`, `astro build`.

## Out of scope

- Changing the table, the bays or their CSS doors.
- Employer bands on the quay.
- Filtering, zooming or a keyboard-operable 3D view; the table serves those needs.
- Showing the stack anywhere but the homepage.
