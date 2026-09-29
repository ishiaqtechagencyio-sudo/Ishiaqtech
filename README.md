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

## Deploy
Works as-is on GitHub Pages, Netlify, Vercel or any static host.

## Customise
- **Founder photo**: add `assets/img/founder.jpg`, then follow the comment in the About section of `index.html`.
- **Brand colours**: edit the variables at the top of `assets/css/styles.css`.
- **Form endpoint**: change the `action` URL on `#contactForm`.
