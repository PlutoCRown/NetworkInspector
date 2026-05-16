# 11 验收标准（子 agent 自检清单）

本文档为 **可测试的 Must 行为**；实现完成后逐项勾选。示例数据见根目录 `rule-group.schema.example.json` 与 `rule-group.render.example.html`。

---

## A. 基础设施（02）

- [ ] Bun monorepo 可安装、扩展子包可 `dev` 构建
- [ ] Manifest V3，使用 shadcn 组件
- [ ] 工具栏可打开侧边栏
- [ ] 配置持久化，刷新浏览器后规则组仍在

---

## B. 站点与捕获（03、04）

- [ ] `enabled: false` 时不产生新捕获
- [ ] 非 `sites` 匹配 URL 的 Tab 不产生捕获
- [ ] 仅 `capture` 匹配的请求进入管道
- [ ] `rules[].url` 正确细分到对应 rule 配置
- [ ] 无效正则在 Import/保存时报错

---

## C. 提取（05）

- [ ] `json:` / `query:` / `form-data:` / `header:` 四种来源均可用
- [ ] 示例 `events-api` 正确解析 `title`、`popover`
- [ ] 示例 `beacon-api` 正确解析 `title`、`desc`、`expend`
- [ ] 设置页 Renderer 先选后显示对应字段行数（2 或 3）
- [ ] 字段输入 UX 支持 tag 选择 + path 输入，保存为 `source:path`

---

## D. 后处理（08）

- [ ] alias：`page_view` → `页面浏览` 在标题展示
- [ ] highlights：含 `error` 的 title 走 highlight 样式 / `data-tone`
- [ ] filter `drop`：`popover.debug === true` 的整条不在侧边栏出现
- [ ] filter `strip`：`expend._internal` 在展示前被移除

---

## E. 预设 Renderer 与侧边栏（06）

- [ ] `title-popover`：标题常显；悬停显示 popover 内容
- [ ] `title-desc-expand`：标题+描述常显；点击后展开 `expend`
- [ ] 列表新条目在上（或 UI 标明排序规则）
- [ ] 空状态文案符合 06 第四节

---

## F. 模板语法（07）

- [ ] `{{field}}` 正确插值且转义
- [ ] `<style>` 仅影响单卡
- [ ] 同时存在 `x-title` 与 `x-title highlight` 时二选一正确
- [ ] `x-expand` 仅在展开后挂载内容
- [ ] `x-popover` 仅在悬停时挂载 Popover 内容
- [ ] 拒绝 `<script>` 与内联事件

---

## G. Import/Export 与入口（01、09）

- [ ] 首页/弹窗具备 Create、Import 入口
- [ ] Import 示例 JSON 成功且无二次配置即可测试（需 mock 或测试页）
- [ ] Export 再 Import  round-trip 数据一致
- [ ] 工具栏可切换 enabled
- [ ] 编辑器在新窗口打开

---

## H. 高级模式（10）

- [ ] `decode` 脚本在隔离环境执行，失败不崩扩展
- [ ] 无 `decode` 时与普通模式行为一致
- [ ] 自定义模板可替换预设并仍使用同一 `fields`

---

## I. 安全与性能

- [ ] 模板 XSS 防护（插值转义）
- [ ] 侧边栏列表有上限或清空能力
- [ ] 高频请求不阻塞页面（解析在 background/worker）

---

## J. 文档同步

- [ ] 行为变更已更新对应 PRD 章节
- [ ] 根目录示例 JSON/HTML 与 PRD 一致

---

## 测试建议（非代码交付）

1. 本地起静态页模拟 `acme.io`，发送 `/v1/events` 与 `/v1/beacon` 请求。
2. Import 示例规则组并启用。
3. 按 A→J 顺序回归。

---

## 子 agent 提交流程

1. 声明实现的 PRD 章节编号。
2. 附上勾选的验收项。
3. 已知偏差写在 PR 描述中并提议 PRD 修订。
