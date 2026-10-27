# Local Website Icons

The landing and QR Studio share `icons.svg` and `../css/icons.css`. Only those
two files are requested to render icons; `sources/`, licenses and the manifest
are maintenance assets, not a runtime library.

## Upstream Sources

- Remix Icon 3.5.0: 66 original SVGs, Apache-2.0. This release predates the
  upstream 2026 license change; do not replace its license with the current one.
- Font Awesome Free 6.7.2: 22 original SVGs, CC BY 4.0 for SVG icons.
- Exact source URLs and SHA-256 checksums: `manifest.json`.
- Full notices: `licenses/`. Original embedded source notices are retained.
- Brand icons remain subject to their owners' trademark rights.

## Rendering Contract

Keep each existing `i` wrapper and its component classes, then add `bh-icon`.
Inside it, use a decorative SVG with class `bh-icon-svg`, the original viewBox,
`aria-hidden="true"`, `focusable="false"`, and a `use` element referencing the
versioned sprite plus icon ID. Keep the real button/link accessible name outside
the icon. Color comes from `currentColor`; no replacement observer is needed.

Paths are document-relative: landing templates use `assets/icons/icons.svg`;
QR Studio uses `../../assets/icons/icons.svg`. Future nested pages must use their
own correct relative prefix. Preview over HTTP, not `file://`, and serve SVG
assets with `image/svg+xml` from the same origin.

## Maintenance

1. Download only the required original SVG from its exact official version.
2. Add it under `sources/<icon-id>.svg`, preserving embedded notices.
3. Record the ID, family, source path, official URL and SHA-256 in the manifest.
4. Update the static markup or existing rendering template; add no DOM sweep.
5. Run `npm run build:icons`, then `npm test` and `npm run test:browser`.
6. Compare component size, alignment, hover and motion at desktop/mobile widths.
7. Revise icon/CSS/template cache keys together when shipping a new sprite.

The builder uses only Node standard libraries. It makes no network requests and
its `--check` mode verifies generated files without rewriting them. Geometry is
kept inside original viewBoxes; non-square Font Awesome advances are generated
as CSS widths. Shared font-glyph spacing and glass-button shadow compatibility
are explicit in the generated stylesheet. Section-specific effects remain in
their owning stylesheets.
