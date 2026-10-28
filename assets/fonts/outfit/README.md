# Outfit Webfont Assets

These are unmodified variable WOFF2 subsets from the Google Fonts `v15` URLs
previously used by both Blackhole pages. The provider revision is not a new font
version chosen for this release. The Latin file is byte-identical to the font
verified in the pre-change browser audit. Latin-ext retains the original declared
coverage for future text, although current pages normally request Latin only.

Copyright 2021 The Outfit Project Authors. The original SIL Open Font License
1.1 is included as `OFL.txt`, fetched from the upstream commit recorded in
`manifest.json`. Keep that copyright/license with redistributed font files.

`manifest.json` records the original HTTPS URLs, file sizes and SHA-256 hashes,
provider stylesheet hash, upstream source commit, descriptors and Unicode ranges.
`assets/css/fonts.css` is the sole runtime declaration. Both HTML entries load it
before their existing icon/common/page styles, in the former provider link's
position. There is no browser download from the recorded provenance URLs.

## Maintenance

- Keep the full variable `wght` range 100-900, including QR's 520/620 weights.
- Preserve `normal`, `swap`, both Unicode ranges and the existing Outfit family.
- Do not convert, instance, subset again, add `local()`, metric overrides or
  font preloads as an incidental delivery change.
- Do not overwrite a hash-named file with different bytes. An intentional font
  update requires new source verification, filenames, hashes, stylesheet/release
  revisions and before/after typography review.
- Run the unit and browser font checks, including extended-character loading,
  actual custom glyph rendering, network independence and unavailable-file fallback.
- Future pages should load `fonts.css` before their existing brand/page styles;
  relative paths support a domain root or project subdirectory without rewriting.

No font build step or new development/runtime package is required. WOFF2 files
must be served as `font/woff2` by the static host; verify deployment headers and
cache behavior on the real host separately. Use the repository's HTTP preview;
`file://` is not a supported cross-file webfont validation environment.
