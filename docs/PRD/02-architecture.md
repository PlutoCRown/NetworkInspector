# 02 架构与技术栈

## 2.1 仓库结构

- **Monorepo**，包管理器：**Bun**。
- 当前阶段仅初始化第一个子包：**Chrome Extension**（`packages/extension` 或等价路径，以实现时为准）。
- 后续可增文档站、Playground 等包，但 PRD 一期以扩展为主。

## 2.2 技术选型（必须）

| 项 | 要求 |
|----|------|
| UI 组件库 | [shadcn/ui](https://ui.shadcn.com/) |
| 扩展脚手架 | 选用成熟 Chrome Extension 模板（Manifest V3），与 React/Vite 等栈对齐 shadcn |
| 样式 | 与 shadcn 主题一致；跟随系统深浅色（`prefers-color-scheme`） |

## 2.3 扩展能力分区

### Service Worker（Background）

- 维护规则组启用状态、持久化配置。
- 注册/更新 `declarativeNetRequest` 或 `webRequest`/`debugger` 等拦截方案（以实现时选型，需满足 [04-site-and-capture.md](./04-site-and-capture.md)）。
- 将捕获到的请求元数据与 body 转发给解析管道（[05-extraction.md](./05-extraction.md)）。

### Side Panel（侧边栏）— 主展示面

- 展示当前规则组下**已捕获条目列表**（时间倒序或实现约定，需在 UI 标明排序）。
- 按 Renderer / 模板渲染单张卡片（[06-renderers-and-sidebar.md](./06-renderers-and-sidebar.md)）。

### Toolbar Action

- 打开/聚焦侧边栏。
- **快捷开关**当前规则组（enabled ↔ disabled）。
- 入口：打开**新窗口**进行规则组编辑与创建（[09-editor-and-import-export.md](./09-editor-and-import-export.md)）。

### Options / Editor 页面

- 规则组 CRUD、Import/Export、普通/高级模式切换。
- 与侧边栏共享同一套规则组数据模型（[03](./03-rule-group-model.md)）。

## 2.4 数据流（预期）

```
[页面网络请求]
      │
      ▼
Background: sites 匹配? ──否──► 忽略
      │是
      ▼
Background: capture URL 匹配? ──否──► 忽略
      │是
      ▼
匹配 rules[].url → 取 fields 提取
      │
      ▼
应用 alias / highlights / filter（08）
      │
      ▼
Side Panel: 按 renderer 分发 React 组件渲染卡片
```

## 2.5 子 agent 边界

| 模块 | 建议负责 |
|------|----------|
| 扩展脚手架、MV3、存储 | 基建 agent |
| 拦截与匹配 | 捕获 agent（04） |
| 提取与后处理 | 引擎 agent（05、08） |
| 侧边栏与工具栏 | UI agent（06、09） |
| 模板解析与懒挂载 | 模板 agent（07） |

## 2.6 依赖文档

- [04-site-and-capture.md](./04-site-and-capture.md)
- [09-editor-and-import-export.md](./09-editor-and-import-export.md)
