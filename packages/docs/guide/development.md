# 开发与构建

## Monorepo 结构

| 包 | 说明 |
|----|------|
| `@network-inspector/extension` | Chrome MV3 扩展（React + Vite） |
| `@network-inspector/presets` | 示例配置 `example.json`（导出/参考） |
| `@network-inspector/docs` | 本站（VitePress） |

## 常用命令

```bash
# 扩展开发
bun run dev
bun run build
bun run typecheck
bun run test

# 文档站
bun run docs:dev
bun run docs:build
```

## 测试

```bash
bun run test
```

当前测试覆盖 `packages/extension/src/shared` 下的管道、字段表达式与配置校验。

## 类型检查

扩展使用 TypeScript 7 预览工具链（`tsgo`）：

```bash
bun run typecheck
```

## 文档同步

`packages/docs` 在 dev/build 前会将 `docs/PRD` 同步到 `packages/docs/prd`，无需手动复制 PRD 文件。
