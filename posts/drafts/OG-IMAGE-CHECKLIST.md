# Open Graph Image Checklist

## Required Dimensions
- **1200 x 630 pixels** (1.91:1 ratio)
- This is the standard for Facebook, LinkedIn, Twitter, and most platforms

## If Your Source Image is Square (e.g., 1024x1024)

**Option 1: Center with padding (recommended)**
```python
from PIL import Image

img = Image.open('images/your-image.png')

# Create 1200x630 canvas with white background
canvas = Image.new('RGB', (1200, 630), (255, 255, 255))

# Scale image to 80% of canvas height, maintain aspect ratio
target_height = int(630 * 0.80)
ratio = target_height / img.height
new_size = (int(img.width * ratio), target_height)
img_resized = img.resize(new_size, Image.LANCZOS)

# Center on canvas
x_offset = (1200 - img_resized.width) // 2
y_offset = (630 - img_resized.height) // 2
canvas.paste(img_resized, (x_offset, y_offset))

canvas.save('images/your-image-og.png')
```

**Option 2: Crop to fill (cuts off top/bottom)**
```python
from PIL import Image

img = Image.open('images/your-image.png')

# Resize to width 1200, maintain aspect ratio
ratio = 1200 / img.width
new_size = (1200, int(img.height * ratio))
img_resized = img.resize(new_size, Image.LANCZOS)

# Crop to 630 height from center
top = (img_resized.height - 630) // 2
img_cropped = img_resized.crop((0, top, 1200, top + 630))

img_cropped.save('images/your-image-og.png')
```

## Naming Convention
Use post-specific OG image names:
- `content-platform-og.png` 
- `azure-devops-og.png`
- `art-of-oner-og.png`

This prevents cache collisions with other posts.

## Cache-Busting Strategies (when updating an existing OG image)

Social platforms cache aggressively. In order of effectiveness:

1. **Use a new filename** (most reliable)
   - Change `post-og.png` to `post-og-v2.png`
   - Update the meta tag to match

2. **Add query string** (sometimes works)
   - `https://example.com/images/post-og.png?v=2`

3. **Force refresh on platform tools:**
   - Facebook: https://developers.facebook.com/tools/debug/ → "Scrape Again" (click 2-3x)
   - LinkedIn: https://www.linkedin.com/post-inspector/ → "Refresh"
   - Twitter: No manual refresh, caches ~7 days

## GitHub Pages Deployment
- Takes 1-2 minutes after push
- If stuck, force rebuild with empty commit:
  ```
  git commit --allow-empty -m "Trigger rebuild"
  git push origin main
  ```

## Meta Tag Template
```html
<meta property="og:image" content="https://golnazroughcut.com/images/POST-NAME-og.png">
```

## Testing Tools
- https://www.opengraph.xyz/
- https://developers.facebook.com/tools/debug/
- https://www.linkedin.com/post-inspector/
- https://cards-dev.twitter.com/validator

## Pre-Publish Checklist
- [ ] Image is exactly 1200x630
- [ ] Filename is unique to this post
- [ ] og:image meta tag uses full URL (https://...)
- [ ] Pushed to main and waited 2 min for deployment
- [ ] Tested on opengraph.xyz with correct dimensions showing
