# 03 规则组数据模型

## 3.1 顶层结构

规则组为 **单个 JSON 对象**。全量示例见 [`packages/presets/example.json`](../../packages/presets/example.json) 中的 `ruleGroups[]`。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `version` | number | 是 | 格式版本，当前为 `1` |
| `id` | string | 是 | 规则组唯一 ID |
| `name` | string | 是 | 展示名称 |
| `enabled` | boolean | 是 | 是否启用 |
| `sites` | string[] | 是 | 页面 URL 正则（`tabUrl`） |
| `capture` | string[] | 是 | 请求 URL 正则列表 |
| `rules` | Rule[] | 是 | 按 URL 细分的提取与展示规则 |

保存时 `capture` 由 `rules[].url` 派生（`normalizeRuleGroup`）。

## 3.2 Rule 对象

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 规则块 ID |
| `url` | string | 是 | 请求 URL 正则，须能被 `capture` 匹配 |
| `renderer` | string | 是 | `card` \| `divider` |
| `splits` | Record<string, string> | 否 | 拆分名 → 来源表达式，如 `{ "item": "[source:json]0.events" }` |
| `fields` | Record<string, string> | 是 | Renderer 字段名 → 字段表达式 |
| `alias` | AliasRule[] | 否 | 见 [08](./08-post-processing.md) |
| `highlights` | HighlightRule[] | 否 | 见 [08](./08-post-processing.md) |
| `filters` | FilterRule[] | 否 | 见 [08](./08-post-processing.md) |

**不再支持**：`aggregateFrom`、`aggregate: true`、`[scope:item]`（请用 `splits` + `[aggregate:item]`）。

### 3.2.1 `fields` 与 Renderer

| `renderer` | `fields` 键 |
|------------|-------------|
| `card` | `title`, `desc`, `expand` |
| `divider` | `title` |

### 3.2.2 字段表达式（方括号语法）

```
[source:json]action[processor:time][alias:mapkey]
[aggregate:item]action
[source:response]data.path
页面浏览
```

| 片段 | 含义 |
|------|------|
| `[source:json]` | 请求 body JSON |
| `[source:response]` | 响应 body（JSON 或原文） |
| `[source:query]` / `form-data` / `header` | 见 [05](./05-extraction.md) |
| `[aggregate:name]` | 当前拆分项（`splits` 中的 `name`）上的路径 |
| `[aggregate]` | 等价于 `[aggregate:item]`（默认拆分名 `item`） |
| `[processor:id]` | 全局 Processor |
| `[alias:mapkey]` | 全局 Alias 组 |
| 无 tag 的纯文本 | 固定展示文案 |

### 3.2.3 `splits` 行为

- 来源表达式解析为**数组**时：一项一条捕获卡片。
- 来源为**非数组**（对象、字符串等）：视为 **1 条**捕获。
- 来源为空 / 解析失败：不产生捕获。

## 3.3 全量导出包（AppExportBundle）

About 页「导出全部配置」：

```json
{
  "version": 1,
  "exportedAt": 1730000000000,
  "extensionVersion": "0.1.0",
  "ruleGroups": [],
  "config": {
    "aliasMaps": {},
    "customProcessors": {}
  },
  "activeRuleGroupId": "group-id"
}
```

## 3.4 匹配优先级

1. `tabUrl` 匹配 `sites` 中任一条。
2. `request.url` 匹配 `capture` 中任一条。
3. 在 `rules` 中取 **`url` 正则匹配最长** 的一条。

## 3.5 依赖文档

- [04-site-and-capture.md](./04-site-and-capture.md)
- [05-extraction.md](./05-extraction.md)
- [09-editor-and-import-export.md](./09-editor-and-import-export.md)
