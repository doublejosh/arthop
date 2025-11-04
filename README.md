# ArtHop - Camano Island, WA

A full-screen, visually immersive one-file website featuring layered parallax backgrounds and centered floating text.

## Overview

This project is a single-file HTML website that includes all CSS and JavaScript inline. It features:
- Multi-layered parallax background images
- Mouse/touch-based parallax effects
- Responsive design for mobile and desktop
- Centered bottom text content
- Full meta tags for SEO and social sharing

## Quick Start

1. Open `index.html` in a web browser
2. Move your mouse around to see the parallax effect
3. On mobile, touch and drag to interact with the layers

## Customization

### Changing Background Images

The website uses three layered background images. To replace them, update the URLs in the CSS section:

```css
.bg-layer-1 {
    background-image: url('YOUR_IMAGE_URL_HERE');
}
.bg-layer-2 {
    background-image: url('YOUR_IMAGE_URL_HERE');
}
.bg-layer-3 {
    background-image: url('YOUR_IMAGE_URL_HERE');
}
```

**Image Tips:**
- Use high-resolution images (1920px+ width recommended)
- Keep file sizes optimized for web (<500KB each)
- Consider using local images instead of URLs for faster loading
- Adjust `opacity` values (0.3, 0.4, 0.5) to control layer visibility

### Modifying Text Content

Update the main content in the HTML section:

```html
<div class="content">
    <h1>ArtHop</h1>
    <div class="subtitle">Camano Island, WA</div>
    <div class="description">
        Your description here...
    </div>
    <a href="#explore" class="cta-button">Your Button Text</a>
</div>
```

### Adjusting Colors and Styling

**Text Colors:** Modify the `.content` class:
```css
.content {
    color: white; /* Change text color */
}
```

**Overlay Gradient:** Adjust the `.overlay` gradient:
```css
.overlay {
    background: linear-gradient(
        to bottom,
        rgba(0, 0, 0, 0.2) 0%,    /* Top darkness */
        rgba(0, 0, 0, 0.4) 70%,   /* Middle */
        rgba(0, 0, 0, 0.7) 100%   /* Bottom darkness */
    );
}
```

**Button Styling:** Update `.cta-button` for different button appearance

### Meta Tags and SEO

Update the meta tags in the `<head>` section:

```html
<meta name="description" content="Your description">
<meta name="keywords" content="your, keywords, here">
<meta name="author" content="Your Name">

<!-- Open Graph -->
<meta property="og:url" content="https://your-domain.com/">
<meta property="og:title" content="Your Title">
<meta property="og:description" content="Your description">
<meta property="og:image" content="https://your-domain.com/og-image.jpg">

<!-- Twitter -->
<meta property="twitter:url" content="https://your-domain.com/">
<meta property="twitter:title" content="Your Title">
<meta property="twitter:description" content="Your description">
<meta property="twitter:image" content="https://your-domain.com/twitter-image.jpg">
```

### Parallax Speed

Adjust the `data-speed` attributes on the background layers for different parallax intensities:

```html
<div class="bg-layer bg-layer-1" data-speed="0.5"></div> <!-- Faster -->
<div class="bg-layer bg-layer-2" data-speed="0.3"></div> <!-- Medium -->
<div class="bg-layer bg-layer-3" data-speed="0.1"></div> <!-- Slower -->
```

Higher values = more movement

## Features

### Responsive Design
- Automatically adapts to mobile, tablet, and desktop screens
- Touch-enabled parallax for mobile devices
- Fluid typography using `clamp()` for perfect scaling

### Performance
- All assets in one file (no external dependencies)
- Optimized CSS animations
- Smooth parallax with hardware acceleration

### Accessibility
- Semantic HTML structure
- Proper meta tags for screen readers
- Keyboard navigation support (arrow keys)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Adding More Sections

To expand beyond a single screen:

1. Remove `overflow: hidden` from the `body` and `.container` styles
2. Add new sections below the existing content
3. Update the CTA button JavaScript to scroll to those sections

Example:
```html
<section id="explore" style="height: 100vh; background: white;">
    <!-- Your next section content -->
</section>
```

## Deployment

### Local Testing
Simply open `index.html` in your browser

### Web Hosting
1. Upload `index.html` to your web server
2. Ensure your domain is updated in the meta tags
3. Add actual social media preview images (og-image.jpg, twitter-image.jpg)
4. Add favicon files (favicon.png, apple-touch-icon.png)

### Recommended Hosts
- GitHub Pages (free)
- Netlify (free)
- Vercel (free)
- Any static hosting service

## Future Enhancements

- Add more content sections
- Include artist gallery
- Add event calendar
- Integrate contact form
- Add Google Maps for location
- Include social media feeds

## License

Update with your chosen license

## Contact

Update with your contact information
