import { useEffect, useState } from "react";
import { Download, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAppState, sendMessage } from "@/hooks/useAppState";
import type { Rule, RuleGroup } from "@/shared/types";

const RENDERER_FIELDS: Record<string, string[]> = {
  "title-popover": ["title", "popover"],
  "title-desc-expand": ["title", "desc", "expend"],
};

function emptyRule(): Rule {
  return {
    id: `rule-${Date.now()}`,
    url: "/api/",
    renderer: "title-popover",
    fields: { title: "json:", popover: "json:" },
  };
}

function emptyGroup(): RuleGroup {
  return {
    version: 1,
    id: `group-${Date.now()}`,
    name: "新规则组",
    enabled: true,
    sites: ["^https?://"],
    capture: ["/api/"],
    rules: [emptyRule()],
  };
}

export function EditorApp() {
  const { state, refresh } = useAppState();
  const [group, setGroup] = useState<RuleGroup | null>(null);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState("");

  useEffect(() => {
    if (!state) return;
    const active =
      state.ruleGroups.find((g) => g.id === state.activeRuleGroupId) ??
      state.ruleGroups[0];
    setGroup(active ? structuredClone(active) : emptyGroup());
  }, [state?.activeRuleGroupId, state?.ruleGroups]);

  if (!group) {
    return <div className="p-6">加载中…</div>;
  }

  const updateRule = (index: number, patch: Partial<Rule>) => {
    const rules = [...group.rules];
    rules[index] = { ...rules[index]!, ...patch };
    setGroup({ ...group, rules });
  };

  const updateRuleField = (ruleIndex: number, field: string, value: string) => {
    const rule = group.rules[ruleIndex]!;
    updateRule(ruleIndex, {
      fields: { ...rule.fields, [field]: value },
    });
  };

  const onRendererChange = (ruleIndex: number, renderer: string) => {
    const keys = RENDERER_FIELDS[renderer] ?? ["title"];
    const fields: Record<string, string> = {};
    for (const k of keys) {
      fields[k] = group.rules[ruleIndex]?.fields[k] ?? "json:";
    }
    updateRule(ruleIndex, { renderer, fields });
  };

  const save = async () => {
    await sendMessage({ type: "SAVE_RULE_GROUP", group });
    await sendMessage({ type: "SET_ACTIVE_GROUP", id: group.id });
    await refresh();
    alert("已保存");
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(group, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${group.id}.json`;
    a.click();
  };

  const loadJson = () => {
    try {
      const parsed = JSON.parse(jsonText) as RuleGroup;
      setGroup(parsed);
      setJsonMode(false);
    } catch {
      alert("JSON 解析失败");
    }
  };

  return (
    <div className="mx-auto min-h-screen max-w-3xl p-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">规则组编辑器</h1>
          <p className="text-sm text-muted-foreground">配置站点、捕获与字段提取</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setJsonMode((v) => !v)}>
            {jsonMode ? "表单" : "JSON"}
          </Button>
          <Button variant="outline" size="sm" onClick={exportJson}>
            <Download className="h-4 w-4" />
            导出
          </Button>
          <Button size="sm" onClick={save}>
            <Save className="h-4 w-4" />
            保存
          </Button>
        </div>
      </header>

      {jsonMode ? (
        <div className="space-y-3">
          <Textarea
            className="min-h-[420px] font-mono text-xs"
            value={jsonText || JSON.stringify(group, null, 2)}
            onChange={(e) => setJsonText(e.target.value)}
          />
          <Button onClick={loadJson}>应用 JSON</Button>
        </div>
      ) : (
        <div className="space-y-6">
          <section className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="name">名称</Label>
              <div className="flex items-center gap-2">
                <Label htmlFor="enabled">启用</Label>
                <Switch
                  id="enabled"
                  checked={group.enabled}
                  onCheckedChange={(enabled) => setGroup({ ...group, enabled })}
                />
              </div>
            </div>
            <Input
              id="name"
              value={group.name}
              onChange={(e) => setGroup({ ...group, name: e.target.value })}
            />
            <div>
              <Label>站点正则（每行一条）</Label>
              <Textarea
                className="mt-1 font-mono text-xs"
                rows={3}
                value={group.sites.join("\n")}
                onChange={(e) =>
                  setGroup({
                    ...group,
                    sites: e.target.value.split("\n").filter(Boolean),
                  })
                }
              />
            </div>
            <div>
              <Label>捕获 URL 正则（每行一条）</Label>
              <Textarea
                className="mt-1 font-mono text-xs"
                rows={3}
                value={group.capture.join("\n")}
                onChange={(e) =>
                  setGroup({
                    ...group,
                    capture: e.target.value.split("\n").filter(Boolean),
                  })
                }
              />
            </div>
          </section>

          {group.rules.map((rule, i) => (
            <section key={rule.id} className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <h2 className="font-medium">规则 {i + 1}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const rules = group.rules.filter((_, idx) => idx !== i);
                    setGroup({ ...group, rules });
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label>Renderer</Label>
                <select
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  value={rule.renderer}
                  onChange={(e) => onRendererChange(i, e.target.value)}
                >
                  <option value="title-popover">title-popover</option>
                  <option value="title-desc-expand">title-desc-expand</option>
                </select>
              </div>

              <div>
                <Label>URL 正则</Label>
                <Input
                  className="mt-1 font-mono text-xs"
                  value={rule.url}
                  onChange={(e) => updateRule(i, { url: e.target.value })}
                />
              </div>

              {(RENDERER_FIELDS[rule.renderer] ?? Object.keys(rule.fields)).map(
                (field) => (
                  <div key={field}>
                    <Label>
                      {field}{" "}
                      <span className="text-muted-foreground">(来源:路径)</span>
                    </Label>
                    <Input
                      className="mt-1 font-mono text-xs"
                      placeholder="json:event.name"
                      value={rule.fields[field] ?? ""}
                      onChange={(e) => updateRuleField(i, field, e.target.value)}
                    />
                  </div>
                ),
              )}
            </section>
          ))}

          <Button
            variant="outline"
            onClick={() =>
              setGroup({ ...group, rules: [...group.rules, emptyRule()] })
            }
          >
            <Plus className="h-4 w-4" />
            添加规则
          </Button>
        </div>
      )}

      {state && state.ruleGroups.length > 1 && (
        <footer className="mt-8 border-t pt-4">
          <Label>切换规则组</Label>
          <select
            className="mt-1 flex h-9 w-full rounded-md border px-3 text-sm"
            value={group.id}
            onChange={(e) => {
              const next = state.ruleGroups.find((g) => g.id === e.target.value);
              if (next) setGroup(structuredClone(next));
            }}
          >
            {state.ruleGroups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </footer>
      )}
    </div>
  );
}
