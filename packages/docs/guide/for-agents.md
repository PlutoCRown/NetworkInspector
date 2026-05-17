# Agent 配置指南

::: info 给 AI Agent
本文档说明如何帮用户**生成可导入的规则组 JSON**。机器可读摘要见站点根路径 [**llms.txt**](/llms.txt)（部署后：`/NetworkInspector/llms.txt`）。
:::

## 你应该做什么

用户安装 NetworkInspector 后，往往不知道如何写「规则组」。你的核心任务是：

1. 弄清用户要在哪个网站、捕获哪类请求、侧边栏想展示哪些字段；
2. 分析请求 URL 与 body 结构；
3. 输出**合法**的 `RuleGroup` JSON（必要时附带 Processor / Alias）；
4. 说明导入路径：Popup 文件导入、编辑器「表单/JSON」或 About 全量包。

## 插件是什么

**NetworkInspector** 是 Chrome MV3 扩展：

- 在页面 URL 命中 `sites` 且请求 URL 命中 `capture` 时拦截请求；
- 按 `rules[].fields` 中的**字段表达式**从 request/response 取值；
- 在**侧边栏**用 `card` / `divider` 渲染捕获结果。

不适合替代 DevTools 全量抓包；专注**可配置的埋点展示**。

## 安装（转述给用户）

```bash
git clone https://github.com/PlutoCRown/NetworkInspector.git
cd NetworkInspector
bun install && bun run build
```

Chrome → `chrome://extensions` → 开发者模式 → 加载 `packages/extension/dist`。

## 有视觉能力：DevTools Network 工作流

当用户能提供屏幕截图，或你能在浏览器环境中操作时，按下列步骤**先找请求、再写 JSON**。

### 1. 打开 Network 面板

1. 目标站点标签页按 `F12`（macOS：`Cmd+Option+I`）。
2. 切换到 **Network / 网络**。
3. 建议勾选 **Preserve log（保留日志）**。
4. 过滤器选择 **Fetch/XHR**（减少静态资源干扰）。

### 2. 触发并筛选疑似埋点

让用户重复一次业务操作（点击按钮、进入页面、滑动 feed 等）。

在请求列表中寻找：

| 线索 | 说明 |
|------|------|
| URL 路径 | `/log`、`/collect`、`/track`、`/list`、`/beacon` 等 |
| 域名 | `mcs.*`、`sa.*`、`sensorsdata`、`analytics.*`、`apm.*` 等 |
| 方法 | 多为 `POST` |
| 类型 | `fetch` / `xhr` |
| Payload | JSON 对象，常含 `event`、`events`、`action`、`params` |

选中**最像埋点上报**的一条（若有多条，可分别为每条 rule 写 `rules[]` 项）。

### 3. 记录 URL 正则

在 **Headers** 中复制 **Request URL**，例如：

```http
POST https://mcs.zijieapi.com/list?...
```

写入规则组：

- `capture`: 能匹配该 URL 的正则，如 `mcs\.zijieapi\.com/list`
- `rules[].url`: 通常与 capture 中对应项一致
- `sites`: 匹配**页面**地址，如 `douyin\.com/.*`（注意正则转义 `.`）

### 4. 分析 Payload 结构（关键）

打开 **Payload** / **Request**（**不是** Response，除非埋点数据在响应里）。

**默认：POST 上报类接口的数据在请求体** → 字段表达式用 `[source:json]`。

示例结构：

```json
{
  "header": { ... },
  "events": [
    { "event": "page_view", "session_id": "...", "params": "{...}" }
  ]
}
```

判断：

- 是否有**数组**需要「一条请求 → 多张卡片」？
  - 是 → 配置 `splits`，例如 `{ "item": "[source:json]0.events" }` 或 `{ "item": "[source:json]events" }`（路径以实际 JSON 为准）。
  - 否 → 不写 `splits`，`fields` 直接用 `[source:json]fieldName`。
- `params` 等为 **JSON 字符串** 时，在路径后加 `[processor:JSONParser]`（内置 Processor）。

**仅当**业务数据只在 **Response** 里时，才使用 `[source:response]...`。

### 5. 映射到 fields

`renderer: "card"` 时需要：

| 键 | 建议 |
|----|------|
| `title` | 事件名、action、主标识 |
| `desc` | session_id、page、次要信息 |
| `expand` | 完整 params / properties 对象（可挂 JSONParser） |

有 `splits` 时路径前缀用 `[aggregate:item]`（`item` 与 splits 键名一致）。

### 6. 输出 JSON 并说明导入

将完整 `RuleGroup` 交给用户，并说明：

- Popup → 导入 JSON；或
- 编辑器 → 新建/选中规则组 → JSON 模式粘贴 → 保存。

## 无视觉能力时

向用户索要：

1. 当前页面 URL（用于 `sites`）；
2. 一条埋点请求的 **完整 URL**；
3. **Request Payload** 原文（JSON，可脱敏）；
4. 希望展示的 2～3 个字段含义。

然后按 [字段表达式](./field-expressions) 与 [规则组模型](/prd/03-rule-group-model) 生成配置。

## 最小可用示例

单条事件、无数组拆分：

```json
{
  "version": 1,
  "id": "group-simple",
  "name": "简单埋点",
  "enabled": true,
  "sites": ["^https?://localhost"],
  "capture": ["api\\.example\\.com/event"],
  "rules": [
    {
      "id": "rule-1",
      "url": "api\\.example\\.com/event",
      "renderer": "card",
      "fields": {
        "title": "[source:json]event_name",
        "desc": "[source:json]user_id",
        "expand": "[source:json]properties"
      }
    }
  ]
}
```

批量 `events` 数组（与仓库 `example.json` 中抖音规则类似）：

```json
{
  "version": 1,
  "id": "group-batch",
  "name": "批量 events",
  "enabled": true,
  "sites": ["example\\.com/.*"],
  "capture": ["api\\.example\\.com/collect"],
  "rules": [
    {
      "id": "rule-batch",
      "url": "api\\.example\\.com/collect",
      "renderer": "card",
      "splits": { "item": "[source:json]events" },
      "fields": {
        "title": "[aggregate:item]event",
        "desc": "[aggregate:item]session_id",
        "expand": "[aggregate:item]params[processor:JSONParser]"
      }
    }
  ]
}
```

## 常见错误

| 错误 | 正确做法 |
|------|----------|
| 用 `[source:json]` 读响应体 | 响应用 `[source:response]` |
| 有 events 数组却不写 splits | 写 `splits` + `[aggregate:item]` |
| 正则未转义 `.` | `example.com` → `example\.com` |
| 使用 `aggregate: true` | 已废弃，仅用 `splits` |
| card 缺少 expand | 三字段都需存在（可为空路径但键要有） |

## 进一步阅读

- [字段表达式](./field-expressions)
- [PRD：规则组模型](/prd/03-rule-group-model)
- [PRD：提取管道](/prd/05-extraction)
- [PRD：编辑器与导入](/prd/09-editor-and-import-export)
- 仓库示例：[packages/presets/example.json](https://github.com/PlutoCRown/NetworkInspector/blob/main/packages/presets/example.json)
