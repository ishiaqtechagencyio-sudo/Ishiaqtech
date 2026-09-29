# IshiaqTech Website

Marketing site for **IshiaqTech**: Data. Intelligence. Digital.

It's a static site (HTML, CSS and vanilla JS) with no build step and no dependencies.

```
index.html            # page markup, SEO meta and JSON-LD
assets/css/styles.css # all styles (design tokens live in :root)
assets/js/main.js     # interactivity
```

## Features
- Animated hero with a live-updating dashboard and rotating headline
- **Interactive demo dashboard**: switch metric, region and period to see KPIs, the chart, tooltips and auto-generated insights update (sample data)
- Case studies you can filter by category
- Engagement packages that prefill the contact form
- Contact form (Formspree) with inline validation, service chips, a spam honeypot and inline success/error messages
- WhatsApp, email and phone links
- Scroll progress bar, active nav highlighting, reveal animations, back-to-top button
- SEO: meta, Open Graph and schema.org `ProfessionalService` structured data
- Accessibility: skip link, keyboard-friendly controls, ARIA states and `prefers-reduced-motion` support
- Responsive from 320px phones to wide desktops

## Run locally
Open `index.html` in a browser, or run `python3 -m http.server` and visit http://localhost:8000.

## Launch on GitHub Pages
1. Merge this branch into `main`.
2. In the repo, go to **Settings → Pages**. Under *Build and deployment*, choose **Deploy from a branch**, then `main` and `/ (root)`, and save.
3. After a minute or two the site is live at https://ishiaqtechagencyio-sudo.github.io/Ishiaqtech/

Already set up for launch: canonical URL, social-share image (`assets/img/og-image.png`), favicon and Apple touch icon, `robots.txt`, `sitemap.xml`, a branded `404.html` and `.nojekyll`.

**Using a custom domain later?** Replace `https://ishiaqtechagencyio-sudo.github.io/Ishiaqtech/` in `index.html`, `robots.txt` and `sitemap.xml`, and change the `/Ishiaqtech/` links in `404.html` to `/`.

## Customise
- **Founder photo**: upload a portrait (4:5 ratio works best) as `assets/img/founder.jpg`. It replaces the "IT" monogram automatically.
- **Projects**: the "What we build" section shows example projects. When you have client work you can share (with permission), swap in the real names and results in the `#work` section of `index.html`.
- **Brand colours**: edit the variables at the top of `assets/css/styles.css`.
- **Form endpoint**: change the `action` URL on `#contactForm`.
