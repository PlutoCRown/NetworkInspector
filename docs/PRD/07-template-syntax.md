# 07 渲染模板语法

## 7.1 文档性质

模板是 **HTML 片段**（`.tpl` 文件），不是完整文档。权威示例：

- 卡片：`packages/presets/renderers/card.tpl`
- 分割线：`packages/presets/renderers/divider.tpl`
- 自定义示例：[`rule-group.render.example.html`](../../rule-group.render.example.html)

用于内置 `renderer`（`card`、`divider`）或 `renderer: custom` + `template` 字段。侧边栏由 `TemplateCapture` 按槽位与指令渲染。

## 7.2 插值：`{{name}}`

| 类型 | 语法 | 说明 |
|------|------|------|
| 数据字段 | `{{title}}`、`{{popover}}` | 绑定规则 `fields` 提取后的 `data` 键；`object`/`array` 会 `JSON.stringify` |
| 内置变量 | `{{__TIME__}}` 等 | 见 **7.3**；双下划线包裹，**不会**出现在编辑器字段列表中 |

字符串插入时做 HTML 转义（React 文本节点）。

## 7.3 内置变量与函数

当前支持的**内置变量**（实现于 `@network-inspector/presets`）：

| 变量 | 输出示例 | 说明 |
|------|----------|------|
| `{{__TIME__}}` | `15:04:05` | 捕获时刻，24 小时 `HH:mm:ss` |
| `{{__DATE__}}` | `2026-05-16` | 捕获日期 `YYYY-MM-DD` |
| `{{__TIMESTAMP__}}` | `1715857445000` | 毫秒时间戳 |
| `{{__REQUEST_URL__}}` | 完整请求 URL | |
| `{{__RULE_ID__}}` | 规则 ID | |
| `{{__RULE_GROUP_ID__}}` | 规则组 ID | |

> 后续版本可扩展过滤器，如 `{{title \| upper}}`（非一期）。

## 7.4 指令属性：`x-*`

指令为 **布尔属性**（写在标签上即生效）。

| 指令 | 含义 | 交互 |
|------|------|------|
| `x-card` | 卡片根节点；Popover 锚点 | 悬停触发 Popover（若有 `x-popover`） |
| `x-title` | 主标题 | 常显 |
| `x-title` + `highlight` | 高亮标题（与上二选一） | 命中 `highlights` 时显示并加 `data-tone` |
| `x-if="field"` | 条件块 | 仅当 `data.field` 有内容时渲染 |
| `x-expand` | 展开区 | **点击整张卡片**展开/收起，CSS 网格动画 |
| `x-popover` | 悬停浮层 | **瞄准（悬停）即显示**，移出延迟关闭 |
| `x-divider` | 分割线布局 | 仅 `divider` renderer |

### 卡片模板结构（`card.tpl`）

```html
<article x-card class="ni-card">
  <div class="ni-card__hit"><!-- 整块可点，触发 x-expand -->
    <div x-title>{{title}}</div>
    <div x-title highlight>{{title}}</div>
    <div x-if="desc">{{desc}}</div>
    <span>{{__REQUEST_URL__}}</span>
    <span>{{__TIME__}}</span>
  </div>
  <div x-expand class="ni-expand-outer">…</div>
</article>
<div x-popover>…</div>
```

## 7.5 `x-title` 与 `highlight`

1. 根据 [08](./08-post-processing.md) 判断是否命中 `highlights`（针对 `title`）。
2. **命中**：只渲染带 `highlight` 的 `x-title`，并设置 `data-tone`（`danger`、`success` 等）。
3. **未命中**：只渲染普通 `x-title`。

## 7.6 `x-expand` 与展开动画

- 初始：`grid-template-rows: 0fr` 折叠。
- 点击 **整张卡片**（`.ni-card__hit` 所在 article）切换 `data-expanded="true"`，过渡到 `1fr`。
- 无左侧 chevron；无 `expend` 数据时不展开。

## 7.7 `x-popover` 悬停即显

- 鼠标进入 `x-card` 区域即打开 Popover（无需点击）。
- 移出卡片与浮层后约 120ms 关闭；可在浮层上保持悬停以阅读内容。
- 首次显示时渲染 `{{popover}}` 插值。

## 7.8 `<style>` 标签

- 允许在 `.tpl` 内写 `<style>`。
- 运行时加 `[data-ni-scope]` 前缀，避免污染侧边栏全局主题。

## 7.9 从模板预解析表单字段

扩展启动时通过 `extractTemplateMeta()` **一次性**解析所有内置 `.tpl`：

- `fields[]`：所有 `{{}}` 中的数据字段名（排除内置变量）。
- `slots`：`x-card`、`x-expand`、`x-popover` 等。

编辑器选择 Renderer 后，下方字段行 **直接来自预解析结果**，不在用户切换时再解析。

实现：`packages/presets/src/parse-template.ts` → `packages/extension/src/shared/renderer-registry.ts`。

## 7.10 预设包 `@network-inspector/presets`

| 路径 | 内容 |
|------|------|
| `renderers/*.tpl` | 内置 Renderer 模板 |
| `rule-groups/*.json` | 默认规则组（A1.art、DOUYIN） |
| `src/parse-template.ts` | 元数据提取、插值、内置变量 |

扩展通过 workspace 依赖引用；发布空扩展时可不捆绑此包。

## 7.11 安全

- 禁止 `<script>`、`on*` 内联事件。
- 仅允许标签、属性、`{{}}`、`<style>`。

## 7.12 依赖文档

- [05-extraction.md](./05-extraction.md)
- [06-renderers-and-sidebar.md](./06-renderers-and-sidebar.md)
- [08-post-processing.md](./08-post-processing.md)
