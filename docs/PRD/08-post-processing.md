# 08 后处理

## 8.1 作用域

`field` 指向 Renderer 数据键（`title`、`expand` 等），与 `fields` 配置键一致。

## 8.2 alias（规则级）

```json
{ "field": "title", "match": "page_view", "replace": "页面浏览" }
```

## 8.3 highlights

```json
{ "field": "title", "match": "error", "tone": "danger" }
```

## 8.4 filters

```json
{ "field": "expand", "path": "debug", "equals": true, "action": "drop" }
{ "field": "expand", "path": "_internal", "action": "strip" }
```

| action | 含义 |
|--------|------|
| `drop` | 丢弃整条 capture |
| `strip` | 从对象字段删除 `path` 键 |

## 8.5 全局 Alias / Processor

在编辑器 **处理器**、**别名** 页配置；字段表达式通过 `[processor:id]`、`[alias:mapkey]` 引用。导入规则组时若引用缺失，弹窗警告（可部分导入 Processor/Alias）。

## 8.6 依赖文档

- [05-extraction.md](./05-extraction.md)
