# Development

Contributor reference for the public website. Start with the [README](../README.md) for an overview or [Architecture](ARCHITECTURE.md) for implementation contracts. Run the commands below from the repository root.

## Local Preview

Because this is a static site, it can run from any local static server.

```bash
python -m http.server 5500 --bind 127.0.0.1
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

CSS delivery checks assert ordered page/common entries, manifest ownership and cache revisions, absence of landing sections in QR, shared star/type/motion declarations and the existing mobile QR reveal offset. Changes to stylesheet distribution also require before/after rule conservation, computed-style/image comparisons and actual WebGPU rendering checks outside hardware-independent fixtures.

Effect lifecycle tests cover legacy gate compatibility, per-consumer margins, shared listener cleanup, live/legacy media-query notifications, missing viewport observation, callback isolation, idempotent mount/destroy/remount, generated-node ownership, comet timer drain/capacity and required dependency order. Browser checks verify actual animation clocks pausing/resuming, simulated document-hidden events, all four real star consumers, the WebGPU-ready CSS pause, QR static reduced motion and unchanged testimonial particle counts. These tests do not replace actual shader-output verification when changing the GPU renderer.

QR ownership-glow checks cover independent per-icon visibility, the existing viewport buffer, animation-clock continuity, hidden-page handling without viewport observation, unchanged timing/keyframes and motion policy, missing lifecycle dependency and unavailable QR engine. These preserve the authored visible effect rather than substitute another rendering technique.

Conditional-hero checks cover missing API/stage/parent, supported import ordering, repeated entry evaluation, missing/evaluation-failed scene modules, missing entry recovery and QR's continued exclusion of the 3D graph. Controlled dependency stubs test ordering without requiring a physical GPU; they do not prove shader output. Validate actual WebGPU frames separately on a capable secure-origin browser when changing this loading path or the renderer.

Media tests check source checksums, reproducible outputs, exact hero/resized-brand pixels, unchanged aspect ratios, JPEG quality/byte gates, preload selection, high-density card sources, original modal images, failed-candidate recovery and missing-registry fallback. Sharp is pinned as a development-only dependency; it is not a browser dependency.

Font tests verify exact source hashes, WOFF2 headers, license integrity, original descriptors/coverage and in-place local stylesheet ordering. Browser checks confirm real custom Outfit glyphs with external networking blocked, normal Latin-only loading, extended-subset loading on demand, intermediate weights and readable content/normal loader recovery when files fail. These do not certify hosting MIME/cache headers or physical-device font rasterization.

Browser checks use installed Google Chrome by default. To use Playwright Chromium instead, run `npx playwright install chromium`, then `PLAYWRIGHT_CHANNEL=chromium npm run test:browser` in Git Bash. Playwright is pinned as a development-only dependency in the lockfile.

Browser fixtures intercept repository resources at `http://blackhole.test`; no HTTP server is started. All external requests are blocked, and quote responses are simulated so no real leads are submitted. These checks do not certify the production admin API, CDN availability, or GPU rendering on physical devices. Optional `BLACKHOLE_QA_DIR` selects an output directory for desktop/mobile review screenshots; no generated screenshots are needed in production.

Quote regression checks also cover missing-module submission guards and recovery, whitespace/length validation, the exact brief limit, edits made in flight, and null JSON responses. WhatsApp checks verify all nine service messages, project identity across all 17 modal previews, keyboard-visible morph labels, and intercepted desktop/mobile popup handoffs without contacting WhatsApp or sending messages.

Run both suites with `npm run test:all` before publishing a version. Keep `node_modules/`, test tooling, and local review artifacts out of the hosted static site's public document root.

Motion-enabled browser checks additionally exercise repeated entry/exit at both edges, rapid direction changes, viewport resizing, focused tall forms, row staggering after filters and reflow, mouse/touch tilt, loader-gated hero entries, one-shot planet/QR behavior, reduced motion, and missing-API fallbacks. The reviews carousel receives one viewport reveal around the whole component; its own internal slide animations remain independent.

Responsive checks also cover narrow touch layout widths, complete side-by-side hero/Workflow actions, mobile-menu focus and inert-state cleanup, assistant portrait/landscape bounds and resize focus, QR overflow before/during reveals, and footer-column/legend clearance. Hero button spacing is narrowed only at 360px and below; Workflow action sizing is local to mobile widths. Footer columns use an intermediate two-column layout before the existing tablet stack, and the final legend stacks earlier to clear the floating controls.

Assistant-specific suites exercise natural-language routing, negation, ambiguous choices, all nine service headings and 17 public project identities, bilingual follow-ups, context-preserving handoffs, reset, input/context bounds and HTML escaping. Browser checks additionally cover modeless keyboard entry, portrait/landscape wrapping, rapid submissions, preserved form drafts, response exceptions, missing modules and successful reinitialization. These checks do not certify a physical mobile keyboard or screen-reader announcement behavior.

## Versioning And Releases

Every commit must have a detailed English subject and body, a distinct website version, and a matching annotated deployment tag using `vMAJOR.MINOR.PATCH`.

For every new version, review the root README and affected documentation against the actual implementation. Update the current version, release changes, and any affected feature, architecture, interaction, or integration documentation. Keep implemented behavior and pending work clearly identified.

Review and publish releases manually. Stage only the intended files, use a detailed English commit message and tag annotation, and push the branch and its specific tag together.

Published version tags remain attached to their original commit; subsequent commits receive a new version and tag. Documentation-only releases follow the same version consistency contract.

## Deployment Checklist

The site can be hosted as static files. The HTML metadata targets `blackholesys.com`; that does not establish that the domain or a preview is currently deployed.

- Publish the root HTML, `assets/`, `tools/`, `robots.txt`, `sitemap.xml` and `site.webmanifest`. Preserve their relative paths.
- Keep `.git/`, `node_modules/`, tests, scripts, development documentation and local review artifacts outside the hosted public document root. README screenshots are documentation assets, not runtime dependencies.
- Configure HTTPS and verify the required browser capabilities and static fallback on the real host.
- Verify MIME types for JavaScript modules, SVG, WebP and WOFF2; check gzip/Brotli and cache/revalidation behavior for versioned assets.
- Verify the production lead API configuration and its matching intake contract before accepting live inquiries. Test fixtures do not certify that integration.
- Check navigation, project previews/modals, QR exports and form delivery on the real deployment, including a physical mobile device.
- Measure the real network waterfall and paint/interaction behavior before claiming production performance improvements.

See [Architecture](ARCHITECTURE.md#lead-capture) for the existing lead intake behavior and [the root README](../README.md#current-version) for the current release.
