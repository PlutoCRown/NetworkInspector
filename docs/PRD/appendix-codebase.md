# 附录：代码库结构与质量备忘

> 实现与 PRD 对照用；重构优先级供维护参考。

## 目录（`packages/extension/src`）

```
background/          service-worker：捕获入口、存储、消息
content/             inject-main（MAIN world fetch/XHR 补丁）
editor/              规则/Processor/Alias 编辑器
  form/              各编辑区块
  App.tsx            编辑器壳（偏大，可拆）
  EditorSidebar.tsx  左侧导航（偏大，可拆）
popup/ | sidepanel/  弹窗与侧边栏列表
components/          通用 UI
  FieldRefInput.tsx  字段表达式输入（偏大，建议拆）
  renderers/         捕获卡片
hooks/               useAppState、useImportJson
lib/                 message、utils
shared/              无 UI 的核心逻辑（可独立测试）
  app/               存储、bundle、校验、meta
  capture/           pipeline、后处理、可见性
  field/             表达式、提取、Processor
  rule/              规则组 normalize
  render/            Renderer 注册表
  util/              path、regex
```

`packages/presets/`：`example.json`（默认规则组 + config）、`renderers.ts`、类型。

## 偏长文件（>250 行，建议后续拆分）

| 文件 | 行数量级 | 建议 |
|------|----------|------|
| `FieldRefInput.tsx` | ~500 | 拆为 `FieldRefTags`、`FieldRefPathInput`、`useFieldRefInput` |
| `EditorSidebar.tsx` | ~330 | 拆 `SidebarNavItem`、`SidebarSubList` |
| `editor/App.tsx` | ~340 | 拆 `EditorHeader`、各 section 路由 |
| `AliasSection.tsx` | ~260 | `AliasMapGroupCard` 独立文件 |
| `popup/App.tsx` | ~240 | 规则组列表子组件 |

当前行数可维护，**非阻断**；优先在改 UI 时顺带拆。

## 已落实的工程质量

- 核心逻辑在 `shared/`，`bun test ./src/shared` 覆盖 pipeline、expr、extract。
- TypeScript 7 预览（`tsgo`），`json` / `response` 数据源分离。
- 字段输入 `lastEmittedRef`，避免受控回写吞字。
- Processor 校验与运行共用 `processor-compile.ts`。
- 默认配置来自 `presets/example.json` 的 `ruleGroups`。

## 与 PRD 曾不一致、已在 PRD 中修正的点

- 无 `popover`、无 `[scope:item]`、无 `aggregateFrom`。
- `[source:json]` 仅 request body；响应用 `[source:response]`。
- `splits` 源非数组时按**单条**展开（`coerceSplitItems`）。
- 编辑器侧栏：规则组 / 处理器 / 别名；规则组列表无「导入 JSON」（About / Popup 保留导入）。
