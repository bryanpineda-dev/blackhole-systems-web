# Blackhole Systems

Premium landing page for **Blackhole Systems**, a digital engineering studio focused on high-end interfaces, custom software systems, automation, API integrations, and connected business workflows.

This repository contains the Blackhole Systems website. It is a static front-end project built with HTML, modular CSS, vanilla JavaScript, and browser-first utility pages.

## Current Version

Website version: **1.0.1**

Deployment tag: `v1.0.1`

Release changes:

- Update the project archive to 17 projects.
- Remove My Choice CR from the project archive while preserving its real testimonial.
- Add Troleando por Mexico as an in-progress travel website with a destination catalog, galleries, and WhatsApp inquiry flows.
- Add Vision Territorial as a deployed agency collaboration with a custom WordPress plugin, PDF-based canton search, and local data storage.
- Establish detailed English commit messages, annotated deployment tags, and README reviews for every new version.
- Correct the interaction documentation to reflect both mouse and touch card tilt.

## Overview

Blackhole Systems presents a developer-led service offering that does not lock itself into a single stack. The brand direction is technical, premium, dark, and cinematic, with a strong focus on polished UX/UI and production-ready execution.

## Features

- Responsive landing page
- Cinematic WebGPU/Three.js blackhole hero with static image fallback
- Modular section-based CSS architecture
- Custom cursor and page loader
- Shared page boot layer for standalone pages and tools
- Scroll reveal motion system with page-specific presets
- Services, workflow, projects, testimonials, and contact sections
- Floating assistant and direct WhatsApp access
- Project quote form wired to the Blackhole Systems Admin lead API
- Footer Signal Log newsletter capture via email handoff
- Blackhole QR Studio free browser-based utility
- Image-based Earth horizon background with CSS star motion in the contact area
- Optimized planetary About animation with WebP textures and viewport-aware pause behavior
- Mobile-first cleanup for overflow-safe responsive behavior

## Project Archive

The portfolio has its own curated dataset in `assets/js/modules/projects-data.js`. Shared rendering, filtering, and modal modules consume that list, including the project counter and detail metadata.

The archive currently contains 17 projects. Project cards and modals use category icons as preview placeholders. Desktop screenshots for all 17 projects have been prepared as local review artifacts outside this repository; integrating preview images into the website remains pending.

## Free Tools

### Blackhole QR Studio

`/tools/blackhole-qr/`

Blackhole QR Studio is a free static QR generator built directly into the site. It runs in the browser and does not store user data.

The tool uses the shared page boot layer for the Blackhole loader, custom cursor, star field, and scroll reveal behavior while keeping QR-specific logic isolated in `assets/js/tools/qr-studio.js`.

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

## Lead Capture

The main project quote form sends inquiries to the Blackhole Systems Admin lead intake API.

Local endpoint:

```text
http://127.0.0.1:8020/api/leads
```

Production endpoint:

```text
https://admin.blackholesys.com/api/leads
```

The landing and admin must share this channel:

```text
blackhole-web-quote
```

The footer Signal Log newsletter currently opens an email handoff to `info@blackholesys.com`. The intended next step is to connect this newsletter capture to the admin so collected emails can be managed for future email marketing.

## Tech Stack

- HTML5
- CSS3 with modular imports
- Vanilla JavaScript modules
- Namespace-based browser scripts registered on `window.BlackholeSystems`
- Local Three.js/WebGPU vendor files for the blackhole hero
- Remix Icons and Font Awesome icons

## JavaScript Architecture

The site does not use a bundler. JavaScript is organized as browser-loaded scripts that register public initializers on `window.BlackholeSystems`.

Primary bootstrap files:

- `assets/js/app.js` boots the main landing page and guards initializers so each feature runs once.
- `assets/js/modules/page-boot.js` boots standalone tools or future pages through `data-page-boot` tokens.

Current module groups:

- `assets/js/modules/assistant/` owns assistant data, routing, handoff formatting, and UI state.
- `assets/js/modules/forms/` separates the project quote form from the newsletter handoff while preserving `BH.initFormHandler`.
- `assets/js/modules/effects/` owns reusable and landing motion effects such as star fields, comet fields, tactical grid pulse, and shared visibility gates.
- `assets/js/modules/reveal.js` is the shared reveal engine.
- `assets/js/modules/reveal-landing.js` registers landing reveal presets.
- `assets/js/modules/reveal-qr.js` registers QR Studio reveal presets.
- `assets/js/modules/landing-motion.js` owns landing-only motion observers and telemetry counters.
- `assets/js/modules/projects-*.js` keeps project data, rendering, filtering, modal behavior, and bootstrap separated.
- `assets/js/tools/qr-studio.js` owns QR Studio behavior and stays independent from the landing app bootstrap.

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
│   │   ├── sections.css
│   │   ├── utilities.css
│   │   ├── tools/
│   │   └── sections/
│   ├── images/
│   ├── vendor/
│   └── js/
│       ├── app.js
│       ├── modules/
│       │   ├── assistant/
│       │   ├── effects/
│       │   ├── forms/
│       │   ├── projects-*.js
│       │   ├── page-boot.js
│       │   ├── reveal.js
│       │   ├── reveal-landing.js
│       │   ├── reveal-qr.js
│       │   └── landing-motion.js
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

- The hero uses a local Three.js/WebGPU renderer with a static fallback image for unsupported browsers.
- About section planet textures use WebP versions for lighter animation cost.
- Orbital movement keeps the original front/back timing while using compositor-friendly translation.
- About orbit animation pauses when the section is outside the viewport or the tab is hidden.
- Star fields, comet fields, tactical grid pulse, scroll reveal, and card tilt are gated by viewport visibility and/or reduced-motion checks where applicable.
- Card tilt supports fine-pointer mouse input and touch gestures, respects reduced-motion preferences, and avoids duplicate event listeners per card.

## Local Lab

Experimental prototypes live in `prototypes/` and are intentionally kept local while ideas are being tested.

## Versioning And Releases

Every commit must have a detailed English subject and body, a distinct website version, and a matching annotated deployment tag using `vMAJOR.MINOR.PATCH`.

For every new version, review this README against the actual implementation. Update the current version, release changes, and any affected feature, architecture, interaction, or integration documentation. Keep implemented behavior and pending work clearly identified.

Bryan performs commits, tag creation, and pushes manually. Agents provide complete Git Bash commands covering the changed files, the detailed English commit message, an English tag annotation, and the push of the branch and its specific tag together.

For version 1.0.1, the branch and tag are published with `git push origin main v1.0.1`. Published version tags remain attached to their original commit; subsequent commits receive a new version and tag.

## Deployment Roadmap

1. Prepare and publish each version using the documented release workflow.
2. Keep the GitHub Pages preview available for quick mobile and public testing.
3. Connect deployment to the production domain: `blackholesys.com`.
4. Publish to the SERED hosting environment once SSH/hosting access is configured.

## Status

In active development.

---

Built by Bryan Pineda for Blackhole Systems.
