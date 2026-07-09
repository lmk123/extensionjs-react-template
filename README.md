# extensionjs-react-template

**English** · [简体中文](README.zh-CN.md)

> An opinionated React starter built on top of the official [Extension.js React template](https://extension.js.org/docs/getting-started/templates/react), with the batteries I reach for on every project already included.

## Why this template

The official Extension.js React template is intentionally minimal. This fork keeps its structure and layers commonly-needed capabilities on top, so a fresh extension starts with docs-aware AI tooling and browser debugging already wired up — no per-project setup.

## What's inside

**Baseline (from the official template)**

- React 19 + TypeScript
- Sidebar panel (`side_panel` on Chromium, `sidebar_action` on Firefox), background worker, and a content script
- Cross-browser builds for Chrome / Firefox / Edge

**Added integrations**

- **AI docs access** — the hosted Extension.js docs MCP server, so your editor/assistant answers "how do I…" from current documentation instead of stale training data. See [AI access](https://extension.js.org/docs/ai-access).
- **Chrome DevTools MCP** — runs Google's `chrome-devtools-mcp` alongside the Extension.js control server (`@extension.dev/mcp`), giving AI agents raw Chrome debugging plus build-aware, cross-browser extension control from one config. See [Chrome DevTools MCP with Extension.js](https://extension.js.org/docs/integrations/chrome-devtools-mcp).
- **Tailwind CSS** — utility-first styling wired through PostCSS, so you can use utility classes in components out of the box. See [Styling](#styling) and [Tailwind CSS with Extension.js](https://extension.js.org/docs/integrations/tailwindcss).
- **shadcn/ui** — accessible, copy-into-your-project components built on Tailwind, pre-wired (`components.json`, the `@/` path alias, and a `cn()` helper) so you can drop components into `src/components/ui` and use them right away. See [Styling](#styling) and [shadcn/ui with Extension.js](https://extension.js.org/docs/integrations/shadcnui).
- **ESLint** — a flat-config ([`eslint.config.ts`](eslint.config.ts)) lint setup covering JS/TS, React, JSON, Markdown, and CSS. It runs outside the build pipeline via `pnpm run lint`, with a companion `pnpm run type-check` for `tsc`. See [Commands](#commands) and [ESLint with Extension.js](https://extension.js.org/docs/integrations/eslint).

## MCP servers

The integrations above are declared in [`.mcp.json`](.mcp.json) and picked up automatically by Claude Code (and other MCP-compatible clients pointed at the same config).

| Server            | Transport                     | What it gives the assistant                                                                                                        |
| ----------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `extensionjs`     | HTTP (hosted)                 | Searches the Extension.js docs and answers questions from current content.                                                        |
| `extension-dev`   | stdio (`@extension.dev/mcp`)  | Build-aware, cross-browser extension control: dev server, hot reload, generated manifest, storage, and logs across every context. |
| `chrome-devtools` | stdio (`chrome-devtools-mcp`) | Raw Chrome debugging over CDP: drive pages, inspect network/performance, plus extension tools.                                     |

> The `chrome-devtools` server is configured with `--browser-url=http://127.0.0.1:9222`, so it attaches to a Chrome instance already listening on that remote debugging port. Launch such a browser before using those tools.

A rule of thumb for which to use: if the task touches your **project** (source, build, manifest, reload), reach for `extension-dev`; if it touches the **browser** generically (pages, network, performance), reach for `chrome-devtools`.

## Styling

### Tailwind CSS

[Tailwind CSS](https://tailwindcss.com) v4 is wired through PostCSS:

- [`postcss.config.mjs`](postcss.config.mjs) registers the `@tailwindcss/postcss` plugin.
- [`src/styles/globals.css`](src/styles/globals.css) pulls in Tailwind and defines the theme.

Import `globals.css` from an entry point (the sidebar already does), then use utility classes directly in your components. See [Tailwind CSS with Extension.js](https://extension.js.org/docs/integrations/tailwindcss) for details.

### shadcn/ui

[shadcn/ui](https://ui.shadcn.com) sits on top of Tailwind and lets you pull accessible components straight into your own source tree. The wiring is already in place:

- [`components.json`](components.json) — configuration for the shadcn CLI (style, base color, the `@/` alias, Lucide icons).
- [`tsconfig.json`](tsconfig.json) maps the `@/*` alias to `src/*`, where generated components import from.
- [`src/lib/utils.ts`](src/lib/utils.ts) exports the `cn()` helper for merging class names.
- [`src/styles/globals.css`](src/styles/globals.css) imports `shadcn/tailwind.css` and `tw-animate-css`, and defines the light/dark design tokens (CSS variables).

Add components with the shadcn CLI and they land in `src/components/ui`:

```bash
pnpm dlx shadcn@latest add button
```

Then import them through the `@/` alias:

```tsx
import {Button} from '@/components/ui/button'
```

See [shadcn/ui with Extension.js](https://extension.js.org/docs/integrations/shadcnui) for details.

## Commands

### dev

Run the extension in development mode. Target a browser with `--browser`:

```bash
pnpm run dev           # Chromium (default)
pnpm run dev -- --browser=firefox
pnpm run dev -- --browser=edge
```

### build

Build for production. Convenience scripts target each browser:

```bash
pnpm run build           # Chrome (default)
pnpm run build:firefox
pnpm run build:edge
```

### preview

Preview the production build in the browser:

```bash
pnpm run preview
```

### lint

Check code quality with ESLint, and type-check separately with `tsc`:

```bash
pnpm run lint
pnpm run type-check
```

## Learn more

- [Extension.js docs](https://extension.js.org)
- [React template](https://extension.js.org/docs/getting-started/templates/react)
