# NetworkInspector PRD 索引

产品需求与预期行为说明。背景见 [`PROPOSAL.md`](../../PROPOSAL.md)。

- [`rule-group.schema.example.json`](../../rule-group.schema.example.json) — 规则组 JSON 示例

## 阅读顺序

| 文档 | 内容 |
|------|------|
| [01-product-overview.md](./01-product-overview.md) | 目标与用户 |
| [02-architecture.md](./02-architecture.md) | Monorepo 与包边界 |
| [03-rule-group-model.md](./03-rule-group-model.md) | 规则组与字段表达式 |
| [04-site-and-capture.md](./04-site-and-capture.md) | 站点与捕获 |
| [05-extraction.md](./05-extraction.md) | 提取管道 |
| [06-renderers-and-sidebar.md](./06-renderers-and-sidebar.md) | 侧边栏 UI |
| [07-renderers.md](./07-renderers.md) | Renderer 注册 |
| [08-post-processing.md](./08-post-processing.md) | alias / filter |
| [09-editor-and-import-export.md](./09-editor-and-import-export.md) | 编辑器与导入导出 |
| [10-modes-and-advanced.md](./10-modes-and-advanced.md) | 当前版本范围 |
| [11-acceptance-criteria.md](./11-acceptance-criteria.md) | 验收清单 |

## 术语

| 术语 | 含义 |
|------|------|
| 规则组 | 站点 + 捕获 + 多条 Rule |
| 字段表达式 | `[source:json]path[processor:x][alias:id]` 或固定文本 |
| Renderer | card / divider 展示组件 |
| AppExportBundle | 全量导出 JSON |

## 变更约定

- JSON 模型变更 → 更新 **03** 与 `rule-group.schema.example.json`
- 新 Renderer → 更新 **06**、**07** 与 `presets/src/renderers.ts`
