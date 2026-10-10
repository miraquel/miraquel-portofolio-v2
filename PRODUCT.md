# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: hiring managers and recruiters** filling Dynamics 365 Finance & Operations or .NET developer roles outside Indonesia. They usually arrive from the CV or LinkedIn, skim on desktop or phone, and decide quickly whether the profile fits a role, whether the work is real, and how to get in touch.
- **Secondary: Dynamics partners and companies**, mainly Indonesian and regional, looking for help on Dynamics AX 2012 / D365 projects or contract work. They look for platform depth and familiar client names.
- **The owner as editor:** Chaidir writes and manages blog posts in the `/admin` editorial workspace. Chaidir is the only admin, through the Firestore admin allowlist.

## Product Purpose

The personal portfolio and blog of Chaidir Ali Assegaf, a developer working across Microsoft Dynamics ERP and .NET. It exists so that a hiring manager can, within one visit:
- understand the profile;
- check the work behind it;
- reach Chaidir or the CV without friction.

Success means a visitor leaves knowing what Chaidir does, having seen proof, and holding a working contact route: email, LinkedIn, or `/resume.pdf`.

## Positioning

One combined ERP + .NET profile; neither side is a footnote to the other. Chaidir builds and customises Dynamics AX 2012, Dynamics 365 Finance & Operations and Business Central (X++, AL). Chaidir also builds the .NET services and apps that connect to them: ASP.NET Core / Web API backends, Blazor, and Flutter mobile apps integrated with AX. The record behind this:
- Sparepart Management and AXFinMobile (mobile apps integrated with AX 2012);
- an AX 2012 R3 → D365 F&O migration;
- an API gateway;
- GiselX and Futurist (ASP.NET Core).

A pure ERP consultant or a pure .NET engineer can't truthfully claim that combination.

## Operating Context

- **Discovery:** the portfolio URL (chaidiraliassegaf.vercel.app) is printed on the CV, and the CV is linked back from the site. Hiring managers often have both open, so the site and the CV must agree.
- **Job search:** run separately with the career-ops tool, outside this repo. It keeps separate D365 F&O and .NET CV versions; the site presents the combined profile.
- **Blog:** posts are written in the `/admin` editorial workspace (CKEditor 5) and stored in Firestore with a status. Only published posts are publicly readable (`firestore.rules`), and post HTML is sanitised before rendering (`src/lib/sanitize.ts`).

## Capabilities and Constraints

- **Public routes:**
  - `/`: a single page with About, Skills, Experience, Projects, a blog teaser and Contact;
  - `/blog`: the post list, with a tag filter;
  - `/blog/[slug]`: a post, with real 404 and 503 states;
  - `/resume.pdf`.
- **Admin routes:** `/admin`, `/admin/login`, `/admin/posts` and the post create/edit pages, behind Firebase Auth plus the admin allowlist. Keep the security hardening from commit e55ed10 (allowlist rules, sanitising, transactional slugs) and its tests in `tests/security-regressions.test.ts`.
- **Stack:** Astro 7 with server rendering on Vercel (`@astrojs/vercel`), Tailwind CSS 4, Firebase (Firestore, Auth, Analytics).
- **Availability:** the site openly says Chaidir is open to relocating abroad with employer visa sponsorship. It names no target regions. This was the owner's choice, made knowing the repo and site are public and visible to the current employer.
- **Terminology:**
  - Use "Dynamics AX 2012 R3" (or R2 where that's accurate), "Dynamics 365 Finance and Operations" (F&O), "Dynamics 365 Business Central", "X++", "AL".
  - Use "ASP.NET Core", not "ASP.Net Core".
- **Site title:** "Dynamics 365 F&O & .NET Developer", decided 2026-10-08.
- **Public profile links:** GitHub and LinkedIn only. The personal Instagram, Facebook and Twitter/X links were dropped (2026-10-08).
- **Blog:** stays. The homepage surfaces the latest published post.
- **Facts confirmed 2026-10-08:**
  - **Project entries:**
    - The Alliance One project was Business Central work in AL.
    - Sparepart Management and AXFinMobile integrated with AX 2012 **R2**, through custom AIF services.
    - Futurist reads an AX data warehouse, not AX itself.
    - The F&O migration covered both the X++ code upgrade and the data migration.
  - **Job titles:** the CV title plus a specialty, e.g. "Software Developer, Dynamics AX 2012".
  - **Location:** the site says "Indonesia" (country only).
  - **App screenshots:** not shown; the employer's internal apps stay off the public site.

## Brand Commitments

- **Name:** Chaidir Ali Assegaf. GitHub handle `miraquel`. Public email ading.assegaf@gmail.com. LinkedIn `chaidirassegaf`.
- **Voice:** first person, plain and specific. No hedging ("some", "famous ERP systems") and no inflation.
- **Look:** the current slate/teal look is not a commitment. On 2026-10-08 the owner chose a redesign grounded in the ERP and integration work.

## Evidence on Hand

- **Employment:**

  | Employer | Dates |
  |---|---|
  | PT Gandum Mas Kencana | July 2023 – present |
  | PT Intikom Berlian Mustika | February 2019 – July 2023 |
  | PT Visionet Data Internasional | January 2018 – February 2019 |

  Roles and descriptions are in `src/components/Experience.astro`.
- **Projects:** 19 entries with dates, stacks and client names in `src/components/Projects.astro`. Client names may stay public.
- **Public repos:** github.com/miraquel/GiselX, /Futurist, /SparepartManagementSystem and /SparepartManagementSystem_Flutter.
- **Screenshots:** two project screenshots (`src/assets/projects/gisel.png`, `futurist.png`), both mostly empty welcome screens. The other 17 projects have no imagery.
- **CV:** `public/resume.pdf`, a 2-page D365 F&O baseline CV generated by career-ops.
- **Claim rules:** the same as the CV (the career-ops fact list, kept outside this repo).
  - Allowed numbers: 8 years .NET; 5 years D365 F&O; a five-month Business Central implementation (led); about 60% less manual entry with AXFinMobile.
  - Never use "7+ years", "over four years", "Fortune 500" or "patented".
  - The Developer Associate certificate is current only with its end date: "valid until 3 October 2027". Never call it current after that day.
- **Credentials:**
  - Microsoft Certified: Dynamics 365 Finance and Operations Apps Developer Associate, issued October 2023 and renewed: **active until 3 October 2027** (Microsoft Learn, checked 9 October 2026; it had been listed as expired October 2025). `public/resume.pdf` still says "expired October 2025" until it is regenerated in career-ops;
  - Microsoft Dynamics 365 Fundamentals, December 2019;
  - Exam 764 (SQL Database Infrastructure), August 2019;
  - Bachelor of Information Technology, Universitas Islam Syekh Yusuf, 2017;
  - IELTS 7.0 (August 2023), CEFR C1 English.
- **Blog:** two published posts: "Settling AX 2012 vendor invoices from outside AX: a custom AIF service for payment journals" (8 October 2026, with a downloadable example XPO) and the earlier sample "Getting Started with Astro and Firebase".
- **Absent, so never fabricate:** testimonials, client logos or permission to use them, measured outcomes beyond the allowed numbers above, imagery for the 17 projects without screenshots, and any further blog content.

## Product Principles

1. **Proof over adjectives.** Every claim traces to a named project, an employer, a public repo or an allowed number. Leave something unsaid rather than inflate it.
2. **ERP and .NET are one story.** Show how the apps and services connect to the ERP, instead of listing two separate skill sets.
3. **Serve the hiring manager's three actions first:** understand the profile, check the work, make contact. Each must be reachable within seconds on desktop and phone.
4. **Honest status.** A certificate shows its end date while current and is stamped expired from that day. Openness to relocation is stated plainly. The site and the CV never contradict each other.
