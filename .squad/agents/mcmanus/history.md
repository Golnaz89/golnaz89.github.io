# McManus — History

## Project Context

- **Project:** golnazwebsite — Personal blog about video production, AI, and creative workflows
- **Owner:** Golnaz
- **Stack:** Static HTML, CSS
- **Focus:** SEO improvements — meta tags, structured data, social cards

## Learnings

<!-- Append learnings below this line -->

### 2026-04-14: SEO Audit Fixes

- **Favicon convention:** Posts use relative paths (`../favicon.svg`, `../apple-touch-icon.svg`) while root pages use root-relative (`favicon.svg`, `apple-touch-icon.svg`)
- **RSS autodiscovery placement:** Goes after structured data JSON-LD block, before the stylesheet link
- **BlogPosting schema:** Consistent pattern across site uses Person type for both author and publisher with Twitter URL
- **Feed.xml already had kill-your-ego post** - audit may have been stale; double-check audit freshness next time
- **OG image paths:** Mix of absolute URLs and relative paths in use; relative paths (`/images/...`) are preferred for portability
