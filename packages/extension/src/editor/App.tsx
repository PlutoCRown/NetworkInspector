import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppState, sendMessage } from "@/hooks/useAppState";
import { createEmptyRule } from "@/shared/create-empty-rule";
import { normalizeRuleGroup } from "@/shared/normalize-rule-group";
import type { AppConfig, RuleGroup } from "@/shared/types";
import { cn } from "@/lib/utils";
import { GlobalConfigSection } from "./form/GlobalConfigSection";
import { RuleGroupForm } from "./RuleGroupForm";

function emptyGroup(): RuleGroup {
  return normalizeRuleGroup({
    version: 1,
    id: `group-${Date.now()}`,
    name: "新规则组",
    enabled: true,
    sites: ["^https?://"],
    capture: ["/api/"],
    rules: [createEmptyRule("/api/")],
  });
}

export function EditorApp() {
  const { state, refresh } = useAppState();
  const [group, setGroup] = useState<RuleGroup | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [view, setView] = useState<"group" | "settings">("group");
  const [configDraft, setConfigDraft] = useState<AppConfig | null>(null);
  const initialized = useRef(false);

  const config = configDraft ?? state?.config;

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
        setGroup(normalizeRuleGroup(structuredClone(picked)));
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
    const openSettings = params.get("view") === "settings";

    if (openSettings) setView("settings");

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

  useEffect(() => {
    if (state?.config) setConfigDraft(state.config);
  }, [state?.config]);

  if (!group || !state || !config) {
    return <div className="p-6">加载中…</div>;
  }

  const saveConfig = async () => {
    await sendMessage({ type: "SAVE_APP_CONFIG", config });
    await refresh();
    alert("全局配置已保存");
  };

  const save = async () => {
    const normalized = normalizeRuleGroup(group);
    await sendMessage({ type: "SAVE_RULE_GROUP", group: normalized });
    await sendMessage({ type: "SET_ACTIVE_GROUP", id: normalized.id });
    await refresh();
    setGroup(normalized);
    setSelectedId(normalized.id);
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
    const blob = new Blob([JSON.stringify(normalizeRuleGroup(group), null, 2)], {
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
      setGroup(normalizeRuleGroup(parsed));
      setSelectedId(parsed.id);
      setJsonMode(false);
    } catch {
      alert("JSON 解析失败");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="flex h-full w-56 shrink-0 flex-col border-r bg-muted/30">
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
                  onClick={() => {
                    setView("group");
                    selectGroup(g.id);
                  }}
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
                      g.enabled ? "bg-green-500 dark:bg-green-400" : "bg-muted-foreground/40",
                      selectedId === g.id && "ring-1 ring-primary-foreground/50",
                    )}
                  />
                  <span className="truncate">{g.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="space-y-1 border-t p-2">
          <Button
            variant={view === "settings" ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start"
            onClick={() => setView("settings")}
          >
            全局配置
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              setView("group");
              selectGroup("new");
            }}
          >
            <Plus className="h-4 w-4" />
            新建规则组
          </Button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto p-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">
              {view === "settings" ? "全局配置" : group.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {view === "settings"
                ? "别名映射与自定义 Processor"
                : "编辑站点、捕获与字段提取"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {view === "settings" ? (
              <Button size="sm" onClick={saveConfig}>
                <Save className="h-4 w-4" />
                保存
              </Button>
            ) : (
              <>
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
              </>
            )}
          </div>
        </header>

        {view === "settings" ? (
          <div className="mx-auto max-w-2xl">
            <GlobalConfigSection config={config} onChange={setConfigDraft} />
          </div>
        ) : jsonMode ? (
          <div className="space-y-3">
            <Textarea
              className="min-h-[420px] font-mono text-xs"
              value={jsonText || JSON.stringify(normalizeRuleGroup(group), null, 2)}
              onChange={(e) => setJsonText(e.target.value)}
            />
            <Button onClick={loadJson}>应用 JSON</Button>
          </div>
        ) : (
          <RuleGroupForm group={group} config={config} onChange={setGroup} />
        )}
      </main>
    </div>
  );
}
