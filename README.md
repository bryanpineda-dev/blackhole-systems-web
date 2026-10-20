# Blackhole Systems

Premium landing page for **Blackhole Systems**, a digital engineering studio focused on high-end interfaces, custom software systems, automation, API integrations, and connected business workflows.

This repository contains the Blackhole Systems website. It is a static front-end project built with HTML, modular CSS, vanilla JavaScript, and browser-first utility pages.

## Current Version

Website version: **1.0.4**

Deployment tag: `v1.0.4`

Release changes:

- Let project card frames follow each screenshot's intrinsic proportions, removing fixed-height letterboxing.
- Replace the tall modal image column with a compact README-style project sheet: title and summary, complete screenshot, technical metadata, implementation details, systems, stack, and links in one scroll area.
- Limit the dialog to 760px wide and 680px high, with smaller typography and responsive detail columns instead of oversized single-column content.
- Recapture Polyacril and Vision Territorial after decoding their CSS background images, not just their image tags.
- Restore project-zone logo hiding by observing the actual header band rather than requiring 10% of the entire archive to be visible; preserve navigation and footer behavior.
- Keep project codes, status, and the close control in a persistent header that does not cover the screenshot; reset scrolling when opening a project.
- Allow the existing contact action label to wrap at its separators on narrow screens while keeping both modal buttons side by side.
- Extend browser checks for complete previews, responsive geometry, reachable actions, persistent closing, and scroll reset across desktop, tablet, and mobile layouts.

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

The archive currently contains 17 projects. Each record has a `preview` object with a local image path and its intrinsic dimensions. The reviewed public-site screenshots live in `assets/images/projects/` and are shared by cards and detail modals through `renderProjectPreview`.

Card previews use native lazy loading; modal previews load when opened and reuse the same local asset. Images render at full width and automatic height, so their frames follow the original screenshot proportions without cropping, stretching, or side gutters. Missing-image fallbacks retain a 16:9 frame and the original category icon. Filters, project metadata, buttons, and modal keyboard behavior are preserved.

Project modals are compact README-style sheets, capped at 760px wide and 680px high within the viewport. A title and summary introduce the complete preview, followed by a semantic technical definition list, implementation and integration sections, technology tags, and the existing actions. Metadata and implementation sections use two columns where space allows and stack on narrow screens. The project code, status, and close button stay in a separate persistent header, outside the screenshot and scroll area. Opening a project resets the scroll position; on short viewports, the complete screenshot remains accessible through scrolling rather than being cropped to the viewport height.

The header hides only its logo while deployments overlap the header band, regardless of how tall the archive grows or which filter is selected. The observer updates after viewport resizing. Main navigation, the mobile menu control, and the independent footer visibility state retain their existing behavior. On small screens, the existing scroll-based logo hiding remains in effect outside deployments as well.

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

Quote requests use an `AbortController` with a 15-second deadline covering the request and response-body read. An optional `data-lead-timeout-ms` attribute on the quote form can override that deadline with a positive number of milliseconds. Concurrent submissions are ignored while a request is pending. Failures retain entered values, release the submit button, and allow a manual retry; successful responses clear the form. Retries are never automatic. A timeout does not prove that the admin failed to receive the request, so this client-side guard is not server-side deduplication.

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

- `assets/js/app.js` boots the main landing page, records successful initializers, and reports failures while continuing independent initializers.
- `assets/js/modules/page-boot.js` boots standalone tools or future pages through `data-page-boot` tokens with the same failure isolation and successful-initialization guards.
- `assets/js/modules/loader.js` owns normal loader timing and the idempotent `BH.completePageLoader` completion contract. Both bootstraps also have a minimal recovery path if the loader script itself is unavailable.

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

The project modal moves focus inside when opened, contains Tab/Shift+Tab, isolates background siblings using `inert`, and restores the opener on close. Pre-existing inert states are preserved. Its existing close button, backdrop, Escape key, and contact action remain available.

## Project Structure

```text
blackhole-web-v1/
├── index.html
├── package.json
├── package-lock.json
├── tests/
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

## Verification

The website remains static and has no build step. Node.js 22 or newer and the development dependencies are only needed to run checks:

```bash
npm ci
npm test
npm run test:browser
```

`npm test` checks authored JavaScript syntax, local references, markup IDs and JSON, portfolio and preview-asset contracts, assistant routing, release-document consistency, and landing boot isolation. `npm run test:browser` covers loader timing/recovery, standalone boot isolation, modal keyboard behavior, all 17 card/modal previews and image-failure recovery, quote success/failure/timeout/retry paths, and landing/QR behavior at desktop and mobile widths, including PNG/SVG export. Preview composition checks also cover 320, 768, 1024, and 1920px widths and a short mobile landscape viewport, including full-width intrinsic image sizing, compact README hierarchy, responsive detail columns, single scrolling, reachable actions, an unobstructed close control, and scroll reset between projects. Header checks cover project entry/exit, tall archives, filters, viewport resizing, the existing mobile scroll rule, and returning from the footer.

Browser checks use installed Google Chrome by default. To use Playwright Chromium instead, run `npx playwright install chromium`, then `PLAYWRIGHT_CHANNEL=chromium npm run test:browser` in Git Bash. Playwright is pinned as a development-only dependency in the lockfile.

Browser fixtures intercept repository resources at `http://blackhole.test`; no HTTP server is started. All external requests are blocked, and quote responses are simulated so no real leads are submitted. These checks do not certify the production admin API, CDN availability, or GPU rendering on physical devices. Optional `BLACKHOLE_QA_DIR` selects an output directory for desktop/mobile review screenshots; no generated screenshots are needed in production.

Run both suites with `npm run test:all` before publishing a version. Keep `node_modules/`, test tooling, and local review artifacts out of the hosted static site's public document root.

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

For version 1.0.4, the branch and tag are published with `git push origin main v1.0.4`. Published version tags remain attached to their original commit; subsequent commits receive a new version and tag.

## Deployment Roadmap

1. Prepare and publish each version using the documented release workflow.
2. Keep the GitHub Pages preview available for quick mobile and public testing.
3. Connect deployment to the production domain: `blackholesys.com`.
4. Publish to the SERED hosting environment once SSH/hosting access is configured.

## Status

In active development.

---

Built by Bryan Pineda for Blackhole Systems.
