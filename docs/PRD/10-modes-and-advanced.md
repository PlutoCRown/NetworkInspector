# 10 普通模式与高级模式

## 10.1 模式定义

| | 普通模式 | 高级模式 |
|---|----------|----------|
| 用户 | 运营、测试、非开发 | 前端/埋点开发 |
| 创建方式 | 表单 + 预设 Renderer | + 自定义解码 JS、自定义 HTML 模板 |
| 解码 | 内置 JSON/query/form/header | 可注入 `decode` 脚本 |
| 渲染 | 预设 React 组件 | 见 [07](./07-template-syntax.md) |

规则组可在**规则组级**或**单 rule 级**开启高级能力（实现时至少支持 rule 级 `decode`）。

## 10.2 普通模式（Must）

- 不提供脚本编辑入口（或折叠「高级选项」默认关闭）。
- Renderer 仅下拉选择预设两项 + custom（custom 可仍算「半高级」，若产品希望 custom 仅高级可见，实现时在 UI 隐藏即可）。
- 字段来源仅限四种 tag（[05](./05-extraction.md)）。

## 10.3 高级模式：解码脚本 `decode`

### 用途

- Protobuf、加密 body、非 JSON 自定义协议等，普通解析无法处理。

### 配置位置

- 规则组顶层 `decode`：作用于所有 rule（除非 rule 自有覆盖）。
- `rules[].decode`：仅该 URL 规则。

### 预期接口（逻辑约定）

```ts
// 注入脚本应导出或返回等价函数
type DecodeFn = (ctx: {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: ArrayBuffer | string | null;
}) => Promise<unknown> | unknown;
```

- 返回值应为 **可被 fields 继续解析的对象**（通常是 plain object），或 `{ body: string }` 供 `json:` 二次 parse（实现文档化一种）。
- 脚本在 **隔离环境** 执行（Web Worker / `new Function` + 超时），禁止 `chrome.*` 以外敏感 API；执行超时 **2s** 默认。

### 失败行为

- 解码抛错或超时：该条 capture 标记失败，侧边栏可选显示红色「解码失败」条（Should），不崩溃扩展。

## 10.4 高级模式：自定义模板

- 见 [07-template-syntax.md](./07-template-syntax.md)。
- 编辑器提供模板预览（Playground 或模拟 data Should）。

## 10.5 模式切换 UX

- 设置页开关「高级模式」：显示 `decode` 与模板编辑区。
- 从高级切回普通：**不删除** 已填脚本，但保存时警告「高级配置将保留但不生效」或继续生效（推荐 **保留且生效**，仅隐藏 UI）。

## 10.6 技术人员 → 普通用户工作流

1. 技术在高级模式完成 JSON + 可选 html 模板。
2. Export JSON（+ 模板）。
3. 普通用户 Import → enabled true → 打开目标站 → 侧边栏查看。

**Must**：Import 的 JSON 不含 decode 时，普通模式与高级模式行为一致。

## 10.7 依赖文档

- [05-extraction.md](./05-extraction.md)
- [07-template-syntax.md](./07-template-syntax.md)
- [09-editor-and-import-export.md](./09-editor-and-import-export.md)
