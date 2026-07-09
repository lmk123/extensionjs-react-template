# extensionjs-react-template

[English](README.md) · **简体中文**

> 一个基于官方 [Extension.js React 模板](https://extension.js.org/docs/getting-started/templates/react) 定制的 React 脚手架，把我每个项目都要用的常用能力预先集成好。

## 为什么要做这个模板

官方的 Extension.js React 模板刻意保持极简。这个 fork 保留了它的结构，并在其之上叠加了常用能力，让新建的扩展一开始就自带「文档感知的 AI 工具」和「浏览器调试」，省去每个项目重复配置。

## 包含内容

**基础部分（来自官方模板）**

- React 19 + TypeScript
- 侧边栏面板（Chromium 上用 `side_panel`，Firefox 上用 `sidebar_action`）、后台 worker，以及一个 content script
- 面向 Chrome / Firefox / Edge 的跨浏览器构建

**新增集成**

- **AI 文档访问** —— 托管的 Extension.js 文档 MCP 服务器，让你的编辑器 / 助手基于最新文档回答「怎么做……」的问题，而不是依赖过时的训练数据。参见 [AI access](https://extension.js.org/docs/ai-access)。
- **Chrome DevTools MCP** —— 让 Google 的 `chrome-devtools-mcp` 与 Extension.js 控制服务器（`@extension.dev/mcp`）一起运行，在同一份配置里，既给 AI 提供原始的 Chrome 调试能力，也提供构建感知、跨浏览器的扩展控制能力。参见 [Chrome DevTools MCP with Extension.js](https://extension.js.org/docs/integrations/chrome-devtools-mcp)。
- **Tailwind CSS** —— 通过 PostCSS 接入的原子化（utility-first）CSS，让你开箱即用地在组件里使用工具类。参见下方 [样式](#样式) 以及 [Tailwind CSS with Extension.js](https://extension.js.org/docs/integrations/tailwindcss)。

## MCP 服务器

上述集成都声明在 [`.mcp.json`](.mcp.json) 中，Claude Code（以及指向同一份配置的其他 MCP 兼容客户端）会自动识别加载。

> 小科普：MCP（Model Context Protocol）可以理解为「给 AI 助手用的插件协议」。每个 MCP 服务器就像一个提供了一组工具的插件，AI 助手连上后就能调用这些工具去查文档、控制浏览器、读写扩展状态等。

| 服务器            | 传输方式                       | 给助手提供的能力                                                                                     |
| ----------------- | ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `extensionjs`     | HTTP（托管）                   | 检索 Extension.js 文档，基于最新内容回答问题。                                                       |
| `extension-dev`   | stdio（`@extension.dev/mcp`）  | 构建感知、跨浏览器的扩展控制：dev 服务、热重载、生成后的 manifest、storage，以及跨各个上下文的日志。 |
| `chrome-devtools` | stdio（`chrome-devtools-mcp`） | 通过 CDP 进行原始 Chrome 调试：驱动页面、检查网络 / 性能，外加扩展相关工具。                         |

> `chrome-devtools` 服务器配置了 `--browser-url=http://127.0.0.1:9222`，因此它会连接到一个已经在该远程调试端口上监听的 Chrome 实例。使用这些工具前，请先启动这样一个浏览器。

选择哪一个的经验法则：如果任务和你的**项目**相关（源码、构建、manifest、重载），用 `extension-dev`；如果任务是操作**浏览器**本身这类通用行为（页面、网络、性能），用 `chrome-devtools`。

## 样式

通过 PostCSS 接入了 [Tailwind CSS](https://tailwindcss.com) v4：

- [`postcss.config.mjs`](postcss.config.mjs) 注册了 `@tailwindcss/postcss` 插件。
- [`src/globals.css`](src/globals.css) 用一行 `@import "tailwindcss";` 引入 Tailwind。

在入口文件里引入 `globals.css`，就能在组件里直接使用工具类。详见 [Tailwind CSS with Extension.js](https://extension.js.org/docs/integrations/tailwindcss)。

## 规划

在这个基础之上还计划集成更多能力：

- [ ] ESLint
- [ ] ……更多

## 命令

### dev

以开发模式运行扩展。用 `--browser` 指定目标浏览器：

```bash
pnpm run dev
pnpm run dev -- --browser=firefox
pnpm run dev -- --browser=edge
```

### build

生产构建。为每个浏览器提供了便捷脚本：

```bash
pnpm run build           # Chrome（默认）
pnpm run build:firefox
pnpm run build:edge
```

### preview

在浏览器中预览生产构建：

```bash
pnpm run preview
```

## 了解更多

- [Extension.js 文档](https://extension.js.org)
- [React 模板](https://extension.js.org/docs/getting-started/templates/react)
