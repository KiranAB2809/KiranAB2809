# Kiran AB — Portfolio + Auto-Generated Resume

A personal portfolio site with an ATS-friendly resume PDF, both generated from a single
JSON file. Static HTML + vanilla JS. Zero npm dependencies — nothing to `npm install`.

## Quick start

```bash
npm start
```

Then open **http://127.0.0.1:5173** in your browser. (Opening `index.html` directly with
`file://` will not work — the page fetches `data/profile.json`, which browsers block over
`file://`. The site will show an on-page message telling you this if it happens.)

To stop the server, press `Ctrl+C`.

## The one file you edit: `data/profile.json`

Everything on the site and in the resume — your name, roles, experience, projects, skills,
education, awards — comes from this single file. Edit it, refresh your browser, and the
site updates. No other file needs to change for content edits.

| `profile.json` key | Controls |
| --- | --- |
| `meta.*` | Page title, description, SEO tags, OpenGraph image, theme colors |
| `profile.name` / `shortName` / `initials` | Hero heading, nav brand, monogram fallback |
| `profile.roles[]` | The typing-effect role rotator in the hero |
| `profile.tagline` | One-line sentence under the role |
| `profile.avatar` | Path to your photo (falls back to a monogram if missing/broken) |
| `profile.resumeFile` | Path to the generated PDF (download button + `npm run pdf` output) |
| `profile.availability` | The green pill in the hero |
| `profile.socials[]` | Icon row in hero, footer, and contact section |
| `profile.summary[]` | Bullet list in the About section (and resume Profile Summary) |
| `stats[]` | The four animated counters below the hero |
| `experience[]` | Career timeline. `highlights` = day-to-day, `achievements` = outcomes shown in the accent panel. `current: true` gives the pulsing dot |
| `projects[]` | Project cards. `featured: true` adds a badge. `responsibilities` sit behind a "Responsibilities" disclosure |
| `skillGroups[]` | Skill bars **and** the radar chart (levels are 0–100 estimates — edit freely) |
| `skillTags[]` | The tag cloud under the radar chart |
| `otherSkills[]` | Small cards in the About section |
| `education[]`, `awards[]` | Education & Awards section, and resume sections of the same name |
| `personal.*` | Details panel in About, and the resume's Personal Details section |
| `contact.*` | Contact heading/blurb, and whether the phone number is shown |
| `github.*` | Which GitHub username's repos to show, how many, sort/exclude rules |
| `resumeOptions.*` | Toggle whether the PDF includes Education / Awards / Personal Details, plus a footer note |

## Swapping in your photo

1. Put your photo at `assets/img/avatar-source.jpg` (or `.png`).
2. Run `npm run avatar`. This crops it, removes the background, and composites it onto a
   studio-style gradient backdrop matching the site's palette, then saves the result to
   `assets/img/avatar.jpg`.
3. If you don't run this step (or the image fails to load for any reason), the hero
   automatically falls back to a styled monogram of your initials — nothing breaks.

Tuning knobs (crop box, feather radius, tint strength, rim light, color grading) are all
named constants at the top of `scripts/generate-avatar.mjs`, with comments explaining each.

## Enabling the contact form

The form works out of the box with **no backend**: without a Formspree endpoint configured,
submitting it opens the visitor's email client with a pre-filled `mailto:` message instead.

To wire up real form submissions:

1. Create a free form at [formspree.io](https://formspree.io) and copy your endpoint URL.
2. Paste it into `contact.formspreeEndpoint` in `data/profile.json`.
3. Refresh — the form now POSTs to Formspree, with the `mailto:` behavior kept as an
   automatic fallback if that request ever fails.

## How the resume PDF is produced

```bash
npm run pdf
```

This starts the local server, opens `resume.html` in headless Chrome, and prints it to
`assets/resume/<name from profile.json>.pdf` — a real, text-selectable, ATS-parseable PDF
(not an image). Run this again any time you change `profile.json` and want the PDF to match.

If Chrome isn't found automatically, point to it explicitly:

```bash
CHROME_PATH="/path/to/chrome" npm run pdf
```

## Publishing to GitHub Pages

1. Create a new GitHub repository and push this project to it:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
2. In the repo, go to **Settings → Pages** and set the source to **GitHub Actions**.
3. The included workflow (`.github/workflows/deploy.yml`) will regenerate the resume PDF
   and OG image and deploy automatically on every push to `main`.

**Root domain (`<you>.github.io`)** — if your repo is named exactly `<you>.github.io`, the
site is served from the domain root and no URLs need to change.

**Sub-path (`<you>.github.io/<repo>/`)** — for any other repo name, GitHub serves the site
under a sub-path. Update `meta.siteUrl` in `data/profile.json` to include that sub-path
(e.g. `https://you.github.io/portfolio-kiran`), since it's used to build the canonical URL,
OpenGraph image URL, and sitemap.

## Customisation

| Want to change… | Edit |
| --- | --- |
| Colors / gradient | CSS custom properties at the top of `assets/css/styles.css` (`--grad-1` … `--grad-4`) |
| Fonts | `--font-sans` / `--font-mono` in the same file |
| Motion / animation speed | Look for `@keyframes` blocks in `styles.css`; all respect `prefers-reduced-motion` automatically |
| Section order | Reorder the `<section>` blocks in `index.html` (nav links use `href="#id"` and will still work in any order) |
| Light/dark default | The inline script in `<head>` of `index.html` — currently follows the OS preference on first visit, then remembers the user's choice |

## File tree

```
portfolio-kiran/
├─ index.html                 # portfolio shell (rendered by main.js)
├─ resume.html                # printable A4 resume shell (rendered by resume.js)
├─ data/profile.json          # ← the only file you edit for content
├─ assets/
│  ├─ css/styles.css          # site theme, layout, components, animation
│  ├─ css/resume.css          # print-optimized resume styles
│  ├─ js/main.js              # renders the portfolio from profile.json
│  ├─ js/resume.js            # renders the resume from profile.json
│  ├─ img/                    # favicon, avatar, og-image
│  └─ resume/                 # generated PDF lives here (committed to the repo)
├─ scripts/
│  ├─ server.mjs              # zero-dependency static dev server
│  ├─ chrome.mjs              # headless Chrome/Edge locator + runner
│  ├─ generate-pdf.mjs        # npm run pdf
│  ├─ generate-avatar.mjs     # npm run avatar
│  └─ generate-og.mjs         # npm run og
├─ .github/workflows/deploy.yml
├─ robots.txt, sitemap.xml, .nojekyll, .gitignore
├─ package.json                # scripts only — zero dependencies
└─ README.md
```

## Notes

- `assets/js/main.js` includes a couple of harmless `?debug…` query-param hooks
  (`debugFlat`, `debugScrollTo`, `debugOpenMenu`, `debugWidth`) used during development to
  screenshot-test the site in headless Chrome. They do nothing unless you type those exact
  query params into the URL yourself — safe to leave in, or strip out if you'd rather not
  carry them.
- Skill levels in `profile.json` were estimated from resume seniority/prominence — edit the
  `level` values (0–100) in `skillGroups` to taste.
