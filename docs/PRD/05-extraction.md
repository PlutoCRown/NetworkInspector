# 05 结构化提取

## 5.1 流程

1. 根据 [04](./04-site-and-capture.md) 命中 `rules[].url`。
2. 若配置了 `splits`，先解析拆分源再对每项求字段。
3. 按 `fields` 中的字段表达式取值（`field-expr` → `field-resolve`）。
4. 后处理管道 [08](./08-post-processing.md)。
5. 输出 `CaptureRecord` 供 [06](./06-renderers-and-sidebar.md) 渲染。

## 5.2 数据来源

| Source | 说明 |
|--------|------|
| `json` | 仅 request body（JSON） |
| `response` | 仅 response body（JSON 或原文） |
| `query` | URL 查询参数 |
| `form-data` | multipart / urlencoded body |
| `header` | 请求头 |

## 5.3 字段表达式 UX

- Tag 顺序：Source → 路径 →（可选）Processor / Alias
- 无 Source 时路径为**固定文本**
- 拆分源（规则 `splits`）：`[source:json]items`
- 聚合项字段：`[aggregate:item]path`

## 5.4 全局配置引用

- Processor：`[processor:time]` 等，自定义 ID 在编辑器 Processor 页配置
- Alias：`[alias:mapkey]`，mapkey 在创建 Alias 组时自动生成

## 5.5 依赖文档

- [03-rule-group-model.md](./03-rule-group-model.md)
- [08-post-processing.md](./08-post-processing.md)
