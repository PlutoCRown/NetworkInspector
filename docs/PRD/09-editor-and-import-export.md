# 09 编辑器、Import/Export 与入口

## 9.1 首页 / 落地（面向普通用户）

安装或首次打开扩展时，提供清晰入口：

| 入口 | 行为 |
|------|------|
| 文档站 | 外链或内置页，说明概念与 JSON 格式 |
| Playground | 教程式环境：示例站点 + 示例规则组（可后续子包） |
| Create | 打开规则组编辑（新窗口或全屏页） |
| Import | 选择 JSON 文件或粘贴 → 校验 → 保存并可选立即启用 |

**Must**：Import 成功后，用户无需再配置即可在匹配站点看到捕获（假设示例 sites 可测则用测试站）。

## 9.2 规则组编辑器

### 布局（建议）

1. **基础信息**：名称、enabled、id（高级可编辑）
2. **站点匹配**：`sites` 多行正则，增删行
3. **捕获 URL**：`capture` 多行正则
4. **规则列表**：每个 `rules[]` 一块面板（见 9.3）
5. **Import/Export** 按钮

### 新窗口

- 工具栏提供「编辑规则组」→ `chrome.windows.create` 打开独立编辑器窗口（尺寸适中，可并排文档）。

## 9.3 单条 Rule 编辑板块

顺序 **固定**：

1. **选择 Renderer**（下拉：`card` / `divider`，字段列表来自 `RENDERER_DEFINITIONS`）
2. **聚合请求**（可选开关 + `aggregateFrom`）
3. **字段行**（数量随 renderer 固定；聚合模式下来源含 `aggregate`）
4. **后处理**（alias / highlights / filter，见 [08](./08-post-processing.md)，后续 UI）

### 字段输入

- GitHub 搜索框式：`[tag] path` → 存为 `tag:path`（[05](./05-extraction.md)）

## 9.4 Export

- 导出当前规则组为 JSON，结构与 [`rule-group.schema.example.json`](../../rule-group.schema.example.json) 一致。
## 9.5 Import

### 流程

1. 选择文件 / 粘贴
2. JSON.parse
3. 校验：`version`、`id`、`name`、`sites`、`capture`、`rules` 必填；每条 rule 的 `renderer` 与 `fields` 键匹配（[03](./03-rule-group-model.md)）
4. 无效正则：报错并定位
5. 写入存储；提示是否启用

### 冲突

- 同 `id` 已存在：询问覆盖 / 另存为新 id（Must 有明确 UI）。

## 9.6 工具栏（Toolbar）

| 控件 | 行为 |
|------|------|
| 打开侧边栏 | `sidePanel.open()` 或等价 |
| 规则组开关 | 切换当前选中规则组的 `enabled`，图标状态同步 |
| 编辑 | 打开编辑器新窗口 |

可选：下拉选择「当前活动规则组」（多组时 Must）。

## 9.7 侧边栏与编辑器数据同步

- 编辑器保存后，Background 重新加载配置；已捕获列表可清空或保留（默认 **保留**）。
- 启用新规则组后，仅新请求走新配置。

## 9.8 依赖文档

- [01-product-overview.md](./01-product-overview.md)
- [03-rule-group-model.md](./03-rule-group-model.md)
- [10-modes-and-advanced.md](./10-modes-and-advanced.md)
