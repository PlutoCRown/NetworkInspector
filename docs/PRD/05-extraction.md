# 05 结构化提取

## 5.1 设计原则

- **每种 URL 模式单独配置**：`rules[]` 一项 = 设置页一个编辑板块。
- 同一 `capture` 池内，不同 URL 的请求体结构可能不同，不得共用一套 `fields`（除非用户显式复制配置）。

## 5.2 提取流程（预期）

对每条已捕获请求：

1. 根据 [04](./04-site-and-capture.md) 命中 `rules[].url`。
2. 读取该 rule 的 `fields`。
3. 按每个 field 的**字段表达式**解析（`field-expr`：Source / item / processor / alias）。
4. 若 rule 配置了 `aggregateFrom`（含 `|aggregate`），先解析数组再对每项求 `item:` 字段。
5. 将结果组装为 **扁平对象**，键为 field 名，值为 `string | object | null`。
6. 传入后处理管道（[08](./08-post-processing.md)）。
7. 输出 **CaptureRecord** 供渲染：

```ts
// 逻辑类型，实现语言可不同
interface CaptureRecord {
  ruleGroupId: string;
  ruleId: string;
  requestUrl: string;
  timestamp: number;
  data: Record<string, unknown>; // 键与 fields / 模板占位符一致
}
```

## 5.3 字段来源语义

| 来源 | 取值范围 | 路径语法 |
|------|----------|----------|
| `query` | URLSearchParams | 单 key 名，如 `action` |
| `json` | 解析后的 JSON | 点分路径 `a.b.c`；空路径表示根 |
| `form-data` | multipart 字段 | 字段名 |
| `header` | 请求头 | 头名称（大小写不敏感） |

### 预期行为

| 场景 | 行为 |
|------|------|
| JSON 解析失败 | 该 field 值为 `null`；卡片对应槽位显示占位「—」或隐藏（与 [06](./06-renderers-and-sidebar.md) 一致） |
| 路径不存在 | `null` |
| 值为对象/数组 | 原样保留；模板中对象默认 `JSON.stringify` 美化展示 |
| `json:` 根为数组 | 允许，`expend` 等字段可为 array |

## 5.4 设置页输入 UX

### 必须先选 Renderer

编辑板块顶部选择 `card` / `divider`，**再**展示对应数量的字段行（见 `RENDERER_DEFINITIONS`）。

### 字段行（Tag 顺序）

1. **Source** tag：`json` / `query` / `form-data` / `header`（必选、仅一个、在最前）
2. 输入路径；聚合源可点 **+ Aggregate**
3. 聚合模式下字段 scope 为 **item**，路径如 `name`
4. 可选 **+ Processor**（`time` / `datetime` / `date` 或全局自定义）
5. 可选 **+ Alias**（引用全局 `aliasMaps` 名称）

序列化示例：`item:time|processor:time|alias:埋点名`；聚合源：`json:0.events|aggregate`。

### 全局配置

编辑器侧栏「全局配置」：`aliasMaps`、`customProcessors`（`(value) => ...` JS）。

### 校验

- 每个必填 field（由 renderer 决定）非空才能保存。
- Source 缺失或顺序错误时输入框提示。

## 5.5 与示例 JSON 的对照

[`rule-group.schema.example.json`](../../rule-group.schema.example.json) 中：

- `events-api`：`title` ← `json:event`，`popover` ← `json:properties`
- `beacon-api`：`title` ← `query:action`，`desc` ← `query:module`，`expend` ← 整个 JSON body

## 5.6 子 agent 禁止

- 不得在提取阶段做渲染或 DOM 操作。
- 不得在未命中 `rules` 时猜测默认字段名。

## 5.7 依赖文档

- [03-rule-group-model.md](./03-rule-group-model.md)
- [08-post-processing.md](./08-post-processing.md)
- [10-modes-and-advanced.md](./10-modes-and-advanced.md)
