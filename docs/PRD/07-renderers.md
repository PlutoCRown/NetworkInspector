# 07 Renderer 注册表

> 已废弃 HTML 模板方案；展示由内置 React 组件完成。

## 7.1 注册

`packages/presets/src/renderers.ts` 导出 `RENDERER_DEFINITIONS`，扩展内通过 `renderer-registry.ts` 读取。

## 7.2 新增 Renderer 步骤

1. 在 `presets` 增加组件字段列表。
2. 在 `extension/src/components/renderers/` 实现 React 组件。
3. 在 `CaptureRenderer.tsx` 注册分支。

## 7.3 依赖文档

- [06-renderers-and-sidebar.md](./06-renderers-and-sidebar.md)
