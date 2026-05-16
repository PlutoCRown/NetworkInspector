# 07 渲染模板语法

## 7.1 文档性质

模板是 **HTML 片段**，不是完整文档（无 `<!DOCTYPE>`、无 `<html>` 要求）。权威示例：[`rule-group.render.example.html`](../../rule-group.render.example.html)。

用于 `renderer: custom` 或规则组级 `template` 字段；侧边栏解析后挂载到 Shadow DOM 或隔离容器（推荐，防止样式泄漏）。

## 7.2 插值：`{{fieldName}}`

- 双大括号绑定 [05](./05-extraction.md) 产出的 `data` 字段。
- 值为 `string` → 文本插入（HTML 转义，防 XSS）。
- 值为 `object` / `array` → 默认 `JSON.stringify(value, null, 2)`；可在后续版本支持 `|json` 等过滤器（非一期 Must）。

## 7.3 指令属性：`x-*`

指令是 **布尔属性**（存在即为真），写在普通 HTML 标签上。

| 指令 | 含义 | 渲染时机 |
|------|------|----------|
| `x-card` | 卡片根节点；Popover 锚点 | 立即 |
| `x-title` | 主标题槽位 | 立即 |
| `x-title` + `highlight` | 高亮标题槽位 | 见 7.5 |
| `x-desc` | 描述槽位 | 立即 |
| `x-expand` | 展开内容槽位 | **懒渲染**：用户点击展开后 |
| `x-popover` | Popover 内容槽位 | **懒渲染**：用户悬停/对准卡片时 |

### 示例（来自产品定义）

```html
<div x-title>{{title}}</div>
<div x-title highlight>{{title}}</div>
<div x-expand>{{expend}}</div>
<div x-popover>{{popover}}</div>
```

## 7.4 `<style>` 标签

- **允许**在模板顶部或任意位置包含 `<style>`。
- 样式作用域：仅作用于 **本卡片** 实例（Shadow DOM 或加唯一前缀类名）。
- 不得污染侧边栏全局 shadcn 主题。

## 7.5 `x-title` 与 `highlight` 二选一逻辑

当模板同时存在：

```html
<div x-title>{{title}}</div>
<div x-title highlight>{{title}}</div>
```

**预期行为**：

1. 先根据 [08](./08-post-processing.md) 计算该条 capture 是否命中任一 `highlights`（针对 `title` 字段）。
2. **命中**：仅渲染/显示 `highlight` 节点，并设置 `data-tone` 为规则中的 `tone`（如 `danger`、`success`）。
3. **未命中**：仅渲染/显示普通 `x-title` 节点。
4. 同一时刻 DOM 中只应有一个标题节点可见（另一节点不挂载或 `display: none`）。

## 7.6 `x-expand` 懒渲染

- 卡片初始：**不创建** `x-expand` 子树（或创建但 `hidden` 且无内容计算，推荐不创建以省性能）。
- 用户点击展开（卡片级 chevron 或整块可点区域）后：
  - 首次：解析 `{{expend}}` 并挂载。
  - 再次点击：折叠，可保留已挂载 DOM（实现可选）或销毁（推荐保留）。

## 7.7 `x-popover` 懒渲染

- 悬停 `x-card`（或含 `x-card` 的 article）时：
  - 首次显示 Popover：解析 `x-popover` 内插值并渲染到 shadcn Popover / 浮动层。
- 移出后关闭 Popover；内容可缓存。
- 多个 `x-popover` 节点时：取第一个（其余忽略并 dev 警告）。

## 7.8 未使用字段的槽位

- 模板含 `{{desc}}` 但 `data.desc` 不存在：渲染空。
- 模板含 `x-expand` 但 rule 无 `expend` 字段：展开区为空。
- 模板不含某 `x-*` 指令：对应交互不出现（例如无 `x-popover` 则无悬停层）。

## 7.9 与预设 Renderer 的关系

- 预设 `title-popover` / `title-desc-expand` 等价于内置模板，行为须与本文 **7.5–7.7** 一致。
- 用户切换到 custom 时，用用户模板替换内置实现，**提取字段名不变**。

## 7.10 安全

- 禁止模板内 `<script>`、`on*` 内联事件。
- 仅允许标签、属性、`{{}}`、`<style>`；解析器白名单过滤。

## 7.11 子 agent 交付物

- 模板解析器：HTML 片段 → 槽位描述 + 插值列表。
- 运行时：按 7.5–7.7 控制挂载时机。
- 单测：给定 template + data，断言 DOM 快照与懒加载触发次数。

## 7.12 依赖文档

- [05-extraction.md](./05-extraction.md)
- [06-renderers-and-sidebar.md](./06-renderers-and-sidebar.md)
- [08-post-processing.md](./08-post-processing.md)
