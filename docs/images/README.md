# Documentation Screenshots

These are real captures of the public website, not mockups or generated interfaces.
They document the unchanged website UI used for the 1.0.18 documentation release.

| Image | Content |
| --- | --- |
| `landing-desktop.webp` | Desktop landing with the actual Three.js/WebGPU hero rendered |
| `landing-mobile.webp` | Mobile landing at a 390px-wide viewport, with the same renderer |
| `deployment-log.webp` | Portfolio filters and the complete first row of public project cards |
| `qr-studio.webp` | Complete QR workspace, using its default sample URL and live preview |

Captured on 2026-10-28 with installed Chrome and Playwright, loading repository
bytes locally through intercepted requests. No public server, external service,
client dashboard, form submission or WhatsApp message was used. Local fonts,
icons and preview images were loaded before capture. WebGPU readiness and canvas
presence were checked for both landing captures.

The WebP files preserve the original screenshot pixels losslessly. They are used
by GitHub documentation only; the website does not load them. Keep temporary PNGs,
browser logs and other QA artifacts out of this folder and the deployed site.

When the public UI changes, refresh the affected capture after its images, fonts
and entry animations have finished loading. Preserve the real composition and
check the desktop/mobile result before publishing a replacement.
