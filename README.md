# Golnaz.RoughCut

A personal blog built with simple HTML and CSS, hosted on GitHub Pages.

## 🚀 Quick Start

### Adding a New Blog Post

1. **Create a new HTML file** in the `posts/` folder (copy `welcome-to-my-blog.html` as a template)
2. **Update the post content**:
   - Change the `<title>` tag
   - Update the date in `<time datetime="YYYY-MM-DD">`
   - Write your content inside `<div class="post-content">`
3. **Add the post to the homepage** (`index.html`):
   - Add a new `<article class="post-preview">` block with the date, title, and preview text

### Example: Adding a New Post

Create `posts/my-new-post.html`:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My New Post Title - Golnaz.RoughCut</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <div class="wrapper">
        <a href="../index.html" class="back-link">Back to all posts</a>

        <article class="post">
            <header class="post-header">
                <time datetime="2026-01-10">10 January 2026</time>
                <h1>My New Post Title</h1>
            </header>

            <div class="post-content">
                <p>Your content goes here...</p>
            </div>
        </article>

        <footer>
            <p><a href="../index.html">Golnaz.RoughCut</a> · Hosted on GitHub Pages</p>
        </footer>
    </div>
</body>
</html>
```

Then add to `index.html` (at the top of the posts section):
```html
<article class="post-preview">
    <time datetime="2026-01-10">10 January 2026</time>
    <h2><a href="posts/my-new-post.html">My New Post Title</a></h2>
    <p>Preview text for your post...</p>
</article>
```

## 📝 Formatting Tips

In your post content, you can use:

- `<p>` for paragraphs
- `<h2>` and `<h3>` for section headings
- `<ul>` or `<ol>` for lists
- `<a href="url">link text</a>` for links
- `<strong>bold</strong>` for bold text
- `<em>italic</em>` for italic text
- `<blockquote>` for quotes
- `<code>` for inline code
- `<pre><code>` for code blocks
- `<img src="url" alt="description">` for images

## 🌐 Deploying to GitHub Pages

### First Time Setup

1. **Create a new repository** on GitHub named `golnaz89.github.io` (for a personal site) or any other name
2. **Initialize Git** in this folder:
   ```bash
   cd c:\golnazwebsite
   git init
   git add .
   git commit -m "Initial blog setup"
   ```
3. **Connect to GitHub**:
   ```bash
   git remote add origin https://github.com/Golnaz89/golnaz89.github.io.git
   git branch -M main
   git push -u origin main
   ```
4. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **main** branch
   - Click **Save**
   - Your site will be live at `https://golnaz89.github.io/`

### Updating Your Blog

After making changes:
```bash
git add .
git commit -m "Add new post: Title of your post"
git push
```

## 📁 File Structure

```
golnazwebsite/
├── index.html          # Homepage with list of posts
├── styles.css          # All styling
├── posts/              # All blog posts go here
│   └── welcome-to-my-blog.html
└── README.md           # This file
```

## 🎨 Customization

### Change Colors
Edit the CSS variables at the top of `styles.css`:
```css
:root {
    --primary-color: #333;      /* Main text color */
    --secondary-color: #666;    /* Secondary text */
    --accent-color: #4078c0;    /* Links and highlights */
    --background-color: #fff;   /* Background */
    --border-color: #e5e5e5;    /* Borders */
}
```

### Change Tagline
Edit the `.tagline` text in `index.html`.

### Add More Social Links
Edit the `.social-links` section in `index.html`.

---

Happy blogging! ✍️
