# 06 预设 Renderer 与侧边栏

## 6.1 侧边栏职责

- 展示**已启用规则组**的 `CaptureRecord`（见 [05](./05-extraction.md)）。
- 每条记录由 **React 组件** 渲染（`CaptureRenderer` 按 `renderer` 分发）。
- 支持滚动、清空列表。

## 6.2 预设 Renderer：`card`

实现：`packages/extension/src/components/renderers/CardCapture.tsx`

| 区域 | 行为 |
|------|------|
| 标题 | 常显；命中 `highlights` 时着色 |
| 描述 | 有 `desc` 时显示 |
| 元信息 | 请求 URL + 捕获时间 |
| Popover | **悬停**卡片显示 `popover` |
| 展开 | **点击整张卡片**展开 `expend`（grid 动画） |

字段：`title`, `desc`, `expend`, `popover`（均可选，无数据则不显示对应交互）。

## 6.3 预设 Renderer：`divider`

实现：`packages/extension/src/components/renderers/DividerCapture.tsx`

水平分割线，中间显示 `title`。仅一个字段。

## 6.4 列表与排序

- 默认 **新捕获在上**（`timestamp` 降序）。

## 6.5 空状态

| 状态 | 侧边栏展示 |
|------|------------|
| 总开关关闭 | 提示已暂停 |
| 无启用规则组 | 引导在弹窗启用 |
| 无捕获 | 「等待网络请求…」 |

## 6.6 依赖文档

- [07-template-syntax.md](./07-template-syntax.md)（Renderer 注册表）
- [08-post-processing.md](./08-post-processing.md)
