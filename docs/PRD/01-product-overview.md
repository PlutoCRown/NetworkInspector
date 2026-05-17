# 01 产品概览

## 1.1 产品定位

**NetworkInspector** 是一款面向埋点/网络请求调试的 **Chrome 扩展**。用户在目标网站上启用「规则组」后，扩展会：

1. 判断当前页面是否命中规则组；
2. 拦截并匹配配置的网络请求；
3. 从请求中按字段表达式提取结构化字段；
4. 在**侧边栏**以预设 Renderer 卡片展示捕获结果。

## 1.2 核心用户故事

- 技术人员：在编辑器配置规则组、Processor、Alias，导出 JSON 或全量配置包。
- 普通用户：Import 配置后启用规则组，在侧边栏查看捕获。

## 1.3 规则组：四段流水线

```
站点匹配 (sites)
    → 请求捕获 (capture)
        → 结构化提取 (rules[].fields)
            → 侧边栏渲染 (renderer)
```

## 1.4 非目标（当前版本）

- 不替代 DevTools Network 全量能力。
- 无云端同步、无请求修改/重放。
- 无自定义 HTML 模板、无规则级 decode 脚本（见 [10](./10-modes-and-advanced.md)）。

## 1.5 成功标准

- 用户配置或导入的规则组在匹配站点上可捕获并展示；`packages/presets/example.json` 为示例参考。
- Import → 启用 → 侧边栏查看闭环可用。

## 1.6 依赖文档

- [03-rule-group-model.md](./03-rule-group-model.md)
- [11-acceptance-criteria.md](./11-acceptance-criteria.md)
