# Blog Drafts

This folder contains draft blog posts that are NOT yet published.

## Workflow

1. **Write drafts here** - Create new `.html` files in this folder
2. **When ready to publish** - Move the file to `/posts/` and merge to `main`

## Draft Posts (Scheduled)

| File | Topic | Target Publish Date |
|------|-------|---------------------|
| ai-in-video-production.html | AI in video: what works, what doesn't, wishlist | Jan 12, 2026 |
| women-in-video-production.html | Women in video production, representation | Jan 19, 2026 |
| storage-active-vs-archival.html | Active vs archival storage, Azure File Sync | Jan 26, 2026 |
| ai-video-generation-reality-check.html | Runway, Pika, AI video generation reality | Feb 2, 2026 |
| content-or-platform-first.html | Content vs platform, Channel 9 days | Feb 9, 2026 |
| capture-your-events.html | Why you should record event sessions | Feb 16, 2026 |
| the-art-of-the-oner.html | The craft of the single-shot, philosophy of raw storytelling | Feb 23, 2026 |
| creative-team-azure-devops.html | Our process, Azure DevOps, Power Automate, GPT-5 workflows | Mar 2, 2026 |

## Publishing Checklist

### Before Publishing
- [ ] Proofread the post
- [ ] Check all links work
- [ ] Verify date is correct in `<time datetime="">`

### Create OG Image (1200x630)
- [ ] Create social share image using `production.png` or relevant visual
- [ ] Save as `images/[post-name]-og.png`
- [ ] Update `<meta property="og:image">` in the post HTML

### Move to Main Branch
- [ ] Switch to `main` branch
- [ ] Copy new images from `images/` on drafts to `images/` on main
- [ ] Copy HTML file from `drafts/` to `posts/`
- [ ] Update image paths: `../../images/` → `../images/`
- [ ] Update canonical URL: remove `/drafts` from path
- [ ] Add post preview to `index.html` (copy format from existing post)
- [ ] Commit and push to `main`

### Verify Live Site
- [ ] Check post at `golnazroughcut.com/posts/[post-name].html`
- [ ] Test OG image at https://opengraph.xyz

### Promote on Social
- [ ] **LinkedIn post**
  - Hook: Why this matters to your audience
  - Key insight from the post
  - Link to post
  - Relevant hashtags (#VideoProduction #DevRel etc.)
  
- [ ] **X/Twitter post**
  - Shorter hook (under 280 chars with link)
  - Link to post
  - Tag relevant accounts if applicable

### Optional
- [ ] Cross-post to dev.to or Medium
- [ ] Share in relevant Slack/Discord communities
- [ ] Update RSS feed if needed
