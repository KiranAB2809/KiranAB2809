# Reusable Prompt — "Build me a portfolio website + auto-generated resume PDF"

Copy everything between the `--- PROMPT START ---` and `--- PROMPT END ---` markers into any
capable coding agent (Copilot, Claude Code, Cursor, etc.), then paste your resume text
underneath it and attach your photo.

---

## How to use

1. Copy the prompt block below.
2. Paste your **full resume text** at the end, under the `RESUME SOURCE` heading.
3. Put your photo somewhere the agent can reach and tell it the filename.
4. Answer the agent's clarifying questions (design style, stack, hosting).
5. Let it build, then review the screenshots it produces.

---

--- PROMPT START ---

# ROLE

You are a senior front-end engineer and product designer. Build me a **personal portfolio
website plus an auto-generated, ATS-friendly resume PDF** from the resume text I provide at
the end of this prompt.

Work autonomously: create the files, run the site locally, take screenshots, look at your own
output, and iterate until it genuinely looks good. Do not just hand me code and stop.

---

# PART 1 — CLARIFY FIRST (ask, then build)

Before writing code, ask me a short batch of questions in a single interaction. Give me
recommended defaults so I can just accept them:

1. **Project folder** — absolute path where the project should be created.
2. **Design direction** — offer 3 concrete named options with a one-line description of each,
   e.g.
   - *Modern Dark Terminal-Dev* (slate + cyan, glassmorphism, mono accents)
   - *Minimal Editorial* (white, huge type, one accent, whitespace-heavy)
   - *Bold Gradient / Creative* (animated gradient mesh, large hero, colourful cards)
3. **Tech stack & hosting** — static HTML + Tailwind CDN + vanilla JS (recommended, zero
   build), vs React+Vite, vs Next.js.
4. **Resume PDF strategy** — auto-generated from the same data source (recommended), a static
   file I upload, or both.
5. **Extras** — contact form, live GitHub repos, blog, skills visualisation, testimonials,
   analytics, SEO/OpenGraph.

Then build against my answers.

---

# PART 2 — NON-NEGOTIABLE ARCHITECTURE

## 2.1 Single source of truth

**Every piece of visible content — website AND resume PDF — must render from one file:
`data/profile.json`.** No content hardcoded in HTML. I must be able to edit that one JSON
file, refresh, and see the site change; run one command and see the PDF match.

`index.html` and `resume.html` are shells only. JavaScript fetches the JSON and renders.

## 2.2 Zero npm dependencies

Do **not** add npm packages. My machine may sit behind a corporate npm registry that blocks
the public registry — assume `npm install` will fail.

- Dev server: a small Node script using only `node:http` / `node:fs`.
- PDF, screenshots, image processing: drive the **Chrome or Edge already installed on the
  machine** in headless mode via `child_process.spawn`.
- Write a `scripts/chrome.mjs` helper that probes the standard install paths on win32 /
  darwin / linux, honours a `CHROME_PATH` env var override, and throws a clear error if
  nothing is found.

## 2.3 File layout

```
<project>/
├─ index.html                 # portfolio shell
├─ resume.html                # printable A4 resume shell
├─ data/profile.json          # ← the only file the user edits
├─ assets/
│  ├─ css/styles.css          # theme tokens, background, components
│  ├─ css/resume.css          # print styles (sizes in pt, @page A4)
│  ├─ js/main.js              # renders the portfolio
│  ├─ js/resume.js            # renders the resume sheet
│  ├─ img/                    # avatar-source.*, avatar.jpg, favicon.svg, og-image.png
│  └─ resume/                 # generated PDF (committed to the repo)
├─ scripts/
│  ├─ server.mjs              # static dev server (also exported for the generators)
│  ├─ chrome.mjs              # headless Chrome/Edge locator + runner
│  ├─ generate-pdf.mjs
│  ├─ generate-avatar.mjs
│  ├─ generate-og.mjs
│  ├─ avatar-template.html    # offscreen render target for the portrait
│  └─ og-template.html        # offscreen render target for the link-preview card
├─ .github/workflows/deploy.yml
├─ robots.txt, sitemap.xml, .nojekyll, .gitignore
├─ package.json               # scripts only, no dependencies
└─ README.md
```

## 2.4 npm scripts

| Script | Purpose |
| --- | --- |
| `start` / `dev` | Serve on `http://127.0.0.1:5173` |
| `pdf` | Regenerate the resume PDF from `profile.json` |
| `avatar` | Re-crop / re-grade the hero portrait |
| `og` | Regenerate the OpenGraph link-preview image |
| `build` | `pdf` + `og` |

---

# PART 3 — `data/profile.json` SCHEMA

Derive the values from my resume. Use this shape:

```jsonc
{
  "meta":   { "siteUrl", "title", "description", "keywords[]", "ogImage",
              "themeColorDark", "themeColorLight" },

  "profile": {
    "name", "shortName", "initials", "role",
    "roles": ["…"],              // rotated by the hero typing effect
    "tagline", "location", "phone", "email",
    "avatar": "assets/img/avatar.jpg",
    "resumeFile": "assets/resume/<Name>_Resume.pdf",
    "availability": "Open to …",
    "socials": [{ "label", "url", "icon" }],
    "githubUsername",
    "summary": ["…"]             // profile-summary bullets
  },

  "stats":  [{ "value": 10, "suffix": "+", "label": "Years of Experience" }],

  "experience": [{
    "company", "role", "period", "duration", "location",
    "current": true,             // drives the pulsing timeline dot
    "summary",
    "highlights": ["…"],         // day-to-day responsibilities
    "achievements": ["…"],       // rendered in a separate accent panel
    "tech": ["…"]
  }],

  "projects": [{
    "name", "org", "period", "featured",
    "overview", "tech": ["…"], "responsibilities": ["…"], "impact",
    "links": [{ "label", "url" }]
  }],

  "skillGroups": [{ "name", "icon", "skills": [{ "name", "level": 0-100 }] }],
  "skillTags":   ["…"],          // tag cloud
  "otherSkills": [{ "name", "detail" }],

  "education": [{ "degree", "field", "institution", "board", "year", "performance" }],
  "awards":    [{ "title", "org", "year", "note" }],
  "personal":  { "dateOfBirth", "nationality", "location", "languages[]", "interests[]" },

  "contact": { "heading", "blurb", "formspreeEndpoint", "showPhone" },
  "github":  { "enabled", "username", "maxRepos", "excludeForks", "pinned[]" },

  "resumeOptions": { "includePersonalDetails", "includeAwards",
                     "includeEducation", "footerNote" }   // PDF-only toggles
}
```

**Rules when transcribing my resume:**
- Preserve my wording. Tighten only for grammar and parallel structure.
- Do not invent achievements, metrics, dates or employers.
- Split each role's bullets into `highlights` (responsibilities) vs `achievements` (outcomes).
- Infer `skillGroups` levels sensibly from seniority and how prominently each skill features,
  and tell me they are editable estimates.
- Write `tagline`, `availability` and `contact.blurb` fresh — these do not exist in a resume.

---

# PART 4 — DESIGN SPEC

## 4.1 Themes

Ship **both a dark and a light theme** with a toggle in the nav.

- Persist the choice in `localStorage`.
- Default to `prefers-color-scheme` on first visit.
- Apply the theme in a **blocking inline `<script>` in `<head>`** so there is no flash of the
  wrong theme on load.
- Drive colours through CSS custom properties so both themes share one component layer.

## 4.2 Visual language

- Full-bleed animated background (e.g. slowly drifting blurred gradient blobs over a faint
  grid), fixed behind the content, `z-index: -1`, `pointer-events: none`.
- Glassmorphic cards: translucent background, hairline border, `backdrop-filter: blur()`,
  soft shadow, gradient hairline border revealed on hover.
- One consistent accent gradient reused across headings, buttons, bars and the scroll
  progress bar.
- Two typefaces: a geometric sans for UI and a monospace for eyebrows / dates / metadata.
- Number every section with a mono eyebrow (`01 — About`, `02 — Career`, …).

## 4.3 Motion — tasteful, never gaudy

- Scroll-reveal via `IntersectionObserver` (fade + small translate, staggered delays).
- Hero typing effect cycling `profile.roles`.
- Count-up animation on the stats.
- Skill bars that fill when scrolled into view.
- Subtle 3D tilt on the portrait card (pointer-fine devices only).
- Sticky nav that gains a glass background after scrolling; scroll-spy highlights the active
  section.
- Scroll progress bar, back-to-top button.
- **Every animation must be disabled under `@media (prefers-reduced-motion: reduce)`.**

## 4.4 Responsiveness

Must look correct and intentional at **390 px, 768 px, 1024 px, 1440 px and ultrawide**.
Verify each breakpoint with a real screenshot — do not assume.

- Hamburger menu below `md`, animated open/close, closes on link click.
- Fluid type with `clamp()`.
- No horizontal scrollbars at any width.
- Touch targets ≥ 44 px.

---

# PART 5 — SECTIONS

1. **Hero** — availability pill, name with gradient, typing role rotator, tagline, primary +
   secondary CTAs, "view resume online" link, social icon row, portrait card with floating
   tech chips and a caption overlay, scroll cue.
2. **Stats strip** — animated counters.
3. **About** — summary bullets, "other skills" mini-cards, and a Details side panel
   (location, experience, email, phone, nationality, languages) plus interest chips.
4. **Experience** — vertical timeline with a gradient spine, pulsing dot on the current role,
   responsibilities list, a visually distinct achievements panel, tech chips.
5. **Projects** — responsive card grid; long responsibility lists collapsed behind a
   `<details>` disclosure; an Impact callout; tech chips.
6. **Skills** — per-group animated bars **and** a capability radar chart drawn on `<canvas>`
   with no charting library. Below it, a centred tag cloud.
7. **GitHub** — repos fetched live from `https://api.github.com/users/<user>/repos`. Sort by
   stars then recency, honour a `pinned` order, optionally exclude forks. Show a skeleton
   while loading and a graceful "browse on GitHub" fallback on rate-limit/error.
8. **Education & Awards** — two columns.
9. **Contact** — heading, blurb, contact list, and a validated form that POSTs to Formspree.
   **If no Formspree endpoint is configured yet, fall back to composing a `mailto:` link** so
   the form is never broken. Include a honeypot field.
10. **Footer** — copyright with live year, social icons.

---

# PART 6 — RESUME PDF PIPELINE

- `resume.html` renders a **print-optimised A4 sheet from the same `profile.json`**.
- Dedicated `resume.css`: sizes in `pt`, `@page { size: A4; margin: …; }`,
  `break-inside: avoid` on sections and items, links unstyled in print, a screen-only toolbar
  (Back to portfolio / Print / Download) hidden via `@media print`.
- Must be **text-based and ATS-parseable** — never an image, never multi-column trickery that
  breaks parsing. Conventional headings: Profile Summary, Technical Skills, Professional
  Experience, Project Experience, Education, Awards, Personal Details.
- Also responsive on screen so it is readable on a phone.
- `?print=1` query param auto-opens the print dialog.
- Set `window.__RESUME_READY__ = true` after render so the generator can wait on it.
- `npm run pdf` starts the static server on an ephemeral port, drives headless Chrome with
  `--print-to-pdf` + `--no-pdf-header-footer`, writes to `assets/resume/`, and **commits the
  PDF into the repo** so the Download button always works.

---

# PART 7 — PORTRAIT PIPELINE (if I supply a photo)

Do not just drop my raw photo in. Build `scripts/avatar-template.html` — an offscreen
800×1000 (4:5) render target — plus `npm run avatar` which screenshots it headlessly.

1. **Crop** to a `CROP = {x, y, w, h}` constant in source pixels, 4:5 ratio, framing
   head-and-torso.
2. **Remove the background** using MediaPipe Selfie Segmentation loaded from jsDelivr
   (`https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/`). Public CDNs are usually
   reachable even when the npm registry is blocked. If the model cannot load, fall back
   gracefully to keeping the original background — never crash.
3. **Composite on canvas**: paint a studio backdrop in the site's palette (base gradient +
   key glow behind the head + two accent glows + corner falloff), then the cut-out subject.
4. **Integrate the subject** so it never looks like a sticker:
   - feather the mask edge (~2 px blur) before `destination-in`
   - soft blurred dark silhouette behind for ambient occlusion
   - a *restrained* rim light (≈20% opacity — anything more reads as a halo)
   - a low-opacity brand tint over the subject only, `soft-light`
   - light roll-off towards the waist
   - graduated desaturation below the collar so clothing does not compete with the face
5. **Grade gently**: `saturate(.90) contrast(1.04) brightness(.97)`. **Never add a bright
   `screen`-blend highlight over the face — it blows out skin tones.**
6. Expose every value as a **named constant at the top of the script** (`CROP`, `FEATHER`,
   `TINT`, `RIM`, `SETTLE`, `MUTE`) and document them in the README.
7. Output PNG from Chrome, then re-encode to JPEG (on Windows, `System.Drawing` via a short
   PowerShell call) to keep the file under ~100 KB.
8. Keep the untouched original at `assets/img/avatar-source.*`.
9. If no photo is supplied, the hero must fall back to a styled monogram of my initials via
   the `<img onerror>` handler — nothing may break.

---

# PART 8 — SEO, SHARING, ACCESSIBILITY, SECURITY

**SEO / sharing**
- Title, description, keywords, canonical, full OpenGraph + Twitter card tags, `Person`
  JSON-LD, `robots.txt`, `sitemap.xml`.
- Generate `og-image.png` at 1200×630 from `scripts/og-template.html` — headline, role,
  tagline, tech chips, and the portrait — so shared links look designed.

**Accessibility**
- Semantic landmarks, logical heading order, skip-to-content link, visible focus rings,
  `aria-label` on icon-only controls, `aria-expanded` on the menu toggle, `role="status"` +
  `aria-live` on form feedback, meaningful `alt` text, AA contrast in both themes.

**Security**
- HTML-escape every value interpolated from JSON into `innerHTML`.
- Validate/allowlist URL schemes before injecting them into `href` (http, https, mailto, tel,
  relative only).
- `rel="noopener noreferrer"` on every `target="_blank"`.
- The dev server must resolve paths inside the project root only — block traversal.
- No secrets in the repo. The contact form must not need a backend.

---

# PART 9 — DEPLOYMENT

- GitHub Actions workflow that, on push to `main`: regenerates the PDF and OG image from
  `profile.json`, commits them back if changed, and deploys to GitHub Pages.
- Include `.nojekyll`.
- README must explain both the `<user>.github.io` root-domain case and the
  `<user>.github.io/<repo>/` sub-path case, including which files need the URL updated.

---

# PART 10 — README

Written for a non-expert future me. Must cover: how to run locally; a table mapping every
`profile.json` key to what it controls on the page; how to swap the photo and tune the
portrait knobs; how to enable the contact form; how the PDF is produced; step-by-step
publishing; a customisation table (colours, fonts, motion, section order); and the file tree.

---

# PART 11 — KNOWN TRAPS (do not rediscover these)

1. `fetch()` is blocked on `file://` — the site **must** be opened through the dev server.
   Detect the failure and render a clear on-page message telling me to run `npm start`.
2. Corporate npm registries commonly block the public registry. That is exactly why this
   project has **zero dependencies**.
3. A *headed* Playwright/CDP browser cannot do `Page.printToPDF`. Use the headless Chrome CLI
   (`--headless=new --print-to-pdf=…`) instead.
4. Chrome's `--screenshot` only emits PNG. Re-encode to JPEG separately if size matters.
5. Give `--virtual-time-budget` plenty of headroom (≈30 s) when the page loads a WASM model
   from a CDN, or the screenshot fires before rendering completes.
6. Canvas radar-chart labels clip at the edges — reserve ~70 px of padding, shrink the font,
   and truncate long labels.
7. A strong rim light around a cut-out subject looks like a sticker. Keep it ≤ 20%.
8. Reveal-on-scroll elements are invisible at `opacity: 0` — wait for the animation to settle
   before screenshotting, or you will review a blank page.
9. Re-render the canvas radar on theme change so its grid and label colours stay legible.

---

# PART 12 — DEFINITION OF DONE

Do not report completion until you have personally verified, with screenshots:

- [ ] Site renders fully with content coming only from `profile.json`
- [ ] Dark **and** light themes both look correct; no flash on load
- [ ] 390 / 768 / 1024 / 1440 px all verified; no horizontal scroll
- [ ] Mobile menu opens, closes, and navigates
- [ ] Scroll-reveal, typing effect, counters and skill bars all fire
- [ ] Radar chart renders without clipped labels in both themes
- [ ] GitHub section loads live repos and degrades gracefully on rate limit
- [ ] Contact form validates and falls back to `mailto:` without a Formspree endpoint
- [ ] `resume.html` renders and the generated PDF exists, is text-selectable, and matches the site
- [ ] Portrait is generated, integrated, and falls back to a monogram if absent
- [ ] `og-image.png` generated
- [ ] No console errors; no linter/compile errors
- [ ] README complete

Finally: summarise the design decisions you made, list anything I still need to supply
(photo, Formspree ID, GitHub username), and offer 2–3 concrete tweaks I might want.

---

# RESUME SOURCE

<<< PASTE YOUR FULL RESUME TEXT HERE >>>

# ASSETS

- Photo: `<<< filename, or "none" >>>`
- GitHub username: `<<< … >>>`
- LinkedIn URL: `<<< … >>>`

--- PROMPT END ---
