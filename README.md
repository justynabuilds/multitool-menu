# Multitool Menu

A nav menu that opens like a pocket tool. The menu button has a small pearl rivet, and the links swing out from it as plates, one after another, clicking into place with a slight overshoot. Hovering a plate slides it out along its length while the other labels fade back. Picking a link folds the plates home and draws them into the button, with the chosen one going last.

It ships as a plain web component that works on any site (Webflow embed, WordPress, Squarespace, Shopify, plain HTML) and as a React component. Both run on the same framework-free engine and render inside a shadow root, so the host site's CSS can't break them.

**[Live demo](https://multitool-menu.vercel.app)** · **[Playground](https://multitool-menu.vercel.app/playground)** (every option in a panel, with copyable HTML and React code)

## Quick start

Any site, including a Framer or Webflow embed. The script is served from the live demo, so this works as pasted. The links inside are ordinary `<a>` tags, so the menu still makes sense to search engines and without JavaScript:

```html
<script src="https://multitool-menu.vercel.app/multitool-menu.iife.js"></script>
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

In an embed (Framer, Webflow), the menu lives in its own frame: give the embed room for the fan (about 320 × 320), add `target="_top"` to the links so they open the real page, and set a font (an embed can't inherit your site's). The [playground](https://multitool-menu.vercel.app/playground)'s HTML does both for you.

To host the script yourself, build it with `npm run build` (see [Development](#development)) and point the `src` at your copy; `multitool-menu.js` is the ES module version.

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

The element also has an `open` property (get and set) and a `toggle(force?)` method. React props use the same names in camelCase (`plateHeight`, `startAngle`).

## Events

| Event | `detail` | |
| --- | --- | --- |
| `select` | `{ index, label, href }` | A link was picked. Cancelable: call `preventDefault()` to stop navigation (for client-side routing). The menu closes either way. |
| `toggle` | `{ open }` | The menu opened or closed. |

## Styling

Set these on the element or any parent. Values you set win over the finish defaults.

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

For deeper styling use the parts `::part(button)`, `::part(rivet)`, `::part(menu)`, `::part(item)`, `::part(face)` and `::part(label)`. A plate's face gets `--lift` (0 to 1 while hovered) and `--tuck` (0 to 1 while it draws into the button), so a custom shadow can follow the motion.

## Behaviour and accessibility

- Every link closes the menu. So do Escape, a click outside and tabbing out.
- Keyboard: Enter or Space opens and focuses the first link, ArrowDown opens from the button, ArrowUp and ArrowDown move between links, Home and End jump to the ends, Escape closes and returns focus to the button.
- Closing never fades: the plates swing home without overshoot, then shorten into the button through the rivet.
- Hover is read from the plate's resting position. Only the visible face moves, so a lifted plate never slides out from under the pointer and flickers. Hover off starts at once on a spring with no bounce, and the label fade waits 90 ms, so moving to the next plate never flashes the others.
- Touch: no hover state; a tap picks.
- `prefers-reduced-motion`: the menu appears and disappears without motion.

## How the code is organised

```
src/core/engine.ts                     springs, timeline and hover rules; no DOM, fully unit-tested
src/core/styles.ts                     shadow-root styles, the three finishes and the --mt-* hooks
src/element/multitool-menu-element.ts  the <multitool-menu> custom element
src/element/index.ts                   registers the element; the library entry point
src/react/MultitoolMenu.tsx            React adapter
index.html, demo/                      demo page, props playground, in-browser self-test
test/engine.test.ts                    unit tests (node --test)
vite.config.ts                         library build (dist/)
vite.site.config.ts, vercel.json       demo site build and hosting
```

The engine knows nothing about the page: it holds the springs and decides what each plate should do. The element reads attributes, measures the button, draws the plates and turns engine values into CSS every frame. The React adapter only maps props and events onto the element.

## Development

Requires Node 22.18 or newer (see `.nvmrc`) and npm.

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies. |
| `npm run dev` | Demo at http://localhost:4175, playground at `/demo/playground.html`, self-test at `/demo/selftest.html`. |
| `npm test` | Engine unit tests. |
| `npm run typecheck` | TypeScript check. |
| `npm run build` | `dist/multitool-menu.js` (ESM), `dist/multitool-menu.iife.js` (script tag) and `dist/types`. |
| `npm run build:site` | The demo site Vercel serves (`site-dist`): `/`, `/playground`, `/demo/selftest.html`, plus `/multitool-menu.iife.js` and `/multitool-menu.js` for embeds. |

Typecheck, tests and build also run on GitHub for every push. See [CONTRIBUTING.md](CONTRIBUTING.md) for how to make a change and [CHANGELOG.md](CHANGELOG.md) for what changed.

## License

Free for personal and other non-commercial use under the [PolyForm Noncommercial License 1.0.0](LICENSE.md). Commercial use (client work, products, sites that make money) needs a paid license: open an issue to ask.
