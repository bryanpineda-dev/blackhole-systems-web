# Blackhole Systems

Premium landing page for **Blackhole Systems**, a digital engineering studio focused on high-end interfaces, custom software systems, automation, API integrations, and connected business workflows.

This repository is the first public version of the Blackhole Systems website. It is currently a static front-end project built with HTML, modular CSS, vanilla JavaScript, and browser-first utility pages.

## Overview

Blackhole Systems presents a developer-led service offering that does not lock itself into a single stack. The brand direction is technical, premium, dark, and cinematic, with a strong focus on polished UX/UI and production-ready execution.

## Features

- Responsive landing page
- Cinematic hero section with optimized video assets
- Modular section-based CSS architecture
- Custom cursor and page loader
- Scroll reveal motion system
- Services, workflow, projects, testimonials, and contact sections
- Floating assistant and direct WhatsApp access
- Blackhole QR Studio free browser-based utility
- Image-based Earth horizon background with CSS star motion in the contact area
- Optimized planetary About animation with WebP textures and viewport-aware pause behavior
- Mobile-first cleanup for overflow-safe responsive behavior

## Free Tools

### Blackhole QR Studio

`/tools/blackhole-qr/`

Blackhole QR Studio is a free static QR generator built directly into the site. It runs in the browser and does not store user data.

Current capabilities:

- URL, text, WhatsApp, and WiFi QR generation
- Live preview
- PNG and SVG download
- Custom QR and background colors
- Adjustable size and margin
- Optional center logo
- High error correction for logo-friendly QR codes

Trust message:

```text
Static QR codes are generated locally in the browser. They do not expire artificially, require no account, and include no watermark.
```

## Tech Stack

- HTML5
- CSS3 with modular imports
- Vanilla JavaScript modules
- Remix Icons and Font Awesome icons

## Project Structure

```text
blackhole-web-v1/
├── index.html
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   ├── variables.css
│   │   ├── base.css
│   │   ├── components.css
│   │   ├── animations.css
│   │   ├── responsive.css
│   │   ├── tools/
│   │   └── sections/
│   ├── images/
│   └── js/
│       ├── app.js
│       ├── modules/
│       └── tools/
└── tools/
    └── blackhole-qr/
```

## Local Preview

Because this is a static site, it can run from any local static server.

```bash
python -m http.server 5500
```

Then open:

```text
http://127.0.0.1:5500
```

QR Studio:

```text
http://127.0.0.1:5500/tools/blackhole-qr/
```

## Performance Notes

- About section planet textures use WebP versions for lighter animation cost.
- Orbital movement keeps the original front/back timing while using compositor-friendly translation.
- About orbit animation pauses when the section is outside the viewport or the tab is hidden.
- Motion-heavy sections include reduced-motion fallbacks where applicable.

## Deployment Roadmap

1. Keep versioning the landing page locally.
2. Push stable versions to GitHub.
3. Keep the GitHub Pages preview available for quick mobile and public testing.
4. Connect deployment to the production domain: `blackholesys.com`.
5. Publish to the SERED hosting environment once SSH/hosting access is configured.

## Status

In active development.

---

Built by Bryan Pineda for Blackhole Systems.
