# Fenster — History

## Project Context

- **Project:** golnazwebsite — Personal blog about video production, AI, and creative workflows
- **Owner:** Golnaz
- **Stack:** Static HTML, CSS
- **Focus:** Performance improvements — Core Web Vitals, image optimization, resource loading

## Learnings

<!-- Append learnings below this line -->

### 2026-04-14 — Lazy Loading Implementation

**Task:** Add `loading="lazy"` to below-the-fold images across the site.

**Findings:**
- Audited 12 HTML files (index, about, 404, 10 published posts)
- Found 10 total `<img>` tags across the site
- 5 images are above-the-fold (hero/banner images, first visuals in posts) — left eager
- 5 images are below-the-fold (mid-content explanatory images) — added lazy loading

**Above-the-fold images (no lazy):**
- `index.html` — onairsign.png (site banner)
- `content-or-platform-first.html` — platform.png (top of post)
- `copilot-cli-vs-vscode.html` — copilotcli.png (lead image)
- `ndi-tools-unsung-hero.html` — nditools.png (hero figure)
- `storage-active-vs-archival.html` — storage.png (top visual)

**Below-the-fold images (added lazy):**
- `ai-in-video-production.html` — production.png
- `creative-team-azure-devops.html` — architectureforflow.png
- `ndi-tools-unsung-hero.html` — adiopoliocies.png, enable1.png
- `the-art-of-the-oner.html` — directorsonerwithouttext.png

**Key insight:** Blog posts with images at the very top of content (right after header) should be treated as above-the-fold because users see them immediately on page load before scrolling.
