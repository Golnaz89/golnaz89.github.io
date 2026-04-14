# Hockney — History

## Project Context

- **Project:** golnazwebsite — Personal blog about video production, AI, and creative workflows
- **Owner:** Golnaz
- **Stack:** Static HTML, CSS
- **Focus:** Testing and validation — Lighthouse audits, SEO validation, cross-browser checks

## Learnings

<!-- Append learnings below this line -->

### 2026-04-14: SEO & Performance Validation

**Context:** Validated McManus's SEO audit and Fenster's performance optimizations.

**Key validation checks:**
- Sitemap: Cross-reference published posts against sitemap.xml entries
- RSS: Verify required elements (title, link, pubDate, guid, description) are present
- JSON-LD: Check BlogPosting schema has headline, author, datePublished, publisher
- Lazy loading: Hero/above-fold images should NOT have `loading="lazy"`; below-fold images should

**Insight:** Hero image detection requires reading HTML structure, not just grepping for `loading="lazy"`. Images in `<figure class="post-hero">` or immediately after headers are above-fold.
