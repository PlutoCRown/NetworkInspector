# 快速开始

## 环境要求

- [Bun](https://bun.sh/) 1.1+
- Google Chrome（支持 Manifest V3 与 Side Panel）

## 安装与开发

在仓库根目录执行：

```bash
bun install
bun run dev
```

构建生产包：

```bash
bun run build
```

## 加载扩展

1. 打开 `chrome://extensions`
2. 开启「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择 `packages/extension/dist`

## 首次使用

1. 点击扩展图标打开 **Popup**，确认「总开关」已开启
2. 点击「打开侧边栏」
3. 访问已配置站点（默认示例含抖音、A1.art 等），触发匹配请求
4. 在侧边栏查看捕获卡片

默认规则组与 Processor 在首次安装时由扩展内置配置注入，亦可从编辑器导出/导入 JSON。

## 配置编辑器

在 Popup 中点击「设置」，或打开编辑器页面，可管理：

- **规则组**：站点、捕获 URL、字段与 `splits`
- **处理器**：自定义 `(value) => …` 函数
- **别名**：值映射表

详见 [字段表达式](./field-expressions) 与 [PRD：规则组模型](/prd/03-rule-group-model)。
