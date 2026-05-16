# 05 结构化提取

## 5.1 流程

1. 页面 `tabUrl` 命中规则组 `sites`，请求 URL 命中 `capture`。
2. 按最长匹配选择 `rules[]` 中一条。
3. 若配置 `splits`：解析拆分源 → 对每项求 `fields`（见 5.3）。
4. 否则：直接对整次请求求 `fields`。
5. 后处理 [08](./08-post-processing.md)。
6. 输出 `CaptureRecord` → [06](./06-ui-and-renderers.md) 渲染。

实现：`shared/capture/pipeline.ts`、`shared/field/*`。

## 5.2 数据来源

| Source | 说明 |
|--------|------|
| `json` | **仅** `requestBody` 解析 JSON |
| `response` | **仅** `responseBody`（JSON 则按路径取，否则原文） |
| `query` | URL 查询参数 |
| `form-data` | urlencoded / 可解析表单 body |
| `header` | 请求头 |

POST 上报类接口（如抖音 `mcs.zijieapi.com/list`）应使用 `[source:json]` 指向请求体；不要用 `json` 读响应。

## 5.3 字段表达式

- 编辑器：`FieldRefInput`（`/` 补全、Processor 多 Tag）。
- 拆分源写在规则 `splits`：`{ "item": "[source:json]0.events" }`。
- 项内字段：`[aggregate:item]event`、`[aggregate:item]params[processor:JSONParser]` 等。

## 5.4 全局 Processor / Alias

- Processor：`config.customProcessors`，示例见 `processor-examples.ts`（`time`、`date`、`datetime`、`JSONParser`）。
- Alias：`config.aliasMaps`，字段 `[alias:mapkey]`。
- 保存前校验：`validate-config.ts`（Processor 函数体须可编译）。

## 5.5 依赖文档

- [03-rule-group-model.md](./03-rule-group-model.md)
- [08-post-processing.md](./08-post-processing.md)
