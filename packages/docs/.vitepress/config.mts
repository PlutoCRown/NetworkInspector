import { defineConfig } from "vitepress";

// GitHub Pages project site: https://<user>.github.io/NetworkInspector/
const REPO_NAME = "NetworkInspector";

export default defineConfig({
  title: "NetworkInspector",
  description: "Chrome 扩展：按规则组捕获网络请求，结构化展示埋点数据",
  lang: "zh-CN",
  base: `/${REPO_NAME}/`,
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: [/\.\.\/\.\.\/PROPOSAL/, /\/PROPOSAL/],
  themeConfig: {
    logo: { text: "NetworkInspector" },
    nav: [
      { text: "指南", link: "/guide/getting-started", activeMatch: "/guide/" },
      { text: "产品文档", link: "/prd/", activeMatch: "/prd/" },
      {
        text: "GitHub",
        link: "https://github.com/PlutoCRown/NetworkInspector",
      },
    ],
    sidebar: [
      {
        text: "指南",
        items: [
          { text: "快速开始", link: "/guide/getting-started" },
          { text: "字段表达式", link: "/guide/field-expressions" },
          { text: "开发与构建", link: "/guide/development" },
        ],
      },
      {
        text: "产品文档（PRD）",
        items: [
          { text: "索引", link: "/prd/" },
          { text: "01 产品概览", link: "/prd/01-product-overview" },
          { text: "02 架构", link: "/prd/02-architecture" },
          { text: "03 规则组模型", link: "/prd/03-rule-group-model" },
          { text: "04 站点与捕获", link: "/prd/04-site-and-capture" },
          { text: "05 提取管道", link: "/prd/05-extraction" },
          { text: "06 UI 与 Renderer", link: "/prd/06-ui-and-renderers" },
          { text: "08 后处理", link: "/prd/08-post-processing" },
          { text: "09 编辑器与导入导出", link: "/prd/09-editor-and-import-export" },
          { text: "10 范围与进阶", link: "/prd/10-modes-and-advanced" },
          { text: "11 验收标准", link: "/prd/11-acceptance-criteria" },
          { text: "附录：代码库", link: "/prd/appendix-codebase" },
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/PlutoCRown/NetworkInspector",
      },
    ],
    footer: {
      message: "Released under the repository default license.",
      copyright: "Copyright © 2026 NetworkInspector contributors",
    },
    search: { provider: "local" },
  },
});
