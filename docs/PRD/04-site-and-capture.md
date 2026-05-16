# 04 站点匹配与请求捕获

## 4.1 站点匹配（`sites`）

### 需求

- `sites` 为 **正则表达式字符串数组**。
- 当用户访问的页面 URL（`location.href` 或等效）与其中 **任意一条** 匹配时，该规则组在此 Tab **生效**。
- 不匹配时：不注册捕获、不展示侧边栏数据、不消耗解析资源。

### 预期行为

| 场景 | 行为 |
|------|------|
| 用户在 `https://app.acme.io/dashboard` | 若 `sites` 含 `^https://(app\|staging)\.acme\.io/`，则生效 |
| 用户在其他域名 | 不捕获 |
| 规则组 `enabled: false` | 即使站点匹配也不捕获 |
| 同一 Tab 多个规则组启用 | 需定义策略：默认 **全部启用且独立展示**（侧边栏分组 by 规则组名）；若实现冲突，以先导入/用户排序为准并文档化 |

### 实现注意

- 正则应支持用户转义；无效正则在保存/Import 时 **校验失败** 并提示行号。
- SPA 路由变化：监听 `webNavigation` 或 content script 上报 URL 变化，重新评估 `sites`。

## 4.2 请求捕获（`capture`）

### 需求

- `capture` 为 **请求 URL 正则列表**（匹配完整 URL 或 path+query，实现时统一为一种并写入代码注释）。
- 推荐：对 `request.url` 做正则 test（含 path 与 query）。

### 预期行为

| 场景 | 行为 |
|------|------|
| XHR/fetch/beacon 到匹配 URL | 进入捕获队列 |
| 静态资源（.js/.css/.png）且未匹配 | 忽略 |
| 同一条请求匹配多个 `capture` 项 | 只处理一次，再进入 `rules` 细分 |
| 请求 body 为空 | 仍可按 `query`/`header` 提取；`json:` 提取结果为空对象 |

### 性能

- 高频埋点场景：侧边栏列表应 **限制最大条数**（建议默认 200，可配置）或提供「清空列表」。
- 捕获不得明显阻塞页面主线程；解析在 worker 或 background 完成。

## 4.3 与 `rules[].url` 的关系

```
capture（粗筛）  ⊇  各 rules[].url（细筛）
```

- `rules[].url` 必须是 `capture` 能匹配到的子集；Import 时若某 `rule.url` 不可能被任何 `capture` 匹配，**警告**（非阻断）或 **校验失败**（推荐警告）。

## 4.4 工具栏开关

- 工具栏切换 `enabled` 时：**立即**停止/恢复捕获，无需刷新页面。
- 状态持久化到 `chrome.storage`（或等价）。

## 4.5 验收要点

- 修改 `sites` 后，在不匹配站点零捕获。
- 修改 `capture` 后，仅匹配 URL 的请求出现在侧边栏。
- `enabled: false` 时零捕获且侧边栏保留历史或清空（**默认保留历史、停止新增**，需在 UI 标注「已暂停」）。

## 4.6 依赖文档

- [03-rule-group-model.md](./03-rule-group-model.md)
- [05-extraction.md](./05-extraction.md)
