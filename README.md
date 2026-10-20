# Blackhole Systems

Premium landing page for **Blackhole Systems**, a digital engineering studio focused on high-end interfaces, custom software systems, automation, API integrations, and connected business workflows.

This repository contains the Blackhole Systems website. It is a static front-end project built with HTML, modular CSS, vanilla JavaScript, and browser-first utility pages.

## Current Version

Website version: **1.0.8**

Deployment tag: `v1.0.8`

Release changes:

- Replace single-message keyword replies with a local guided advisor that separates service domains, intent and public project references.
- Retain visitor-provided context through quote, timeline and contact follow-ups, with explicit clarification and conversation reset.
- Add English/Spanish guidance, cover all nine service headings, and read project names, statuses and archive counts from the public dataset.
- Preserve the complete accepted context in reviewable WhatsApp drafts and offer the existing project form without submitting or overwriting it.
- Improve modeless keyboard entry, message-log semantics, long-token wrapping and bounded message handling without redesigning the panel.
- Serialize pending turns, preserve rejected/failed drafts, and expose direct contact when an assistant module is unavailable.
- Add conversation and browser fault-injection coverage; keep the existing service CTA and quote-form behavior unchanged.

## Overview

Blackhole Systems presents a developer-led service offering that does not lock itself into a single stack. The brand direction is technical, premium, dark, and cinematic, with a strong focus on polished UX/UI and production-ready execution.

## Features

- Responsive landing page
- Cinematic WebGPU/Three.js blackhole hero with static image fallback
- Modular section-based CSS architecture
- Custom cursor and page loader
- Shared page boot layer for standalone pages and tools
- Scroll reveal motion system with page-specific presets and opt-in reversible landing reveals
- Services, workflow, projects, testimonials, and contact sections
- Local guided project assistant with conversation context and direct WhatsApp access
- Contextual WhatsApp handoffs from service buttons and project detail modals
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

The mobile menu moves focus to its links, contains Tab/Shift+Tab across the menu and its close control, and isolates background/header siblings with `inert`. Closing through Escape, the backdrop, a navigation link, or the toggle releases only the inert states it owns. It restores focus to the toggle, or to desktop navigation when resized above the mobile breakpoint.

## Free Tools

### Blackhole QR Studio

`/tools/blackhole-qr/`

Blackhole QR Studio is a free static QR generator built directly into the site. It runs in the browser and does not store user data.

The tool uses the shared page boot layer for the Blackhole loader, custom cursor, star field, and scroll reveal behavior while keeping QR-specific logic isolated in `assets/js/tools/qr-studio.js`.

The workspace and FAQ contain their lateral reveal overflow with clip margins matched to the page gutters. This preserves the existing one-shot entrances and shadow space without letting offscreen panels widen the document or clipping the full-bleed hero.

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

Start Project actions in the header, mobile menu, hero, and Workflow still navigate to the quote form. The nine Request Service buttons instead use native `wa.me` links with the selected service and portfolio-site reference already encoded in the message. Start Similar Build in a project modal uses that project's name and code in its message; opening a different project replaces the context. Both handoffs open in a separate tab and preserve the existing visible labels, icons, hover styling, and modal-close behavior. They do not submit a lead or send a WhatsApp message automatically.

The quote form uses native POST rather than GET and starts with its submit button disabled. Its existing status area provides a direct WhatsApp fallback until the quote handler has attached successfully; initialization clears the fallback and enables submission. A missing quote script therefore cannot turn a normal click or Enter into a URL containing the visitor's details. The quote and project-modal script references carry release revisions so this markup does not reuse an older cached handler.

Required names and the project brief reject whitespace-only values. The browser enforces 80 characters per name field, 160 for the combined name, 190 for email, 60 for WhatsApp, and 3,000 for the project brief. The brief uses a submission-time limit rather than native paste truncation: longer text stays in the field and must be shortened before sending. These bounds follow the public intake contract without adding fields or changing the form layout. The companion admin validation introduced with website 1.0.7 checks the raw trimmed brief before appending source-page metadata and returns HTTP 422 for empty or over-limit briefs rather than silently truncating them; that admin validation must be deployed for matching server-side enforcement. Version 1.0.8 adds no new admin dependency.

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

Quote requests use an `AbortController` with a 15-second deadline covering the request and response-body read. An optional `data-lead-timeout-ms` attribute on the quote form can override that deadline with a positive number of milliseconds. Concurrent submissions are ignored while a request is pending. Failures retain entered values, release the submit button, and allow a manual retry. Confirmed success clears an unchanged form; if the visitor edited any values while waiting, those values remain and the status explains that the newer edits were not included in the accepted request. Retries are never automatic. A timeout does not prove that the admin failed to receive the request, so this client-side guard is not server-side deduplication.

The footer Signal Log newsletter currently opens an email handoff to `info@blackholesys.com`. The intended next step is to connect this newsletter capture to the admin so collected emails can be managed for future email marketing.

## Guided Project Assistant

The landing assistant is a deterministic local advisor, not a generative AI model. It uses no external AI provider, API key, backend conversation endpoint or dashboard client records. Its curated service knowledge covers the nine public service headings plus website, reservation, dashboard and WordPress inquiries. The public project archive is its sole source for project names, domains, summaries and statuses; project summaries retain their authored English text.

Routing treats service domains separately from price, timing, support and contact intent. Whole-keyword matching, clause-local negation and clarification replace substring scoring and duplicate-keyword weighting. Ambiguous service choices remain pending until resolved. These rules do not claim unrestricted language understanding; unclear requests are clarified instead of receiving invented facts, prices or delivery promises.

Conversation memory lasts only for the current page lifetime, survives closing/reopening the panel and is cleared by Start over or a reload. No local/session storage is used. Accepted visitor details, selected service, public reference and questions form a WhatsApp draft; later follow-ups and chips do not replace the earlier brief. Both in-message and floating WhatsApp links use that context. WhatsApp opens a visitor-reviewable draft and never sends automatically. The form action navigates to the existing quote section without pre-filling, overwriting or submitting any fields.

Each message is limited to 2,000 characters, accepted context to 6,000 characters and a conversation to 40 turns. Rejected drafts stay in the input and are never silently truncated. At the conversation limit, contact and Start over remain available. The visible message log is bounded independently. One response is pending at a time; a draft typed while waiting is preserved. Response errors allow manual retry. Missing feature modules expose a direct-contact fallback; if the bootstrap itself is missing, its native controls stay disabled while the independent WhatsApp link remains available.

The assistant keeps its existing colors, dimensions and motion. It uses component-local viewport-edge and panel-offset values. On screens up to 520px high, its open panel uses the available height, compacts header/composer spacing, and hides the floating shortcuts until closed. Opening moves focus to the visible close control at all viewport sizes, without opening the mobile keyboard. This is a modeless region with a focusable conversation log, not a focus-trapping dialog; Escape/close restore the opener. Long tokens wrap inside bubbles, and incoming replies do not force a visitor back to the bottom after they scroll up.

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

- `assets/js/modules/assistant/` separates curated public knowledge, pure routing, transactional session memory, response/handoff formatting, DOM interaction and bootstrap/fallback behavior. `BH.initFloatingAssistant` remains the landing initializer; the QR tool does not mount this feature.
- `assets/js/modules/forms/` separates the project quote form from the newsletter handoff while preserving `BH.initFormHandler`.
- `assets/js/modules/effects/` owns reusable and landing motion effects such as star fields, comet fields, tactical grid pulse, and shared visibility gates.
- `assets/js/modules/reveal.js` is the shared reveal engine.
- `assets/js/modules/reveal-repeat.js` provides the opt-in reversible lifecycle, loaded by the landing only.
- `assets/js/modules/reveal-landing.js` registers landing reveal presets.
- `assets/js/modules/reveal-qr.js` registers QR Studio reveal presets.
- `assets/js/modules/landing-motion.js` owns landing-only motion observers and telemetry counters.
- `assets/js/modules/projects-*.js` keeps project data, rendering, filtering, modal behavior, and bootstrap separated.
- `assets/js/tools/qr-studio.js` owns QR Studio behavior and stays independent from the landing app bootstrap.

The project modal moves focus inside when opened, contains Tab/Shift+Tab, isolates background siblings using `inert`, and restores the opener on close. Pre-existing inert states are preserved. Its close button, backdrop, Escape key, and contextual WhatsApp inquiry action remain available.

### Scroll Reveal Behavior

Landing presets opt into repeatable viewport reveals, except the About planets, which retain their original one-shot preset and independent planetary animations. Titles, kickers, text blocks, code cards, services, projects, reviews, contact blocks, and footer content enter as they become visible, exit near the viewport edge, and re-enter when returning. The sticky project console uses opacity only. Cards stagger within their current layout row, including after filtering and responsive reflow.

Reversible entries use the brand easing with a 600ms duration and a 16px vertical distance, reduced to 12px at mobile widths; exits use the existing 300ms motion token without a stagger delay. They do not add blur, scale, rotation, scroll smoothing, or scroll-linked scrubbing. The lifecycle uses `IntersectionObserver` and native Web Animations, with individual `translate` isolated from existing hover/tilt `transform` values. Component transitions remain independent. Focused content remains visible until focus leaves, and hero entries wait for loader completion. Reduced-motion users see content without these transitions; changing that preference cancels running reversible animations.

The shared engine still defaults to one-shot reveals. QR Studio loads its existing presets without the repeat module. If viewport observation is unavailable, content is revealed immediately; if Web Animations is unavailable, repeat groups use the existing one-shot engine. Missing duration or easing tokens skip the native animation rather than interrupting content visibility.

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
│       │   ├── reveal-repeat.js
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

Quote regression checks also cover missing-module submission guards and recovery, whitespace/length validation, the exact brief limit, edits made in flight, and null JSON responses. WhatsApp checks verify all nine service messages, project identity across all 17 modal previews, keyboard-visible morph labels, and intercepted desktop/mobile popup handoffs without contacting WhatsApp or sending messages.

Run both suites with `npm run test:all` before publishing a version. Keep `node_modules/`, test tooling, and local review artifacts out of the hosted static site's public document root.

Motion-enabled browser checks additionally exercise repeated entry/exit at both edges, rapid direction changes, viewport resizing, focused tall forms, row staggering after filters and reflow, mouse/touch tilt, loader-gated hero entries, one-shot planet/QR behavior, reduced motion, and missing-API fallbacks. The reviews carousel receives one viewport reveal around the whole component; its own internal slide animations remain independent.

Responsive checks also cover narrow touch layout widths, complete side-by-side hero/Workflow actions, mobile-menu focus and inert-state cleanup, assistant portrait/landscape bounds and resize focus, QR overflow before/during reveals, and footer-column/legend clearance. Hero button spacing is narrowed only at 360px and below; Workflow action sizing is local to mobile widths. Footer columns use an intermediate two-column layout before the existing tablet stack, and the final legend stacks earlier to clear the floating controls.

Assistant-specific suites exercise natural-language routing, negation, ambiguous choices, all nine service headings and 17 public project identities, bilingual follow-ups, context-preserving handoffs, reset, input/context bounds and HTML escaping. Browser checks additionally cover modeless keyboard entry, portrait/landscape wrapping, rapid submissions, preserved form drafts, response exceptions, missing modules and successful reinitialization. These checks do not certify a physical mobile keyboard or screen-reader announcement behavior.

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

For version 1.0.7, the branch and tag are published with `git push origin main v1.0.7`. Published version tags remain attached to their original commit; subsequent commits receive a new version and tag.

## Deployment Roadmap

1. Prepare and publish each version using the documented release workflow.
2. Keep the GitHub Pages preview available for quick mobile and public testing.
3. Connect deployment to the production domain: `blackholesys.com`.
4. Publish to the SERED hosting environment once SSH/hosting access is configured.

## Status

In active development.

---

Built by Bryan Pineda for Blackhole Systems.
