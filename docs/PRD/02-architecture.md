# 02 架构与技术栈

## 2.1 仓库结构

| 路径 | 说明 |
|------|------|
| `packages/extension` | Chrome MV3 扩展（React 19 + Vite 8 + Tailwind 4） |
| `packages/presets` | 共享类型、Renderer 定义、`example.json` 默认数据 |
| `docs/PRD` | 产品需求 |
| `debug.txt` | 调试用 curl 样例（可选） |

包管理：**Bun** workspaces。

## 2.2 技术选型

| 项 | 选型 |
|----|------|
| UI | shadcn 风格组件 + Tailwind v4（`@tailwindcss/vite`） |
| 扩展 | `@crxjs/vite-plugin`，Manifest V3 |
| 类型检查 | TypeScript 7 预览（`@typescript/native-preview` / `tsgo`） |
| 测试 | `bun test`（`shared/`） |

## 2.3 扩展分区

### Service Worker

- 加载状态、持久化、`processCapture`。
- 消息类型见 `shared/app/messages.ts`。

### Content（MAIN world）

- `inject-main.ts`：patch `fetch` / `XHR`，`postMessage` 到 relay。

### Side Panel / Popup / Editor

- 侧边栏：捕获列表 + `CaptureRenderer`。
- Popup：开关与规则组快捷操作。
- Editor：规则与全局 config 编辑（独立 HTML 页）。

## 2.4 数据流

```
[inject-main 捕获 url + requestBody + responseBody]
      → background: sites / capture 匹配
      → pipeline: splits → fields → 后处理
      → storage captures[]
      → side panel 展示
```

## 2.5 核心模块（`shared/`）

见 [appendix-codebase.md](./appendix-codebase.md)。

## 2.6 依赖文档

- [04-site-and-capture.md](./04-site-and-capture.md)
- [05-extraction.md](./05-extraction.md)
- [09-editor-and-import-export.md](./09-editor-and-import-export.md)
