# Multitool Menu

A nav menu that opens like a pocket tool. The menu button has a small pearl rivet, and the links swing out from it as white plates, one after another, clicking into place with a slight overshoot. Hovering a plate slides it out along its length while the other labels fade back. Picking a link folds the menu away, with the chosen plate going last.

It ships as a plain web component that works on any site (Webflow embed, WordPress, Squarespace, Shopify, plain HTML) and as a React component. Both run on the same framework-free engine and render inside a shadow root, so the host site's CSS can't break them.

```
src/core/engine.ts                     springs, timeline and hover rules, no DOM (tested)
src/core/styles.ts                     shadow-root styles and the --mt-* theme hooks
src/element/multitool-menu-element.ts  <multitool-menu> custom element
src/react/MultitoolMenu.tsx            React adapter
index.html, demo/                      demo site, props playground and the in-browser interaction self-test
test/engine.test.ts                    unit tests (node --test)
```

## Commands

```
npm run dev        demo at http://localhost:4175, playground at /demo/playground.html, self-test at /demo/selftest.html
npm run build      dist/multitool-menu.js (ESM), dist/multitool-menu.iife.js (script tag), dist/types
npm run build:site the demo site Vercel serves (site-dist): / , /playground, /demo/selftest.html
npm test           engine tests
npm run typecheck
```

## Use it

Any site. The links inside are ordinary `<a>` tags, so the menu still makes sense to search engines and without JavaScript:

```html
<script src="multitool-menu.iife.js"></script>
<multitool-menu label="Menu">
  <a href="/work">Work</a>
  <a href="/services">Services</a>
  <a href="/about">About</a>
  <a href="/journal">Journal</a>
  <a href="/contact">Contact</a>
</multitool-menu>
```

React:

```tsx
import { MultitoolMenu } from "@justbuilt/multitool-menu/react"

<MultitoolMenu
  items={[{ label: "Work", href: "/work" }, { label: "About", href: "/about" }]}
  onSelect={(item) => router.push(item.href!)}  // return false to stop the browser navigating itself
/>
```

## Attributes

| Attribute | Default | |
| --- | --- | --- |
| `label` | `Menu` | Button text. |
| `finish` | `pearl` | `pearl`: white plates with a pearl rim and cool shadows. `ink`: dark plates out of a dark button. `glass`: frosted plates and button, best over photos. |
| `side` | `left` | `left` fans the plates out to the left, for a button on the right of the nav. `right` mirrors it for a button on the left. |
| `length` | `252` | Plate length in px from the rivet. Shortens itself when the screen is too narrow. |
| `plate-height` | `38` | Plate height in px. |
| `start-angle` | `12` | Angle of the first plate in degrees below the button line. |
| `spread` | `12` | Degrees between plates. |
| `open` | off | Reflects the state; set it to open the menu. |

## Events

| Event | `detail` | |
| --- | --- | --- |
| `select` | `{ index, label, href }` | A link was picked. Cancelable: call `preventDefault()` to stop navigation (for client-side routing). The menu closes either way. |
| `toggle` | `{ open }` | The menu opened or closed. |

The element also has `open` (get/set) and `toggle(force?)`.

## Theme

Set these on the element or any parent:

| Property | Default |
| --- | --- |
| `--mt-button-bg` | `#17171A` (the raised gradient and rings are derived from it) |
| `--mt-button-text` | `#F5F5F3` |
| `--mt-plate-bg` | `#FFFFFF` (ink `#1C1C20`, glass translucent white) |
| `--mt-plate-text` | `#141416` (ink `#F4F4F2`) |
| `--mt-rim` | `#DADDE4` (pearl rim, bottom edge) |
| `--mt-shadow` | `30 45 80` (RGB channels used for every shadow) |
| `--mt-focus` | `#141416` (focus rings) |
| `--mt-button-radius` | `14px` (squircle where the browser supports it) |
| `--mt-font` | `inherit` |

Values you set win over the finish defaults. Parts for deeper styling: `::part(button)`, `::part(rivet)`, `::part(menu)`, `::part(item)`, `::part(face)`, `::part(label)`. A plate's face gets `--lift` (0 to 1 while hovered), so a custom shadow can grow with it.

## Playground

https://multitool-menu.vercel.app/playground: every prop in a panel (links, finish, colours, font, fan shape, screen size), a live preview, the event log, and copyable HTML and React code.

## Behaviour

- Every link closes the menu with the fold-away animation. So do Escape, a click outside and tabbing out.
- Keyboard: Enter or Space opens and focuses the first link, ArrowDown opens from the button, ArrowUp and ArrowDown move between links, Home and End jump to the ends, Escape closes and returns focus to the button.
- Hover is detected on the plate's resting position. Only the visible face moves, so a lifted plate never slides out from under the pointer and flickers.
- Hover off: the plate starts sliding home the moment the pointer leaves, on a spring with no bounce. The label fade waits 90 ms, so moving straight to the next plate never flashes the other labels.
- Touch: no hover state; a tap picks.
- `prefers-reduced-motion`: the menu appears and disappears without motion.

## Licence

All rights reserved. Not for redistribution.
