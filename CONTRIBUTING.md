# Contributing

Thanks for helping with Multitool Menu. This page covers everything you need to make a change and check it.

## Setup

You need Node 22.18 or newer (the exact version is in `.nvmrc`; run `nvm use` if you use nvm) and npm.

```
npm install
npm run dev        # demo at http://localhost:4175
```

## Where a change goes

The code has three layers. Most changes start at the bottom and move up.

1. **Engine** (`src/core/engine.ts`): springs, timeline and hover rules. No DOM, so it is easy to test. Add or update a test in `test/engine.test.ts` for any change here.
2. **Web component** (`src/element/multitool-menu-element.ts`): reads attributes, renders into a shadow root, fires events. Styles live in `src/core/styles.ts`.
3. **React adapter** (`src/react/MultitoolMenu.tsx`): a thin wrapper. When you add an attribute to the element, add the matching prop here.

When you add or change an attribute, also update the attribute table in `README.md`, and check that the playground (`demo/playground.ts`) has a control for every attribute.

## Checks before you push

```
npm run typecheck
npm test
npm run build
```

Then run `npm run dev`, open `/demo/selftest.html` and check that every line passes. The self-test drives the real component in the browser (clicks, keyboard, motion) and catches what unit tests can't.

The same typecheck, tests and build run automatically on GitHub for every push and pull request.

## Commits and pull requests

- Keep commits small, with a short one-line message, for example `fix plate size after switching side`.
- One topic per pull request. Say what changed and how you checked it.
- Add a line to `CHANGELOG.md` under "Unreleased" for anything a user would notice.

## Code style

- TypeScript, two-space indent (see `.editorconfig`), no semicolons.
- Comments explain why, not what.
- Keep the engine free of DOM code so it stays testable.
