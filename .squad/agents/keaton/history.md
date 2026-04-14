# Keaton — History

## Project Context

- **Project:** golnazwebsite — Personal blog about video production, AI, and creative workflows
- **Owner:** Golnaz
- **Stack:** Static HTML, CSS
- **Focus:** SEO and performance improvements

## Learnings

<!-- Append learnings below this line -->

### 2026-04-14 — Site Architecture Audit

**Key Patterns Discovered:**
- Posts live in `posts/` directory, drafts in `posts/drafts/`
- All posts follow consistent template: meta tags → OG tags → optional structured data → GA → content
- Structured data (BlogPosting schema) present on 8 of 10 posts; `copilot-cli-vs-vscode.html` and `ai-in-video-production.html` missing it
- Person schema on index.html (good for name-based search)
- Images stored in `images/` directory, all PNG format
- Single CSS file at root: `styles.css`

**Architecture Decisions:**
- Static HTML site hosted on GitHub Pages — no build step
- Manual sitemap.xml and feed.xml maintenance required
- No lazy loading or image optimization in place
- Favicon implementation inconsistent across pages

**Critical File Paths:**
- Main entry: `index.html`
- About page: `about.html`
- Published posts: `posts/*.html`
- Sitemap: `sitemap.xml`
- RSS Feed: `feed.xml`
- Robots: `robots.txt`
- Styles: `styles.css`

