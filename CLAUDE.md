# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An opinionated React browser-extension starter built on **Extension.js** (the `extension` package). Extension.js is a zero-config build tool for cross-browser extensions — it reads `src/manifest.json`, follows the entry points declared there, and bundles the referenced `.ts`/`.tsx`/`.html` files. There is no separate webpack/vite config; the manifest *is* the build graph.

## Commands

Package manager is **pnpm** (`pnpm@12.18.0`). Append CLI flags directly after the script name, e.g. `pnpm run dev --browser=firefox`. Do **not** insert `--`: pnpm forwards it literally (verified on pnpm 10, 11 and 12), so Extension.js reads `--browser=firefox` as the project path and fails with "Manifest file not found".

```bash
pnpm run dev            # dev server + HMR, Chromium by default (--browser=firefox|edge)
pnpm run build          # production build, Chrome (also build:firefox, build:edge)
pnpm run preview        # run the production build in a browser
pnpm run lint           # ESLint over the whole repo
pnpm run type-check     # tsc --noEmit (type errors are NOT surfaced by the build)
```

There is **no test framework** configured — do not invent `test` commands. Correctness is guarded by `lint` + `type-check` only. Run both after non-trivial changes; the Extension.js build does not fail on type errors.

### TypeScript 6 and 7 are both installed (on purpose)

`typescript-eslint` throws on the TS 7 API, so `package.json` follows the [official side-by-side setup](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6.0):

- `"typescript": "npm:@typescript/typescript6"` — what `require('typescript')` resolves to, i.e. what ESLint and the editor's tsserver use. Also gives a `tsc6` binary.
- `"typescript-7": "npm:typescript"` — the real TS 7 compiler; this is the `tsc` that `pnpm run type-check` runs.

So `type-check` runs TS 7 while ESLint and the IDE run TS 6. Collapse this back to a single plain `typescript` dependency once [typescript-eslint#10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940) ships.

## Architecture

### Three extension contexts

The extension runs code in three isolated contexts, each with its own entry point and a tagged `console.log` on load:

- **background** (`src/background.ts`) — service worker on Chromium, event-page background script on Firefox.
- **content script** (`src/content/scripts.tsx`) — injected into `<all_urls>`.
- **sidebar** (`src/sidebar/`) — a regular HTML page (`index.html` → `scripts.tsx` → `SidebarApp.tsx`) shown as the side panel.

The "open sidebar" flow crosses contexts: the content-script button (`ContentApp.tsx`) sends `chrome.runtime.sendMessage({type: 'openSidebar'})`; the background listener receives it and opens the panel. The open call is gated on a user gesture: on Chromium, call `chrome.sidePanel.open()` synchronously in the listener (no `await` or async callback first). Firefox never counts a content-script message as a user action, so this flow is Chromium-only: on every non-Chromium target `ContentApp.tsx` renders a static hint instead of the button, the Firefox background has no `onMessage` listener, and only the toolbar button (`sidebarAction.toggle()`) opens the sidebar. Keep the message `type` in sync across `ContentApp.tsx` and `background.ts` if you change it.

### Cross-browser manifest (the key non-obvious piece)

`src/manifest.json` is a **single source that Extension.js splits per browser** using key prefixes:

- `chromium:` / `firefox:` prefixes select keys per target (e.g. `chromium:side_panel` vs `firefox:sidebar_action`, `chromium:service_worker` vs `firefox:scripts`).
- `manifest_version: 3` for **both** Chromium and Firefox (Firefox 109+ supports MV3). Firefox-only runtime differences (event-page `background.scripts`, `sidebar_action`) are still expressed with `firefox:` prefixes — not a lower manifest version.

Because of this, the same feature often needs **two manifest entries and two runtime code paths**. At runtime, branch on `isFirefoxLike` / `isChromiumLike` from `src/lib/browser.ts` (they cover every Gecko and every Chromium `EXTENSION_PUBLIC_BROWSER` target respectively; keep each a chain of literal comparisons so the bundler folds it and drops the other browser's branch) — see `background.ts` and `ContentApp.tsx`. Don't use `!isFirefoxLike` to mean Chromium: Extension.js also builds WebKit targets (`safari`, `webkit-based`), which are neither and have no side-panel API. Chromium code uses `chrome.sidePanel`; Firefox code calls `firefoxBrowser()` from the same module (e.g. `firefoxBrowser().sidebarAction`). Don't use the bare `browser` global for Firefox-only APIs: `@types/chrome` (>= 0.3) re-types it as `typeof chrome`, and `firefoxBrowser()` is the one place that casts it back to the webextension-polyfill type.

Manifest entry points reference **TypeScript files directly** (`background.ts`, `content/scripts.tsx`) — Extension.js transpiles them.

### Content script lifecycle & style isolation

`content/scripts.tsx` default-exports an `initial()` function. **Extension.js calls it on injection and calls its returned cleanup function on HMR/teardown — never invoke it yourself.** The content UI mounts into a **shadow DOM** so host-page styles and extension styles don't leak into each other; the CSS is `fetch()`-ed at runtime and injected into a `<style>` inside the shadow root (plain `import './styles.css'` would not reach the shadow tree).

### Styling: Tailwind v4 + shadcn/ui

- Tailwind v4 runs through PostCSS (`postcss.config.mjs`). Theme + design tokens live in `src/styles/globals.css` (imports `tailwindcss`, `tw-animate-css`, and `shadcn/tailwind.css`). An entry point must import `globals.css` for utilities to apply (the sidebar does).
- shadcn/ui is pre-wired (`components.json`). Add components with `pnpm dlx shadcn@latest add <name>`; they land in `src/components/ui` and import via the `@/` alias. Merge class names with `cn()` from `src/lib/utils.ts`.

### Path alias & ambient types

- `@/*` → `src/*` (defined in both `tsconfig.json` and `components.json`).
- `assets.d.ts` declares ambient modules for `*.css`/image imports. It must stay a **script** (no top-level `import`/`export`) or bundler resolution stops applying the wildcards to relative imports — see the comment in that file before editing.
- `extension-env.d.ts` is auto-generated by Extension.js and gitignored; don't hand-edit or commit it.

## MCP servers

`.mcp.json` wires three servers (auto-loaded by Claude Code):

- **extension-dev** (`@extension.dev/mcp`) — build-aware, cross-browser project control (dev server, reload, generated manifest, storage, logs). Reach for this when the task touches *this project*.
- **chrome-devtools** (`chrome-devtools-mcp`) — raw Chrome debugging over CDP. It attaches to `http://127.0.0.1:9222`, so a Chrome must already be listening on that remote-debugging port. Reach for this for *generic browser* work (pages, network, performance).
- **extensionjs** — hosted Extension.js docs; prefer it over training data for "how do I…" Extension.js questions.
