# 06 预设 Renderer 与侧边栏

## 6.1 侧边栏职责

- 展示**当前启用规则组**捕获到的所有 `CaptureRecord`（见 [05](./05-extraction.md)）。
- 每条记录渲染为 **一张卡片**。
- 支持滚动、清空列表；单卡交互：展开、Popover 悬停（与模板槽位或预设一致）。

## 6.2 预设 Renderer：`title-popover`

### 数据结构

```ts
{ title: string; popover: object }
```

### 默认 UI 行为（未使用自定义模板时）

| 区域 | 行为 |
|------|------|
| 标题 | 始终可见，展示 `data.title`（经 alias 后） |
| 高亮 | 若命中 `highlights`，使用对应 `tone` 样式（danger/success 等） |
| Popover | **悬停卡片**时，在 Popover 内展示 `popover` 的格式化 JSON（或字符串） |
| 展开 | 无 |

### 设置页

- 两个字段行：`title`、`popover`。

## 6.3 预设 Renderer：`title-desc-expand`

### 数据结构

```ts
{ title: string; desc: string; expend: object }
```

### 默认 UI 行为

| 区域 | 行为 |
|------|------|
| 标题 | 始终可见 |
| 描述 | 标题下方次要文字，`desc` |
| 展开区 | **默认折叠**；用户点击卡片或「展开」控件后，才挂载并展示 `expend` 内容 |
| Popover | 无（除非模板自定义） |

## 6.4 自定义 Renderer

- `renderer: "custom"` 或规则组/规则级提供 `template` HTML 片段。
- 解析与槽位行为见 [07-template-syntax.md](./07-template-syntax.md)。
- 示例文件：[`rule-group.render.example.html`](../../rule-group.render.example.html)

## 6.5 列表与排序

- 默认 **新捕获在上**（`timestamp` 降序）。
- 卡片需显示：至少标题 + 可选时间；实现可增「复制 URL」「复制 JSON」快捷操作（Should，非 Must）。

## 6.6 空状态

| 状态 | 侧边栏展示 |
|------|------------|
| 无规则组启用 | 引导 Import / Create |
| 已启用但未捕获 | 「等待网络请求…」 |
| 站点不匹配 | 「当前页面不在规则组站点范围内」 |
| 已暂停（enabled false） | 「规则组已暂停」+ 历史列表（若保留） |

## 6.7 高亮与 Renderer 的关系

- **高亮样式由 Renderer / 模板决定**（[08](./08-post-processing.md) 只提供 `tone` 等语义）。
- 预设：`tone: danger` → 红色标题；`success` → 绿色。
- 自定义模板：使用 `x-title highlight` 节点 + `data-tone`（见 07）。

## 6.8 槽位缺失

- 若 `data` 中某键为 `null` 且模板仍有对应 `{{key}}`：
  - **预设**：显示「—」或隐藏该行（实现二选一，全扩展统一）。
  - **自定义**：空文本节点，不报错。

## 6.9 依赖文档

- [07-template-syntax.md](./07-template-syntax.md)
- [08-post-processing.md](./08-post-processing.md)
- [09-editor-and-import-export.md](./09-editor-and-import-export.md)
