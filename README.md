# Blackhole Systems

Premium landing page for **Blackhole Systems**, a digital engineering studio focused on high-end interfaces, custom software systems, automation, API integrations, and connected business workflows.

This repository is the first public version of the Blackhole Systems website. It is currently a static front-end project built with HTML, modular CSS, and vanilla JavaScript.

## Overview

Blackhole Systems presents a developer-led service offering that does not lock itself into a single stack. The brand direction is technical, premium, dark, and cinematic, with a strong focus on polished UX/UI and production-ready execution.

## Features

- Responsive landing page
- Cinematic hero section with optimized video assets
- Modular section-based CSS architecture
- Custom cursor and page loader
- Scroll reveal motion system
- Services, workflow, projects, testimonials, and contact sections
- Image-based Earth horizon background with CSS star motion in the contact area
- Mobile-first cleanup for overflow-safe responsive behavior

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
│   │   └── sections/
│   ├── images/
│   └── js/
│       ├── app.js
│       └── modules/
```

## Local Preview

Because this is a static site, it can run from any local static server.

```bash
python -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000
```

## Deployment Roadmap

1. Keep versioning the landing page locally.
2. Push stable versions to GitHub.
3. Connect deployment to the production domain: `blackholesys.com`.
4. Publish to the SERED hosting environment once SSH/hosting access is configured.

## Status

In active development.

---

Built by Bryan Pineda for Blackhole Systems.
