# 03 规则组数据模型

## 3.1 顶层结构

规则组导出为 **单个 JSON 对象**（非 JSON Schema 文档）。权威示例：[`rule-group.schema.example.json`](../../rule-group.schema.example.json)。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `version` | number | 是 | 格式版本，当前为 `1` |
| `id` | string | 是 | 规则组唯一 ID |
| `name` | string | 是 | 展示名称 |
| `enabled` | boolean | 是 | 是否启用；工具栏可快速切换 |
| `sites` | string[] | 是 | 站点 URL 正则列表（页面级匹配） |
| `capture` | string[] | 是 | 请求 URL 正则列表（全局捕获池） |
| `rules` | Rule[] | 是 | 按 URL 细分的提取与展示规则 |

## 3.2 Rule 对象

`rules` 数组每一项对应设置页中的 **一个 URL 编辑板块**。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 规则块 ID，导入后保持稳定 |
| `url` | string | 是 | 与 `capture` 中某条对应的 URL 正则（或子模式） |
| `renderer` | string | 是 | 预设 ID 或 `custom` |
| `fields` | Record<string, string> | 是 | 字段名 → `"来源:路径"` |
| `alias` | AliasRule[] | 否 | 见 [08](./08-post-processing.md) |
| `highlights` | HighlightRule[] | 否 | 见 [08](./08-post-processing.md) |
| `filters` | FilterRule[] | 否 | 见 [08](./08-post-processing.md) |
| `decode` | string | 否 | 覆盖本 rule 的解码脚本（高级模式） |
| `template` | string | 否 | 覆盖本 rule 的模板（`renderer: custom` 时） |

### 3.2.1 `fields` 键名与 Renderer 的对应关系

| `renderer` | `fields` 必须包含的键 |
|------------|-------------------------|
| `title-popover` | `title`, `popover` |
| `title-desc-expand` | `title`, `desc`, `expend` |
| `custom` | 与模板中 `{{...}}` 占位符一致 |

> 注：产品文案与示例中使用 `expend`（与 expand 同义），实现与文档保持一致，勿擅自改名为 `expand` 除非全库迁移。

### 3.2.2 `fields` 值格式：`来源:路径`

```
query:action      → URL query 参数 action
json:event.name   → JSON body 点路径
json:             → 整个 JSON body（路径为空）
form-data:email   → multipart/form 字段
header:x-trace-id → 请求头
```

- **来源**枚举：`query` | `json` | `form-data` | `header`
- **路径**：该来源下的 key path；`json:` 表示根对象
- 设置页输入 UX：GitHub 搜索框式 **tag + 路径**（见 [05-extraction.md](./05-extraction.md)）

## 3.3 预设 Renderer ID

| ID | 结构 | 设置页表单项数量 |
|----|------|------------------|
| `title-popover` | `title: string`, `popover: object` | 2 |
| `title-desc-expand` | `title: string`, `desc: string`, `expend: object` | 3 |

内置预设的 **布局与交互** 由扩展实现；导出 JSON 时 **不必** 嵌入预设的 HTML，仅写 `renderer` 字段。

## 3.4 匹配优先级（预期行为）

1. 请求 URL 必须先被 `capture` 中**至少一条**正则匹配。
2. 在匹配的 `rules` 中，取 **`url` 正则最长匹配或最具体的一条**（实现需固定策略并在代码注释中写明；推荐：最长匹配，若无则第一条匹配）。
3. 未匹配任何 `rules[].url` 的请求：**记录为未配置提取**，侧边栏可显示「未匹配 rule」调试项（仅开发模式）或静默丢弃（生产默认静默丢弃，二选一需在实现中配置）。

## 3.5 持久化与 Import

- Import：解析 JSON → 校验必填字段 → 合并或覆盖同 `id` 规则组。
- Export：序列化当前编辑状态为与示例同结构的 JSON。
- `version` 不匹配时：拒绝 Import 并提示升级扩展。

## 3.6 依赖文档

- [04-site-and-capture.md](./04-site-and-capture.md)
- [05-extraction.md](./05-extraction.md)
- [08-post-processing.md](./08-post-processing.md)
