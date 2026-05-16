# 06 侧边栏与 Renderer

## 6.1 预设 Renderer

定义见 `packages/presets/src/renderers.ts`，扩展内 `shared/render/registry.ts` 读取。

| ID | React 组件 | `fields` 键 |
|----|------------|-------------|
| `card` | `CardCapture` | `title`, `desc`, `expand` |
| `divider` | `DividerCapture` | `title` |

新增 Renderer 步骤：

1. 在 `presets/src/renderers.ts` 增加字段列表。
2. 在 `extension/src/components/renderers/` 实现组件。
3. 在 `CaptureRenderer.tsx` 注册分支。

## 6.2 Card 交互

| 区域 | 行为 |
|------|------|
| `title` / `desc` | 常显；`desc` 为空则不占位 |
| `expand` | 有内容时点击标题区域展开/收起，展示 JSON 或文本 |
| 请求 URL、时间 | 卡片底部常显 |

已移除：`popover` 字段与悬停 Popover（扩展 UI 中无法正常展示）。

## 6.3 侧边栏

- 仅统计**已启用规则组**的可见捕获（`visible.ts`）。
- 扩展图标角标为可见条数（`badge.ts`）。
- 支持暂停捕获、清空列表。
- 列表按时间倒序。

## 6.4 依赖文档

- [05-extraction.md](./05-extraction.md)
