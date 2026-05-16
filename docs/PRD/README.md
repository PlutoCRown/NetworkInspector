# NetworkInspector PRD 索引

本目录是 **产品需求与预期行为** 的权威说明，供实现 Chrome 扩展及其他子包时查阅。原始背景见仓库根目录 [`PROPOSAL.md`](../../PROPOSAL.md)；可运行的配置/模板示例见：

- [`rule-group.schema.example.json`](../../rule-group.schema.example.json) — 规则组导出 JSON

## 阅读顺序（推荐）

| 文档 | 面向 | 内容 |
|------|------|------|
| [01-product-overview.md](./01-product-overview.md) | 全员 | 目标、用户、核心概念 |
| [02-architecture.md](./02-architecture.md) | 基建 / 扩展骨架 | Monorepo、技术栈、包边界 |
| [03-rule-group-model.md](./03-rule-group-model.md) | 配置 / 存储 | 规则组四段结构、JSON 模型 |
| [04-site-and-capture.md](./04-site-and-capture.md) | 后台 / 拦截 | 站点匹配、请求捕获 |
| [05-extraction.md](./05-extraction.md) | 解析引擎 | 按 URL 提取、字段来源语法 |
| [06-renderers-and-sidebar.md](./06-renderers-and-sidebar.md) | 侧边栏 UI | 预设 Renderer、卡片列表 |
| [07-template-syntax.md](./07-template-syntax.md) | Renderer | 内置 React 组件与字段注册 |
| [08-post-processing.md](./08-post-processing.md) | 数据管道 | alias、highlights、filter |
| [09-editor-and-import-export.md](./09-editor-and-import-export.md) | 设置页 / 工具栏 | 创建、导入导出、开关 |
| [10-modes-and-advanced.md](./10-modes-and-advanced.md) | 高级用户 | 普通模式 vs 高级模式、解码脚本 |
| [11-acceptance-criteria.md](./11-acceptance-criteria.md) | QA / 子 agent 验收 | 分模块验收清单 |

## 子 agent 分工建议

```
                    ┌─────────────────┐
                    │ 01 产品概览      │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   ┌───────────┐      ┌─────────────┐     ┌──────────────┐
   │ 02 架构    │      │ 03 规则模型  │     │ 09 编辑器/UI  │
   └─────┬─────┘      └──────┬──────┘     └──────┬───────┘
         │                   │                    │
         ▼                   ▼                    │
   ┌───────────┐      ┌─────────────┐            │
   │ 04 捕获    │◄─────│ 05 提取      │────────────┤
   └─────┬─────┘      └──────┬──────┘            │
         │                   │                    │
         ▼                   ▼                    ▼
   ┌───────────┐      ┌─────────────┐     ┌──────────────┐
   │ 08 后处理  │─────►│ 06 侧边栏    │◄────│ 07 模板语法   │
   └───────────┘      └─────────────┘     └──────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ 10 高级模式      │
                    │ 11 验收标准      │
                    └─────────────────┘
```

实现前请先读 **01** 与 **03**；改拦截逻辑读 **04**；改解析读 **05** + **08**；改 UI 读 **06** + **09**；改模板引擎读 **07**。

## 术语

| 术语 | 含义 |
|------|------|
| 规则组 | 一套完整的「在哪些站 → 抓哪些请求 → 如何提取 → 如何展示」配置 |
| Rule | `rules[]` 中的一项，绑定一个 `url` 模式及对应的提取/渲染/后处理 |
| Renderer | 卡片展示形态（预设或自定义模板） |
| 槽位 slot | 模板中 `x-title`、`x-expand` 等指令标记的展示区域 |
| 普通模式 | 表单化创建，预设 Renderer，无需写代码 |
| 高级模式 | 自定义解码 JS、自定义 HTML 模板 |

## 变更约定

- 修改 JSON 导出格式 → 同步更新 **03** 与根目录 `rule-group.schema.example.json`
- 修改模板语法 → 同步更新 **07** 与 `rule-group.render.example.html`
- 新增强制行为 → 在 **11** 增加对应验收项
