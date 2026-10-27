# TIMERS │ MIR4VE - Modular Structure 
Update V2.0 By: [AKO](https://www.instagram.com/shovi.oficial/) 

## Files
- `index.html`: HTML document structure, metadata, external libraries, and script loading order.
- `css/styles.css`: all CSS rules extracted from the original inline stylesheet.
- `js/tailwind-config.js`: Tailwind theme configuration.
- `js/site-core.js`: main site behavior and event timers.
- `js/token-exdra.js`: EXDRA price integration.
- `js/token-wemix.js`: WEMIX price integration.
- `js/token-hydra-draco.js`: HYDRA and DRACO price integration.

## Notes
- External libraries and their original order are preserved; the isolated UI modules load after the core timer script.
- Existing timer behavior and layout are preserved outside the requested, scoped changes.
- Background dimming and the static-UI translations are handled by separate JavaScript modules. Gaussian backdrop blur is disabled on general surfaces and retained only on event countdown cards.
- Keep the folder structure when deploying, because `index.html` references `css/` and `js/`.


## Token market structure

- `index.html`: visible token cards and their links/labels remain here for easy editing.
- `assets/token-logos/`: token logo images are external files instead of embedded Base64 blobs.
- `css/styles.css`: all visual styling, including the token strip.
- `js/token-exdra.js`, `js/token-wemix.js`, `js/token-hydra-draco.js`: token-specific behavior and price updates.
- `js/site-core.js`: general site behavior, separate from token-specific logic.

Keep the folder structure intact when deploying. The paths are relative to `index.html`.


## Visual enhancements

- `css/visual-enhancements.css`: responsive background with balanced dark overlay, glassmorphism for main panels/cards, floating event art, levitation, and the Halloween tombstone minimized state.
- `js/floating-event.js`: isolated promo behavior. The artwork link opens in a new tab and does not dismiss the image; only the X minimizes it. The minimized/open state persists in `localStorage` across reloads, and subtle Halloween chimes are generated with Web Audio.
- `js/reading-mode.js`: accessible moon control that darkens only the page background layer by 50% and restores it on the next click.
- `js/ui-localization.js`: translations for static interface labels, accessibility text, footer credits, and the event promo in Spanish, Portuguese, and English. It follows the language-change event dispatched by `js/site-core.js`.
- `assets/bg/event.png`: event artwork used by the floating promo.
- `assets/bg/background.jpg`: site background image.

The event destination is set in the promo anchor in `index.html` (`https://forum.mir4global.com/post/2682`); change that `href` if needed. Persistent state uses `mir4ve:floating-event-promo:state:v1` in `localStorage`. The integration remains in separate CSS/JS modules and does not modify `css/styles.css` or `js/site-core.js`.

## Footer, vector recognition marks, and no-blur glass surfaces

- `assets/credits/logo-mir4.svg`, `logo-github.svg`, `logo-chatgpt.svg`, `logo-gemini.svg`, and `logo-sh0v1.svg`: custom, lightweight SVG wordmarks used in the credits footer.
- The shared credits footer is placed after both the timer and About views, so it remains available as the displayed view changes. It includes copyright, a community-quality seal, accessible external links, and a trademark recognition note.
- `css/visual-enhancements.css`: footer styling, responsive centered logos, moderated glass opacity, and `backdrop-filter: none` overrides for all surfaces except event countdown cards, where Gaussian blur is retained for legibility.
- `css/styles.css`: only the legacy backdrop blur declarations and the toast entrance blur were neutralized; the rest of the existing stylesheet remains unchanged.

The logo artwork is custom-drawn SVG for recognition and does not imply official sponsorship or endorsement by the platforms shown.

