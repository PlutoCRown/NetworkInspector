import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImportBundleDialog } from "@/components/ImportBundleDialog";
import { useAppState, sendMessage } from "@/hooks/useAppState";
import { useImportJson } from "@/hooks/useImportJson";
import { message } from "@/lib/message";
import { createEmptyRule } from "@/shared/rule/create-empty";
import { normalizeRuleGroup } from "@/shared/rule/normalize";
import type { AppConfig, RuleGroup } from "@/shared/types";
import { DEFAULT_APP_CONFIG } from "@/shared/types";
import { EditorSidebar, type EditorNavSection } from "./EditorSidebar";
import { AboutSection } from "./form/AboutSection";
import { AliasSection, newAliasMapkey } from "./form/AliasSection";
import { ProcessorSection } from "./form/ProcessorSection";
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

function parseSectionParam(value: string | null): EditorNavSection {
  if (value === "processors" || value === "alias" || value === "about") return value;
  return "rule-groups";
}

export function EditorApp() {
  const { state, refresh } = useAppState();
  const [group, setGroup] = useState<RuleGroup | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [section, setSection] = useState<EditorNavSection>("rule-groups");
  const [selectedProcessorId, setSelectedProcessorId] = useState<string | null>(null);
  const [selectedAliasKey, setSelectedAliasKey] = useState<string | null>(null);
  const [configDraft, setConfigDraft] = useState<AppConfig | null>(null);
  const initialized = useRef(false);

  const config = configDraft ?? state?.config;

  const importJson = useImportJson(config ?? DEFAULT_APP_CONFIG, refresh);

  const selectGroup = useCallback(
    (id: string | "new") => {
      if (!state) return;
      setSection("rule-groups");
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
    setSection(parseSectionParam(params.get("view")));

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

  useEffect(() => {
    if (!state || section !== "rule-groups" || !selectedId) return;
    const picked = state.ruleGroups.find((g) => g.id === selectedId);
    if (picked) setGroup(normalizeRuleGroup(structuredClone(picked)));
  }, [state, section, selectedId]);

  if (!group || !state || !config) {
    return <div className="p-6">加载中…</div>;
  }

  const saveConfig = async () => {
    await sendMessage({ type: "SAVE_APP_CONFIG", config });
    await refresh();
    message.success("已保存");
  };

  const save = async () => {
    const normalized = normalizeRuleGroup(group);
    await sendMessage({ type: "SAVE_RULE_GROUP", group: normalized });
    await sendMessage({ type: "SET_ACTIVE_GROUP", id: normalized.id });
    await refresh();
    setGroup(normalized);
    setSelectedId(normalized.id);
    message.success("已保存");
  };

  const deleteGroup = async () => {
    if (state.ruleGroups.length <= 1) {
      message.warning("至少保留一个规则组");
      return;
    }
    const ok = await message.confirm({
      title: `删除「${group.name}」？`,
      description: "此操作不可撤销。",
      confirmLabel: "删除",
      destructive: true,
    });
    if (!ok) return;
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
      message.error("JSON 解析失败");
    }
  };

  const processorIds = Object.keys(config.customProcessors);
  const aliasGroup = selectedAliasKey ? config.aliasMaps[selectedAliasKey] : null;

  const headerTitle = {
    "rule-groups": group.name,
    processors: selectedProcessorId ?? "处理器",
    alias: aliasGroup?.name ?? selectedAliasKey ?? "别名",
    about: "About",
  }[section];

  const headerDesc = {
    "rule-groups": "规则组编辑",
    processors: "处理器函数编辑",
    alias: "别名映射表",
    about: "版本信息与数据导出",
  }[section];

  const addProcessor = () => {
    const id = `fn-${Date.now().toString(36)}`;
    setConfigDraft({
      ...config,
      customProcessors: { ...config.customProcessors, [id]: "(value) => value" },
    });
    setSelectedProcessorId(id);
    setSection("processors");
  };

  const removeProcessor = (id: string) => {
    const next = { ...config.customProcessors };
    delete next[id];
    setConfigDraft({ ...config, customProcessors: next });
    const remaining = Object.keys(next);
    setSelectedProcessorId(remaining[0] ?? null);
  };

  const addAlias = () => {
    const mapkey = newAliasMapkey();
    setConfigDraft({
      ...config,
      aliasMaps: { ...config.aliasMaps, [mapkey]: { name: "新 Alias 组", mappings: {} } },
    });
    setSelectedAliasKey(mapkey);
    setSection("alias");
  };

  const removeAlias = (mapkey: string) => {
    const next = { ...config.aliasMaps };
    delete next[mapkey];
    setConfigDraft({ ...config, aliasMaps: next });
    const remaining = Object.keys(next);
    setSelectedAliasKey(remaining[0] ?? null);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <EditorSidebar
        section={section}
        onSectionChange={setSection}
        ruleGroups={state.ruleGroups}
        config={config}
        selectedGroupId={selectedId}
        selectedProcessorId={selectedProcessorId}
        selectedAliasKey={selectedAliasKey}
        onSelectGroup={selectGroup}
        onNewGroup={() => selectGroup("new")}
        onSelectProcessor={setSelectedProcessorId}
        onNewProcessor={addProcessor}
        onSelectAlias={setSelectedAliasKey}
        onNewAlias={addAlias}
      />

      <input
        ref={importJson.fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void importJson.handleFile(f);
          e.target.value = "";
        }}
      />

      {importJson.bundleDialog && importJson.pendingBundle && config && (
        <ImportBundleDialog
          stats={importJson.bundleDialog}
          bundle={importJson.pendingBundle}
          currentConfig={config}
          onCancel={importJson.cancelBundleImport}
          onConfirm={importJson.confirmBundleImport}
        />
      )}

      <main className="min-w-0 flex-1 overflow-y-auto p-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{headerTitle}</h1>
            <p className="text-sm text-muted-foreground">{headerDesc}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {section === "processors" || section === "alias" ? (
              <Button size="sm" onClick={saveConfig}>
                <Save className="h-4 w-4" />
                保存
              </Button>
            ) : section === "rule-groups" ? (
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
            ) : null}
          </div>
        </header>

        {section === "processors" && (
          <ProcessorSection
            config={config}
            processorId={selectedProcessorId}
            onChange={(next) => {
              setConfigDraft(next);
              if (selectedProcessorId && !(selectedProcessorId in next.customProcessors)) {
                setSelectedProcessorId(Object.keys(next.customProcessors)[0] ?? null);
              }
            }}
            onRemove={removeProcessor}
            onIdChange={setSelectedProcessorId}
          />
        )}
        {section === "alias" && (
          <AliasSection
            config={config}
            mapkey={selectedAliasKey}
            onChange={setConfigDraft}
            onRemove={removeAlias}
          />
        )}
        {section === "about" && <AboutSection state={state} importJson={importJson} />}
        {section === "rule-groups" &&
          (jsonMode ? (
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
          ))}
      </main>
    </div>
  );
}
