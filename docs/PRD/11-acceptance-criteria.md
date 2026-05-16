# 11 验收标准

## 规则组与提取

- [ ] 默认配置（`presets/example.json`）中 A1.art、抖音规则组可加载并捕获
- [ ] `[source:json]` 从 **request body** 取值；`[source:response]` 从响应取值
- [ ] `splits` + `[aggregate:item]` 多条卡片；拆分源为对象时单条卡片
- [ ] 固定文本字段原样展示
- [ ] `[processor:time]`、`[processor:JSONParser]`、`[alias:mapkey]` 生效

## 后处理

- [ ] 规则级 `alias` 替换 title
- [ ] `filter`：`drop` 丢弃、`strip` 删除对象键

## 侧边栏

- [ ] card：`expand` 点击展开；无 popover
- [ ] divider 仅 title
- [ ] 角标为可见捕获条数；暂停后不再新增

## 编辑器

- [ ] 侧栏：规则组 / 处理器 / 别名 / About，二级列表与新建
- [ ] About 全量导出/导入与勾选弹窗
- [ ] 字段输入 `/` 补全；编辑过程不易被回写清空
- [ ] Processor 非法函数体：红框 + 保存拦截

## 导入导出

- [ ] 单规则组 JSON 导入导出
- [ ] 全量 JSON 选择性导入
- [ ] 导出包含 `ruleGroups` + `config`

## 构建

- [ ] `bun run build`、`bun run test`、`bun run typecheck` 通过
