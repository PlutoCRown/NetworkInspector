# 09 编辑器与导入导出

## 9.1 编辑器布局

左侧一级（可展开二级列表）：

| 菜单 | 内容 |
|------|------|
| 规则组 | 规则组列表 +「新建规则组」 |
| 处理器 | Processor 列表 +「新建处理器」 |
| 别名 | Alias 组列表 +「新建别名组」 |
| About | 版本、全量导出/导入 |

右侧：当前选中项编辑区。左侧栏固定，右侧独立滚动。

**说明**：规则组二级菜单**无**「导入 JSON」；导入见 About / Popup。

## 9.2 规则组编辑

- 元信息：名称、启用、站点列表。
- 每条 Rule：URL 正则、Renderer、聚合模式（`splits`）、`FieldRefInput` 字段。
- 单规则组：保存、删除、导出 JSON、表单 ⇄ JSON 模式。

## 9.3 Processor / Alias

- **处理器**：编辑 ID、函数体；无效时红框，**仍可编辑**；保存时校验。
- **别名**：组名 + 映射表（列表模式 / JSON 模式）。

## 9.4 导入

| 类型 | 行为 |
|------|------|
| 单个 RuleGroup JSON | 写入规则组列表 |
| AppExportBundle | 勾选导入：规则组 / Processor / Alias；缺失引用警告 |

非阻断提示：`message` 组件（toast / confirm），非 `alert`。

## 9.5 Popup / 侧边栏

- Popup：总开关、打开侧栏、设置、规则组列表与导入。
- 侧边栏：捕获列表、暂停、清空。

## 9.6 依赖文档

- [03-rule-group-model.md](./03-rule-group-model.md)
- [appendix-codebase.md](./appendix-codebase.md)
