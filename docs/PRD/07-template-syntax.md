# 07 预设 Renderer（React 组件）

## 7.1 实现方式

侧边栏捕获项**不再使用 HTML 模板语法**。每个内置 `renderer` 对应一个固定的 React 组件，样式与交互在代码中维护（shadcn `Card` + Tailwind）。

定义与默认规则组位于 `@network-inspector/presets`：

| Renderer ID | 组件 | 字段 |
|-------------|------|------|
| `card` | `CardCapture` | `title`, `desc`, `expend`, `popover` |
| `divider` | `DividerCapture` | `title` |

字段列表见 `packages/presets/src/renderers.ts`。

## 7.2 `card` 交互

| 区域 | 行为 |
|------|------|
| 标题 | 常显；命中 `highlights` 时着色 |
| 描述 | 有 `desc` 数据时显示 |
| 元信息 | 请求 URL + 捕获时间 |
| 展开 | 点击整张卡片；`expend` 有内容时可展开，CSS grid 动画 |
| Popover | 悬停卡片显示 `popover` 内容 |

## 7.3 `divider`

水平分割线，中间显示 `title` 文本。

## 7.4 与旧模板方案的关系

已移除：`{{}}` 插值、`x-*` 指令、`.tpl` 文件、`parse-template` 解析器。  
若需新展示形态：新增 React 组件 + 在 `RENDERER_DEFINITIONS` 注册。

## 7.5 依赖文档

- [06-renderers-and-sidebar.md](./06-renderers-and-sidebar.md)
- [08-post-processing.md](./08-post-processing.md)
