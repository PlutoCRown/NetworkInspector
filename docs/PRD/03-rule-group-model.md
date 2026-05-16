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
| `renderer` | string | 是 | 预设 ID：`card` \| `divider` |
| `aggregate` | boolean | 否 | 已废弃；由 `aggregateFrom` 是否含 `\|aggregate` 推断 |
| `aggregateFrom` | string | 否 | 聚合数组来源，如 `json:data\|aggregate` |
| `fields` | Record<string, string> | 是 | 字段名 → 字段表达式（见 3.2.2） |
| `alias` | AliasRule[] | 否 | 见 [08](./08-post-processing.md) |
| `highlights` | HighlightRule[] | 否 | 见 [08](./08-post-processing.md) |
| `filters` | FilterRule[] | 否 | 见 [08](./08-post-processing.md) |
### 3.2.1 `fields` 键名与 Renderer 的对应关系

定义见 `packages/presets/src/renderers.ts`：

| `renderer` | `fields` 键 |
|------------|-------------|
| `card` | `title`, `desc`, `expend`, `popover`（按需填写） |
| `divider` | `title` |

> 注：产品文案与示例中使用 `expend`（与 expand 同义），实现与文档保持一致，勿擅自改名为 `expand` 除非全库迁移。

### 3.2.2 字段表达式（管道符串联）

Tag 顺序：**Source**（必填，且仅一个、在最前）→ 可选 **Aggregate**（仅 `aggregateFrom`）→ 路径 → 可选 **Processor** / **Alias**。

```
json:event.name              → JSON body 点路径
json:data|aggregate          → 聚合数组来源（打散后逐条渲染）
item:action                  → 聚合模式下当前数组项字段
item:time|processor:time     → 取值后走内置/自定义 processor
item:event|alias:埋点名       → 取值后走全局 aliasMaps["埋点名"]
```

- **Source**：`query` | `json` | `form-data` | `header`
- **Scope**：`item` 表示数组项（旧 `aggregate:path` 导入时迁移为 `item:path`）
- 全局 **AppConfig**（别名表、自定义 processor）见编辑器「全局配置」

## 3.3 预设 Renderer ID

| ID | React 组件 | 说明 |
|----|------------|------|
| `card` | `CardCapture` | 标题/描述/悬停 Popover/点击展开 |
| `divider` | `DividerCapture` | 分割线 + 居中 title |

旧 ID `title-popover`、`title-desc-expand` 导入时自动映射为 `card`。

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
