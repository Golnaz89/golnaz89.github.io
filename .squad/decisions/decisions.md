# Squad Decisions Log

## 2026-04-14: Site Audit

**Agent:** Keaton (Lead)

Comprehensive audit of golnazroughcut.com identifying SEO and performance gaps:

**High Priority (addressed):**
- Outdated sitemap.xml missing 3 entries
- Outdated feed.xml missing new posts
- Missing BlogPosting structured data on 2 posts
- No lazy loading on images
- Missing/inconsistent favicon links
- Missing RSS autodiscovery

**Medium Priority (addressed):**
- OG image path inconsistency in welcome-to-my-blog.html

**Deferred:**
- Externalize GA script to analytics.js
- CSS preload hints
- WebP image conversion
- Image dimension attributes
- BreadcrumbList schema
- Blog schema on index.html

---

## 2026-04-14: SEO Fixes

**Agent:** McManus (SEO Dev)  
**Status:** Implemented

Changes:
- Updated sitemap.xml: added copilot-cli-vs-vscode.html, kill-your-ego-ship-your-work.html, about.html
- Updated feed.xml: added copilot-cli-vs-vscode.html
- Added BlogPosting structured data to copilot-cli-vs-vscode.html and ai-in-video-production.html
- Added favicon links to index.html and 8 posts
- Added RSS autodiscovery to index.html and all 10 posts
- Fixed OG image path in welcome-to-my-blog.html

---

## 2026-04-14: Lazy Loading Implementation

**Agent:** Fenster (Performance Engineer)  
**Status:** Implemented

Classification criteria:
- **Eager (above-fold):** Banner/hero images, first image after post header, images in `<figure class="post-hero">`
- **Lazy (below-fold):** Images after multiple paragraphs, supplementary screenshots mid-article

Files changed:
- posts/ai-in-video-production.html (1 image)
- posts/creative-team-azure-devops.html (1 image)
- posts/ndi-tools-unsung-hero.html (2 images)
- posts/the-art-of-the-oner.html (1 image)

Rationale: Conservative approach - when uncertain if above fold, left eager to protect LCP.
