import { useEffect, useRef, useState } from "react";
import { Save } from "lucide-react";
import { ImportBundleDialog } from "@/components/ImportBundleDialog";
import { EditorSaveButton } from "@/components/ui/preset-buttons";
import { useAppState, sendMessage } from "@/hooks/useAppState";
import { useImportJson } from "@/hooks/useImportJson";
import { message } from "@/lib/message";
import type { AppConfig } from "@/shared/types";
import { validateAppConfigForSave } from "@/shared/app/validate-config";
import { DEFAULT_APP_CONFIG } from "@/shared/types";
import { EditorSidebar, type EditorNavSection } from "./EditorSidebar";
import { AboutSection } from "./form/AboutSection";
import { AliasSection, newAliasMapkey } from "./form/AliasSection";
import { ProcessorSection } from "./form/ProcessorSection";
import { RuleGroupEditorPanel } from "./rule-group/RuleGroupEditorPanel";
import { useRuleGroupEditor } from "./rule-group/useRuleGroupEditor";

function parseSectionParam(value: string | null): EditorNavSection {
  if (value === "processors" || value === "alias" || value === "about") return value;
  return "rule-groups";
}

export function EditorApp() {
  const { state, refresh } = useAppState();
  const [section, setSection] = useState<EditorNavSection>("rule-groups");
  const [selectedProcessorId, setSelectedProcessorId] = useState<string | null>(null);
  const [selectedAliasKey, setSelectedAliasKey] = useState<string | null>(null);
  const [configDraft, setConfigDraft] = useState<AppConfig | null>(null);
  const sectionInitialized = useRef(false);

  const {
    group,
    setGroup,
    selectedId,
    jsonMode,
    setJsonMode,
    jsonText,
    setJsonText,
    selectGroup,
    syncFromStorage,
    save: saveRuleGroup,
    deleteGroup,
    exportJson,
    loadJson,
  } = useRuleGroupEditor(state, refresh);
  const config = configDraft ?? state?.config;
  const importJson = useImportJson(config ?? DEFAULT_APP_CONFIG, refresh);

  useEffect(() => {
    if (!sectionInitialized.current) {
      sectionInitialized.current = true;
      const params = new URLSearchParams(window.location.search);
      setSection(parseSectionParam(params.get("view")));
    }
  }, []);

  useEffect(() => {
    if (state?.config) setConfigDraft(state.config);
  }, [state?.config]);

  useEffect(() => {
    if (state && section === "rule-groups") syncFromStorage();
  }, [state, section, syncFromStorage]);

  if (!group || !state || !config) {
    return <div>加载中…</div>;
  }

  const saveConfig = async () => {
    const errors = validateAppConfigForSave(config);
    if (errors.length > 0) {
      message.error(errors[0]!);
      return;
    }
    await sendMessage({ type: "SAVE_APP_CONFIG", config });
    await refresh();
    message.success("已保存");
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
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">{headerTitle}</h1>
          <p className="text-sm text-muted-foreground">{headerDesc}</p>
          {(section === "processors" || section === "alias") && (
            <div className="mt-3">
              <EditorSaveButton onClick={saveConfig}>
                <Save className="h-4 w-4" />
                保存
              </EditorSaveButton>
            </div>
          )}
        </header>

        {section === "processors" && (
          <ProcessorSection
            config={config}
            processorId={selectedProcessorId}
            onChange={setConfigDraft}
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
        {section === "rule-groups" && (
          <RuleGroupEditorPanel
            group={group}
            config={config}
            jsonMode={jsonMode}
            jsonText={jsonText}
            onGroupChange={setGroup}
            onJsonModeToggle={() => setJsonMode((v) => !v)}
            onJsonTextChange={setJsonText}
            onSave={() => void saveRuleGroup()}
            onDelete={() => void deleteGroup()}
            onExport={exportJson}
            onLoadJson={loadJson}
          />
        )}
      </main>
    </div>
  );
}
