# NetworkInspector

Chrome 扩展：按规则组捕获网络请求并在侧边栏展示结构化埋点数据。

## 开发

```bash
bun install
bun run dev
```

在 Chrome 打开 `chrome://extensions` → 开发者模式 → 「加载已解压的扩展程序」→ 选择 `packages/extension/dist`。

## 包结构

- `packages/extension` — Chrome MV3 扩展（React + Vite + shadcn 风格 UI）
- `docs/PRD` — 产品需求文档
- `rule-group.schema.example.json` — 规则组配置示例

## 测试

1. 加载扩展后，在 Popup 中 Import 示例 JSON（或已预置的 Acme 示例）。
2. 打开 `packages/extension/test-page.html`（或任意页面）发送测试请求。
3. 打开侧边栏查看捕获卡片。
