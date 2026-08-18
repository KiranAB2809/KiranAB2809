# Kiran AB — Personal Portfolio & Resume

> A **zero-dependency** personal portfolio website with auto-generated, ATS-friendly resume PDF.  
> All content comes from one file: **`data/profile.json`**.

---

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/KiranAB2809/portfolio.git
cd portfolio

# 2. Start the dev server (no npm install needed!)
npm start

# 3. Open your browser
#    Portfolio → http://127.0.0.1:5173
#    Resume    → http://127.0.0.1:5173/resume.html
```

> ⚠️ **Always open the site through the dev server.** Opening `index.html` directly via `file://` will show an error because `fetch()` is blocked on the file protocol.

---

## npm Scripts

| Command | What it does |
|---------|-------------|
| `npm start` / `npm run dev` | Starts the local server at `http://127.0.0.1:5173` |
| `npm run pdf` | Regenerates `assets/resume/Kiran_AB_Resume.pdf` from `profile.json` |
| `npm run avatar` | Re-processes your portrait photo → `assets/img/avatar.jpg` |
| `npm run og` | Regenerates the OpenGraph preview image → `assets/img/og-image.png` |
| `npm run build` | Runs `pdf` + `og` together (used by CI) |

---

## File Structure

```
portfolio/
├── index.html                 ← Portfolio shell (content injected by JS)
├── resume.html                ← Printable A4 resume shell
├── data/
│   └── profile.json           ← ✦ THE ONLY FILE YOU NEED TO EDIT ✦
├── assets/
│   ├── css/
│   │   ├── styles.css         ← All portfolio styles + 3 themes
│   │   └── resume.css         ← Print-optimised A4 resume styles
│   ├── js/
│   │   ├── main.js            ← Renders the portfolio from profile.json
│   │   └── resume.js          ← Renders the resume from profile.json
│   ├── img/
│   │   ├── avatar-source.jpg  ← Your original unedited photo (keep this!)
│   │   ├── avatar.jpg         ← Processed portrait (auto-generated)
│   │   ├── og-image.png       ← Social share preview (auto-generated)
│   │   └── favicon.svg        ← Browser tab icon
│   └── resume/
│       └── Kiran_AB_Resume.pdf ← Auto-generated resume PDF
├── scripts/
│   ├── server.mjs             ← Static dev server (Node built-ins only)
│   ├── chrome.mjs             ← Headless Chrome/Edge locator
│   ├── generate-pdf.mjs       ← PDF pipeline
│   ├── generate-avatar.mjs    ← Portrait pipeline
│   ├── generate-og.mjs        ← OG image pipeline
│   ├── avatar-template.html   ← Offscreen portrait render target
│   └── og-template.html       ← Offscreen OG card render target
├── .github/
│   └── workflows/
│       └── deploy.yml         ← GitHub Actions: auto-deploy to Pages
├── robots.txt
├── sitemap.xml
├── .nojekyll
├── .gitignore
└── README.md
```

---

## `data/profile.json` — Key Reference

Edit this one file to update everything on the site **and** the PDF resume.

| Key | Controls |
|-----|---------|
| `meta.title` | Browser tab title + OG title |
| `meta.description` | SEO meta description |
| `meta.siteUrl` | Canonical URL (update before deploying) |
| `meta.keywords` | SEO keywords array |
| `profile.name` | Your full name (hero, nav logo, footer) |
| `profile.role` | Primary job title |
| `profile.roles[]` | Cycling roles in the hero typing effect |
| `profile.tagline` | One-line hero tagline |
| `profile.availability` | The green pill in the hero (e.g. "Open to senior roles") |
| `profile.email` | Contact email, linked in About + Contact |
| `profile.phone` | Phone number (shown only if `contact.showPhone: true`) |
| `profile.location` | City shown in About sidebar |
| `profile.avatar` | Path to your portrait image |
| `profile.resumeFile` | Path to generated PDF (for Download button) |
| `profile.socials[]` | Social links — each needs `label`, `url`, `icon` (linkedin/github/mail) |
| `profile.summary[]` | Bullet points in the About section |
| `stats[]` | The animated counters strip (value, suffix, label) |
| `experience[]` | Work history — drives the timeline section |
| `experience[].current` | Set `true` to show pulsing dot on current role |
| `experience[].highlights[]` | Day-to-day responsibilities |
| `experience[].achievements[]` | Outcomes shown in the accent panel |
| `experience[].tech[]` | Tech chips on each role card |
| `projects[]` | Project cards grid |
| `projects[].featured` | Shows a ★ badge on the card |
| `skillGroups[]` | Animated skill bars + radar chart |
| `skillGroups[].skills[].level` | 0–100 estimate (editable — set to what feels right) |
| `skillTags[]` | Clickable tag cloud below the radar |
| `otherSkills[]` | Mini-cards in the About section |
| `education[]` | Education entries |
| `awards[]` | Awards & recognition entries |
| `personal` | Date of birth, nationality, languages, interests |
| `contact.formspreeEndpoint` | Your Formspree form ID (leave `""` for mailto fallback) |
| `contact.showPhone` | `true` to show phone in Contact section |
| `github.enabled` | `true` to show GitHub repos section |
| `github.username` | Your GitHub username |
| `github.maxRepos` | Max repos to display (default 6) |
| `github.excludeForks` | `true` to hide forked repos |
| `github.pinned[]` | Array of repo names to show first |
| `resumeOptions.includePersonalDetails` | Include personal details in PDF |
| `resumeOptions.includeAwards` | Include awards in PDF |
| `resumeOptions.footerNote` | Footer text on the PDF |

> **Skill levels** are editable estimates derived from seniority and usage. They are not scientific — tune them to feel accurate to you.

---

## Themes

The site ships with **three themes** cycled via the moon/sun button in the nav:

| Theme | Description |
|-------|-------------|
| `dark` | Deep purple-navy with violet/cyan gradients (default) |
| `light` | White with purple/teal accents |
| `offwhite` | Warm cream/parchment editorial feel |

Your choice persists in `localStorage`. On first visit, it defaults to your OS preference (`prefers-color-scheme`).

**To add a custom colour:** edit the CSS custom properties in `assets/css/styles.css` under `[data-theme="dark"]` / `[data-theme="light"]` / `[data-theme="offwhite"]`.

---

## Swapping Your Photo

1. Place your new photo as `assets/img/avatar-source.jpg` (or `.png`)
2. Open `scripts/avatar-template.html` and adjust the `CROP` constant at the top:
   ```js
   const CROP = { x: 0, y: 0, w: 800, h: 1000 };
   // x, y = top-left pixel of crop; w/h = crop size in source pixels
   // Maintain 4:5 ratio (w * 1.25 = h)
   ```
3. Tune the other knobs if needed:
   ```js
   const FEATHER = 2;    // mask edge softness (px)
   const TINT    = 0.08; // brand colour overlay (0–1, keep low)
   const RIM     = 0.18; // rim light strength (keep ≤ 0.20)
   const SETTLE  = 3000; // wait time for render (ms)
   const MUTE    = 0.30; // clothing desaturation below collar (0–1)
   ```
4. Run: `npm run avatar`

If no photo is present, the hero falls back to a styled **KA monogram** automatically — nothing breaks.

---

## Enabling the Contact Form

The form falls back to `mailto:` by default. To use Formspree:

1. Go to [formspree.io](https://formspree.io) → create a free form
2. Copy your endpoint URL (e.g. `https://formspree.io/f/xpzgkdjw`)
3. In `data/profile.json`, set:
   ```json
   "contact": {
     "formspreeEndpoint": "https://formspree.io/f/xpzgkdjw"
   }
   ```
4. Refresh the site — the form will now POST to Formspree instead of opening your email client

---

## How the PDF is Produced

1. `npm run pdf` starts a temporary local server on a random port
2. It opens `resume.html?print=1` in **headless Chrome** (the one already installed on your machine)
3. Chrome renders the page using `resume.css` (A4 layout, sizes in pt) and exports to PDF
4. The PDF is saved to `assets/resume/Kiran_AB_Resume.pdf`
5. The file is text-based and ATS-parseable (never an image)

If Chrome isn't found automatically, set the path:
```powershell
$env:CHROME_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"
npm run pdf
```

---

## Publishing to GitHub Pages

### First time setup

1. Create a GitHub repo (e.g. `portfolio`)
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/KiranAB2809/portfolio.git
   git push -u origin main
   ```
3. In GitHub → **Settings → Pages → Source** → select `GitHub Actions`
4. The `deploy.yml` workflow will run automatically on every push to `main`

### URL Cases

| Case | Your URL | Files to update |
|------|----------|----------------|
| Root domain (`KiranAB2809.github.io`) | `https://KiranAB2809.github.io` | Set `meta.siteUrl` in `profile.json` |
| Sub-path (`KiranAB2809.github.io/portfolio`) | `https://KiranAB2809.github.io/portfolio` | Set `meta.siteUrl`; update `sitemap.xml` URLs |

> For sub-path deployments all asset links already use relative paths, so no other changes are needed.

---

## Customisation Reference

| What to change | Where |
|---------------|-------|
| Accent colours | `assets/css/styles.css` → CSS custom properties per `[data-theme]` |
| Fonts | Replace Google Fonts `<link>` in `index.html` + update `--font-sans`/`--font-mono` in CSS |
| Section order | Reorder `<section>` elements in `index.html` |
| Disable a section | Remove or comment out the `<section>` in `index.html` |
| Animated background blobs | `.blob-1/2/3` in `styles.css` — adjust size, colour, animation |
| Radar chart colours | `drawRadar()` in `assets/js/main.js` |
| Skill level estimates | `skillGroups[].skills[].level` in `profile.json` (0–100) |
| PDF page margins | `@page { margin: … }` in `assets/css/resume.css` |
| PDF font size | `body { font-size: … }` in `resume.css` |
| Disable motion | All animations respect `@media (prefers-reduced-motion: reduce)` automatically |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Site shows "Open via dev server" error | Run `npm start` and open `http://127.0.0.1:5173` |
| `npm run pdf` says Chrome not found | Set `$env:CHROME_PATH` to Chrome's full path |
| GitHub section shows fallback | GitHub API rate-limits unauthenticated requests. Wait an hour or add your token |
| Avatar looks like a sticker | Lower `RIM` to ≤ 0.18 and `TINT` to ≤ 0.06 in `avatar-template.html` |
| PDF text not selectable | Ensure `resume.html` renders before printing — increase `--virtual-time-budget` |

---

*Built with vanilla HTML, CSS & JavaScript. Zero npm dependencies. Zero build step.*
