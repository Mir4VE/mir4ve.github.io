# MIR4VE Timers — Modular Structure By: https://www.instagram.com/shovi.oficial/

## Files
- `index.html`: HTML document structure, metadata, external libraries, and script loading order.
- `css/styles.css`: all CSS rules extracted from the original inline stylesheet.
- `js/tailwind-config.js`: Tailwind theme configuration.
- `js/site-core.js`: main site behavior and event timers.
- `js/token-exdra.js`: EXDRA price integration.
- `js/token-wemix.js`: WEMIX price integration.
- `js/token-hydra-draco.js`: HYDRA and DRACO price integration.

## Notes
- Script files are loaded in the same order as the original inline scripts.
- External libraries and their original order are preserved.
- The original CSS rules and JavaScript logic are preserved; only code is moved to separate files.
- Keep the folder structure when deploying, because `index.html` references `css/` and `js/`.


## Token market structure

- `index.html`: visible token cards and their links/labels remain here for easy editing.
- `assets/token-logos/`: token logo images are external files instead of embedded Base64 blobs.
- `css/styles.css`: all visual styling, including the token strip.
- `js/token-exdra.js`, `js/token-wemix.js`, `js/token-hydra-draco.js`: token-specific behavior and price updates.
- `js/site-core.js`: general site behavior, separate from token-specific logic.

Keep the folder structure intact when deploying. The paths are relative to `index.html`.
