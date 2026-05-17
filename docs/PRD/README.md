# NetworkInspector PRD

产品需求与预期行为。背景见 [`PROPOSAL.md`](../../PROPOSAL.md)。

**配置示例**

| 文件 | 用途 |
|------|------|
| [`packages/presets/example.json`](../../packages/presets/example.json) | 示例规则组 + Processor + Alias（导入参考，扩展首次安装不含规则组） |
| 单规则组 JSON | 编辑器导出 / Import |

## 阅读顺序

| 文档 | 内容 |
|------|------|
| [01-product-overview.md](./01-product-overview.md) | 目标与用户 |
| [02-architecture.md](./02-architecture.md) | Monorepo、扩展分区、数据流 |
| [03-rule-group-model.md](./03-rule-group-model.md) | 规则组、字段表达式、`splits` |
| [04-site-and-capture.md](./04-site-and-capture.md) | 站点与请求捕获 |
| [05-extraction.md](./05-extraction.md) | 提取管道与数据来源 |
| [06-ui-and-renderers.md](./06-ui-and-renderers.md) | 侧边栏与 Renderer（含注册说明） |
| [08-post-processing.md](./08-post-processing.md) | alias / highlights / filters |
| [09-editor-and-import-export.md](./09-editor-and-import-export.md) | 编辑器与导入导出 |
| [10-modes-and-advanced.md](./10-modes-and-advanced.md) | 当前版本范围 |
| [11-acceptance-criteria.md](./11-acceptance-criteria.md) | 验收清单 |
| [appendix-codebase.md](./appendix-codebase.md) | 代码目录与重构备忘 |

## 术语

| 术语 | 含义 |
|------|------|
| 规则组 | `sites` + `capture` + 多条 `rules` |
| 字段表达式 | `[source:json]path[processor:id][alias:mapkey]`、`[aggregate:item]path` 或固定文本 |
| `splits` | 将一次请求拆成多条卡片的数组来源表达式 |
| Processor | `config.customProcessors` 中的 JS `(value) => …` |
| Alias | `config.aliasMaps` 中的值映射表 |
| Renderer | `card` / `divider` |
| AppExportBundle | About 全量导出 JSON |

## 变更约定

| 变更类型 | 更新文档 |
|----------|----------|
| JSON 模型、字段语法 | **03**、**05**、**11** |
| 新 Renderer | **06**、`presets/src/renderers.ts` |
| 捕获/拦截方式 | **04**、**02** |
| 编辑器 IA | **09**、**11** |
| 代码目录重组 | **appendix-codebase**、**02** |
