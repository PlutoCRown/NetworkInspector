# 08 后处理：alias、highlights、filter

## 8.1 执行顺序

对每条 `CaptureRecord.data`，在渲染 **之前** 按 rule 配置依次应用：

```
原始提取 → alias → highlights 标记 → filter
```

- `alias` 与 `highlights` 只影响**展示值**或**展示分支**，不改变原始捕获存档（若实现「复制原始 JSON」功能，应读未 alias 的副本）。
- `filter` 可丢弃字段或整条记录。

## 8.2 作用域：`field`

所有后处理规则通过 `field` 指定 **Renderer 板块 / 数据键**（与 `fields` 的 key 一致，如 `title`、`popover`、`expend`）。

> 与 PRD 原文「在 renderer 的哪个板块生效」一致：`field` = 板块。

## 8.3 Alias

### 配置（JSON）

```json
{ "field": "title", "match": "page_view", "replace": "页面浏览" }
```

### 预期行为

- 仅当 `data[field]` 为 **字符串** 时，若 **全等或包含** `match`（实现需统一：推荐 **字符串全等**，示例按全等；若支持子串匹配需在 UI 标明）。
- 将匹配内容替换为 `replace`（全量替换该字符串值，或仅替换匹配子串——推荐 **整值替换** 当全等时）。
- 多条 alias：按数组顺序应用。
- 非字符串字段：跳过。

## 8.4 Highlights

### 配置

```json
{ "field": "title", "match": "error", "tone": "danger" }
```

### 预期行为

- 当 `data[field]` 字符串 **包含** `match` 子串时，标记该条 capture 的 highlight 状态：`{ field, tone }`。
- 多条命中：取 **第一条** 或 **优先级最高**（实现固定一种；推荐第一条）。
- **不修改** 字符串内容；仅影响 [06](./06-renderers-and-sidebar.md) 中 `CardCapture` 的标题着色（`data-tone`）。
- 高亮**视觉样式**由 Renderer/模板 CSS 定义（如 `.ni-card__title[data-tone="danger"]`）。

## 8.5 Filter

### 配置形态（示例 JSON）

```json
{ "field": "popover", "path": "debug", "equals": true, "action": "drop" }
{ "field": "expend", "path": "_internal", "action": "strip" }
```

### `action` 语义

| action | 含义 |
|--------|------|
| `drop` | 若条件满足，**丢弃整条 CaptureRecord**（不出现在侧边栏） |
| `strip` | 若条件满足，从 `data[field]` 对象中 **删除** `path` 键（仅当 field 值为 object 时） |

### 条件求值

- `path`：点分路径，在 `data[field]` 上求值。
- `equals`：严格相等比较。
- 未来可扩展 `contains`、`regex`（非一期）。

### 预期行为

| 场景 | 行为 |
|------|------|
| `field` 非 object 且 action 为 `strip` | 忽略该条 filter |
| `drop` 命中 | 侧边栏不展示该 capture |
| 多条 filter | 顺序执行；`drop` 后不再执行后续 |

## 8.6 示例 walkthrough

规则 `events-api`（见 [`rule-group.schema.example.json`](../../rule-group.schema.example.json)）：

1. 提取 `title = "page_view"`, `popover = { "debug": true, "x": 1 }`
2. alias → `title = "页面浏览"`
3. highlights → 无（无 error/purchase）
4. filter `popover.debug === true` → **整条 drop**，侧边栏无此条

规则 `beacon-api`：

1. filter `strip _internal` → 从 `expend` 对象删除 `_internal` 键后渲染。

## 8.7 设置页 UX

- 每条 rule 折叠面板：Alias / Highlights / Filter 三个子区。
- 每条后处理规则必须选择 `field`（下拉，选项来自当前 renderer 的字段键）。

## 8.8 依赖文档

- [03-rule-group-model.md](./03-rule-group-model.md)
- [06-renderers-and-sidebar.md](./06-renderers-and-sidebar.md)
- [07-template-syntax.md](./07-template-syntax.md)
