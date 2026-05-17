# NetworkInspector

[![Deploy documentation](https://github.com/PlutoCRown/NetworkInspector/actions/workflows/docs.yml/badge.svg)](https://github.com/PlutoCRown/NetworkInspector/actions/workflows/docs.yml)
[![Chrome MV3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/)
[![Bun](https://img.shields.io/badge/Bun-workspaces-000?logo=bun)](https://bun.sh)

面向埋点与网络请求调试的 **Chrome 扩展**。在目标站点启用规则组后，按配置拦截请求、提取结构化字段，并在**侧边栏**以卡片形式展示捕获结果。

**在线文档：** https://plutocrown.github.io/NetworkInspector/

**AI Agent：** 生成规则组 JSON 请先读 [Agent 配置指南](https://plutocrown.github.io/NetworkInspector/guide/for-agents) 或仓库根目录 [`llms.txt`](./llms.txt)。

---

## 特性

- **规则组流水线** — 站点匹配 → URL 捕获 → 字段提取 → Renderer 渲染
- **字段表达式** — `[source:json]`、`[aggregate:item]`、`[processor:id]`、`[alias:mapkey]` 可组合
- **批量拆分** — `splits` 将单次请求中的数组展开为多条侧边栏记录
- **可视化配置** — 独立编辑器管理规则组、Processor、Alias；支持 JSON / 全量包导入导出
- **内置 Processor** — 首次安装自带时间格式化、JSON 解析等处理器；规则组需自行配置或从 `example.json` 导入

## 架构概览

```
页面 (fetch / XHR)
    → Content Script 采集 request / response
        → Service Worker 匹配规则组 + pipeline 提取
            → chrome.storage 持久化
                → Side Panel 展示卡片
```

技术栈：React 19 · Vite 8 · Tailwind CSS 4 · `@crxjs/vite-plugin` · Bun workspaces。

## 快速开始

### 环境

- [Bun](https://bun.sh/) 1.1+
- Google Chrome（Side Panel + MV3）

### 开发

```bash
git clone https://github.com/PlutoCRown/NetworkInspector.git
cd NetworkInspector
bun install
bun run dev
```

在 Chrome 打开 `chrome://extensions` → **开发者模式** → **加载已解压的扩展程序** → 选择：

```
packages/extension/dist
```

### 构建与测试

```bash
bun run build      # 扩展生产构建
bun run typecheck  # TypeScript（tsgo）
bun run test       # shared 单元测试
```

### 文档站（本地）

```bash
bun run docs:dev    # http://localhost:5173/NetworkInspector/
bun run docs:build  # 输出 packages/docs/.vitepress/dist
```

文档由 [VitePress](https://vitepress.dev/) 构建，通过 GitHub Actions 部署至 GitHub Pages（`base: /NetworkInspector/`）。

- [Agent 配置指南](https://plutocrown.github.io/NetworkInspector/guide/for-agents)（含 DevTools Network 分析流程）
- [`llms.txt`](./llms.txt) — 供 LLM / Agent 拉取的机器可读摘要

## 仓库结构

| 路径 | 说明 |
|------|------|
| [`packages/extension`](./packages/extension) | Chrome 扩展主包（Popup / Side Panel / Editor / Background） |
| [`packages/presets`](./packages/presets) | 示例配置 [`example.json`](./packages/presets/example.json) |
| [`packages/docs`](./packages/docs) | VitePress 文档站（同步 `docs/PRD`） |
| [`docs/PRD`](./docs/PRD) | 产品需求文档（源文件） |

## 配置说明

- 默认 Processor 见 `packages/extension/src/shared/field/processor-examples.ts`；示例规则组见 `packages/presets/example.json`（导入用，非内置）
- 参考示例：`packages/presets/example.json`
- 字段语法与模型详见 [产品文档](https://plutocrown.github.io/NetworkInspector/prd/)

## 贡献

1. Fork 本仓库
2. 创建功能分支并提交变更
3. 确保 `bun run build`、`bun run test` 通过
4. 发起 Pull Request

PRD 变更请同步更新 `docs/PRD`，文档站会在 build 时自动同步。

## License

尚未添加开源许可证文件；如需二次分发请先与维护者确认。
