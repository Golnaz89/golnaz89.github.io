# Blog Drafts

This folder contains draft blog posts that are NOT yet published.

## Workflow

1. **Write drafts here** - Create new `.html` files in this folder
2. **When ready to publish** - Move the file to `/posts/` and merge to `main`

## Draft Posts (Scheduled)

| Date | Post | File |
|------|------|------|
| Jan 5 ✓ | Year 15: Why I'm Finally Hitting Publish | *published* |
| Jan 12 | What AI Has (and Hasn't) Taken Over in Video Production | ai-in-video-production.html |
| Jan 26 | The Art of the Oner | the-art-of-the-oner.html |
| Feb 2 | What Came First: The Content or the Platform? | content-or-platform-first.html |
| Feb 9 | How a Creative Team Learned to Love Azure DevOps | creative-team-azure-devops.html |
| Feb 23 | Active vs Archival Storage | storage-active-vs-archival.html |
| Mar 2 | I Spent $50 on AI Video Generation and Got Nothing Usable | ai-video-generation-reality-check.html |
| Mar 9 | NDI Tools | *tbd* |
| Mar 16 | If You Had an Event and Didn't Capture It, Did It Even Happen? | capture-your-events.html |
| Mar 23 | Where Are the Women in Video Production? | women-in-video-production.html |

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
