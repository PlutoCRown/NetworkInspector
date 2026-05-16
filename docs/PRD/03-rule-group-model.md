# 03 规则组数据模型

## 3.1 顶层结构

规则组导出为 **单个 JSON 对象**。权威示例：[`rule-group.schema.example.json`](../../rule-group.schema.example.json)。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `version` | number | 是 | 格式版本，当前为 `1` |
| `id` | string | 是 | 规则组唯一 ID |
| `name` | string | 是 | 展示名称 |
| `enabled` | boolean | 是 | 是否启用 |
| `sites` | string[] | 是 | 站点 URL 正则列表 |
| `capture` | string[] | 是 | 请求 URL 正则列表 |
| `rules` | Rule[] | 是 | 按 URL 细分的提取与展示规则 |

## 3.2 Rule 对象

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 规则块 ID |
| `url` | string | 是 | 与 `capture[]` 对应索引的 URL 正则 |
| `renderer` | string | 是 | `card` \| `divider` |
| `splits` | Record<string, string> | 否 | 拆分名 → 数组来源，如 `{ "item": "[source:json]events" }` |
| `fields` | Record<string, string> | 是 | 字段名 → 字段表达式 |
| `alias` | AliasRule[] | 否 | 见 [08](./08-post-processing.md) |
| `highlights` | HighlightRule[] | 否 | 见 [08](./08-post-processing.md) |
| `filters` | FilterRule[] | 否 | 见 [08](./08-post-processing.md) |

### 3.2.1 `fields` 与 Renderer

| `renderer` | `fields` 键 |
|------------|-------------|
| `card` | `title`, `desc`, `expand`, `popover` |
| `divider` | `title` |

### 3.2.2 字段表达式（方括号语法）

```
[source:json]action[processor:time][alias:mapkey]
[aggregate:item]action
[source:json]data[aggregate]
页面浏览
```

| 片段 | 含义 |
|------|------|
| `[source:json]` | 数据来源：json / response / query / form-data / header |
| `[aggregate:name]` | 从 `splits` 中对应拆分的当前数组项取值 |
| `[aggregate]` | 将来源路径解析为数组并逐条渲染 |
| `[processor:id]` | 内置或自定义 Processor |
| `[alias:mapkey]` | 全局 Alias 组（mapkey 自动生成） |
| 无 tag 的纯文本 | 固定展示文案 |

## 3.3 全量导出包（AppExportBundle）

About 页「导出全部配置」JSON 结构：

```json
{
  "version": 1,
  "exportedAt": 1730000000000,
  "extensionVersion": "0.1.0",
  "ruleGroups": [ /* RuleGroup[] */ ],
  "config": {
    "aliasMaps": { "alias-xxx": { "name": "组名", "mappings": {} } },
    "customProcessors": { "fn-id": "(value) => value" }
  },
  "activeRuleGroupId": "group-id"
}
```

## 3.4 匹配优先级

1. 请求 URL 须匹配 `capture` 中至少一条正则。
2. 在匹配的 `rules` 中取 **最长 `url` 匹配** 的一条。
3. 未匹配则丢弃（开发模式可提示）。

## 3.5 依赖文档

- [04-site-and-capture.md](./04-site-and-capture.md)
- [05-extraction.md](./05-extraction.md)
- [09-editor-and-import-export.md](./09-editor-and-import-export.md)
