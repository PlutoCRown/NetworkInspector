# 09 编辑器与导入导出

## 9.1 编辑器布局

左侧一级菜单：

| 菜单 | 内容 |
|------|------|
| 规则组 | 二级列表：各规则组 + 导入 JSON / 新建 |
| Processor | 内置说明 + 自定义 Processor |
| Alias | 组名 + 映射 JSON（ID 自动生成） |
| About | 版本信息、全量导出/导入 |

右侧为当前选中项的编辑区；左侧栏固定高度，右侧独立滚动。

## 9.2 规则组编辑

- 站点 / 捕获 URL 列表
- 每条 capture 对应一个 Rule 块：Renderer、聚合源、字段表达式输入
- 单规则组 JSON 导出 / 表单与 JSON 模式切换

## 9.3 导入

| 类型 | 行为 |
|------|------|
| 单个 RuleGroup JSON | 直接导入；若引用缺失的 Processor / Alias ID，确认提示 |
| AppExportBundle | 弹窗勾选：规则组 / Processor / Alias；勾选规则组时显示缺失引用警告 |

导入入口：规则组二级菜单、About 页、Popup 规则组区。

## 9.4 Popup

总开关 → 打开侧边栏 → 设置（跳转编辑器）→ 可折叠规则组列表。

## 9.5 依赖文档

- [03-rule-group-model.md](./03-rule-group-model.md)
