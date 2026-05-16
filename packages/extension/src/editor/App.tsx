import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAppState, sendMessage } from "@/hooks/useAppState";
import type { Rule, RuleGroup } from "@/shared/types";
import { cn } from "@/lib/utils";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const initialized = useRef(false);

  const selectGroup = useCallback(
    (id: string | "new") => {
      if (!state) return;
      if (id === "new") {
        const next = emptyGroup();
        setGroup(next);
        setSelectedId(next.id);
        setJsonMode(false);
        window.history.replaceState(
          {},
          "",
          `${chrome.runtime.getURL("src/editor/index.html")}?new=1`,
        );
        return;
      }
      const picked = state.ruleGroups.find((g) => g.id === id);
      if (picked) {
        setGroup(structuredClone(picked));
        setSelectedId(id);
        setJsonMode(false);
        window.history.replaceState(
          {},
          "",
          `${chrome.runtime.getURL("src/editor/index.html")}?id=${encodeURIComponent(id)}`,
        );
      }
    },
    [state],
  );

  useEffect(() => {
    if (!state || initialized.current) return;
    initialized.current = true;

    const params = new URLSearchParams(window.location.search);
    const queryId = params.get("id");
    const isNew = params.get("new") === "1";

    if (isNew) {
      selectGroup("new");
      return;
    }

    const id =
      queryId ??
      state.activeRuleGroupId ??
      state.ruleGroups[0]?.id ??
      null;

    if (id) selectGroup(id);
    else selectGroup("new");
  }, [state, selectGroup]);

  if (!group || !state) {
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
    setSelectedId(group.id);
    alert("已保存");
  };

  const deleteGroup = async () => {
    if (state.ruleGroups.length <= 1) {
      alert("至少保留一个规则组");
      return;
    }
    if (!confirm(`确定删除「${group.name}」？`)) return;
    await sendMessage({ type: "DELETE_RULE_GROUP", id: group.id });
    await refresh();
    const next = state.ruleGroups.find((g) => g.id !== group.id);
    if (next) selectGroup(next.id);
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
      setSelectedId(parsed.id);
      setJsonMode(false);
    } catch {
      alert("JSON 解析失败");
    }
  };

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r bg-muted/30">
        <div className="border-b px-3 py-3">
          <p className="text-sm font-semibold">规则组</p>
          <p className="text-[10px] text-muted-foreground">{state.ruleGroups.length} 个</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-0.5">
            {state.ruleGroups.map((g) => (
              <li key={g.id}>
                <button
                  type="button"
                  onClick={() => selectGroup(g.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                    selectedId === g.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent",
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      g.enabled ? "bg-green-500" : "bg-gray-300",
                      selectedId === g.id && "ring-1 ring-white/50",
                    )}
                  />
                  <span className="truncate">{g.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t p-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => selectGroup("new")}
          >
            <Plus className="h-4 w-4" />
            新建规则组
          </Button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{group.name}</h1>
            <p className="text-sm text-muted-foreground">编辑站点、捕获与字段提取</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => setJsonMode((v) => !v)}>
              {jsonMode ? "表单" : "JSON"}
            </Button>
            <Button variant="outline" size="sm" onClick={exportJson}>
              <Download className="h-4 w-4" />
              导出
            </Button>
            <Button variant="outline" size="sm" onClick={deleteGroup}>
              <Trash2 className="h-4 w-4" />
              删除
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
          <div className="mx-auto max-w-2xl space-y-6">
            <section className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="name">名称</Label>
                <div className="flex items-center gap-2">
                  <Label htmlFor="enabled">启用捕获</Label>
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
      </main>
    </div>
  );
}
