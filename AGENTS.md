# Repository Guidelines

## Project Structure & Module Organization

This repository is a participant's Y-AI Makerthon prototype. `index.html`, `styles.css`, and `app.js` implement the mobile Cultureland home screen and use flow. `usage-data.js` holds merchant search data; `nearby-data.js` holds sourced Yeongdeungpo stores and coordinates. `walking-routes.js`, `route-navigation.js`, and `route-guide.js` implement map guidance. `DATA_SOURCES.md` records evidence and limits. `tests/` checks lookup and routing behavior. `assets/` contains local images copied from the referenced mobile site. `manifest.webmanifest`, `sw.js`, and the `icon-*` files provide the PWA shell. `scripts/serve.mjs` is the dependency-free local server.

## Build, Test, and Development Commands

- `npm run dev`: serve the static app at `http://127.0.0.1:4173/`.
- `npm run check`: check JavaScript syntax and run the lookup tests.

There is no bundler or build step. Serve the files from localhost or HTTPS when checking PWA behavior; opening `index.html` directly will not register the service worker. The Leaflet map needs an internet connection for tiles.

## Coding Style & Naming Conventions

Use two-space indentation in HTML and JavaScript. Keep interface text in Korean. Use descriptive `camelCase` JavaScript names, `kebab-case` CSS classes and file names, and semantic HTML controls. Preserve keyboard access and meaningful labels for every new interaction. Keep the screen responsive within its 560 px desktop frame and at a 390 px phone width.

## Testing Guidelines

Tests use Node's built-in test runner; no coverage target is set. Add cases for known brands, aliases, categories, and unknown queries when changing merchant matching. Check route matching and progress when changing map guidance. For visual changes, check the affected area at phone and desktop widths. For interaction changes, exercise the specific control and confirm navigation or state. Run `npm run check` after JavaScript edits. Report only what was actually checked.

## Commit & Pull Request Guidelines

Use short imperative commit subjects, such as `Add merchant search screen`. Describe user-visible changes, verified behavior, and remaining limits in pull requests; include a screenshot for layout changes. Identify the source and check date when adding Cultureland usage rules or copied assets.

## Data & Configuration

Never store real account credentials, voucher PINs, payment details, or API keys. Label demonstration data clearly. Verify merchant availability, restrictions, and payment steps against current official Cultureland sources before presenting them as real.
