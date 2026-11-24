# Changelog

All notable changes to this project are listed here. Versions follow [semantic versioning](https://semver.org).

## Unreleased

- The built script is served from the demo site (`https://multitool-menu.vercel.app/multitool-menu.iife.js`), so the playground's HTML works as pasted, including in Framer and Webflow embeds (corner wrapper with room for the fan, links open the real page).

## 0.1.0

First version.

- `<multitool-menu>` web component and a React adapter on one framework-free engine.
- Links swing out from the rivet on the button and click into place; hovering slides a plate out; closing folds the plates home and draws them into the button, with no fade.
- Three finishes: `pearl`, `ink` and `glass`, with colours, font and corners themeable through `--mt-*` custom properties.
- Fan shape options: `side`, `length`, `plate-height`, `start-angle`, `spread`.
- Keyboard support, `select` and `toggle` events, reduced-motion support.
- Demo, props playground and an in-browser self-test.
