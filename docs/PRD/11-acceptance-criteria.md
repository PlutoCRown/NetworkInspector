# 11 验收标准

## 规则组与提取

- [ ] 默认 Demo 规则组（A1.art、DOUYIN）加载并捕获
- [ ] 字段表达式 `[source:json]event` 正确取值
- [ ] 聚合 `[source:json]items[aggregate]` + `[scope:item]name` 多条卡片
- [ ] 固定文本字段原样展示
- [ ] `[processor:time]`、`[alias:mapkey]` 生效

## 后处理

- [ ] 示例 events-api：`page_view` 别名、debug 丢弃
- [ ] 示例 beacon-api：`expand` 去掉 `_internal`

## 侧边栏

- [ ] card：悬停 popover、点击展开 expand
- [ ] divider 仅 title
- [ ] 角标为捕获条数

## 编辑器

- [ ] 四级菜单与规则组二级列表
- [ ] About 全量导出/导入与勾选弹窗
- [ ] 导入规则组时缺失 Processor/Alias 警告
- [ ] 左侧固定、右侧滚动

## 导入导出

- [ ] 单规则组 JSON 导入
- [ ] 全量 JSON 选择性导入
- [ ] 导出包含 ruleGroups + config
