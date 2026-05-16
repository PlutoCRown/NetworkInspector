# 06 侧边栏与 Renderer

## 6.1 预设 Renderer

| ID | 组件 | 字段 |
|----|------|------|
| `card` | `CardCapture` | `title`, `desc`, `expand`, `popover` |
| `divider` | `DividerCapture` | `title` |

定义见 `packages/presets/src/renderers.ts`。

## 6.2 Card 交互

| 区域 | 行为 |
|------|------|
| 标题 / 描述 | 常显 |
| `popover` | 悬停卡片显示 Popover |
| `expand` | 点击卡片展开，高度随内容 |

## 6.3 侧边栏

- 仅展示**已启用规则组**的捕获记录。
- 图标角标为可见捕获条数。
- 支持清空列表。

## 6.4 依赖文档

- [05-extraction.md](./05-extraction.md)
- [07-renderers.md](./07-renderers.md)
