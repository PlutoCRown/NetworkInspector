# 字段表达式

规则中每个展示字段（如 `title`、`desc`、`expand`）的值由**字段表达式**字符串描述。

## 常见形式

| 形式 | 示例 | 说明 |
|------|------|------|
| 请求 JSON 路径 | `[source:json]events.0.name` | 仅读取 **request body** 解析后的 JSON |
| 响应 JSON | `[source:response]data.list` | 读取 response body |
| 拆分项 | `[aggregate:item]event` | 配合 `splits` 对数组每一项生成一张卡片 |
| Processor | `…[processor:JSONParser]` | 对当前值运行自定义函数 |
| Alias | `…[alias:mapkey]` | 按别名表替换展示文案 |
| 固定文本 | `page_view` | 无标签前缀时为字面量 |

## splits

在规则上配置 `splits`，将一次请求拆成多条记录，例如：

```json
{
  "splits": { "item": "[source:json]0.events" },
  "fields": {
    "title": "[aggregate:item]event",
    "desc": "[aggregate:item]session_id"
  }
}
```

若拆分结果不是数组，则当作**单条**处理。

## 数据来源说明

- `[source:json]`：**仅** request body，不会回退到 response
- 需要响应字段时请使用 `[source:response]`

完整语法与管道说明见 [PRD：提取管道](/prd/05-extraction)。
