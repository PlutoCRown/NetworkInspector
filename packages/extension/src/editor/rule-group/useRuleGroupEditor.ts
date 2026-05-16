import { useCallback, useEffect, useRef, useState } from "react";
import { message } from "@/lib/message";
import { sendMessage } from "@/hooks/useAppState";
import { createEmptyRule } from "@/shared/rule/create-empty";
import { normalizeRuleGroup } from "@/shared/rule/normalize";
import type { AppState, RuleGroup } from "@/shared/types";

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

export function useRuleGroupEditor(state: AppState | null, refresh: () => Promise<void>) {
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
    if (isNew) {
      selectGroup("new");
      return;
    }
    const id = queryId ?? state.activeRuleGroupId ?? state.ruleGroups[0]?.id ?? null;
    if (id) selectGroup(id);
    else selectGroup("new");
  }, [state, selectGroup]);

  const syncFromStorage = useCallback(() => {
    if (!state || !selectedId) return;
    const picked = state.ruleGroups.find((g) => g.id === selectedId);
    if (picked) setGroup(normalizeRuleGroup(structuredClone(picked)));
  }, [state, selectedId]);

  const save = async () => {
    if (!group) return;
    const normalized = normalizeRuleGroup(group);
    await sendMessage({ type: "SAVE_RULE_GROUP", group: normalized });
    await sendMessage({ type: "SET_ACTIVE_GROUP", id: normalized.id });
    await refresh();
    setGroup(normalized);
    setSelectedId(normalized.id);
    message.success("已保存");
  };

  const deleteGroup = async () => {
    if (!group || !state) return;
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
    if (!group) return;
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

  return {
    group,
    setGroup,
    selectedId,
    jsonMode,
    setJsonMode,
    jsonText,
    setJsonText,
    selectGroup,
    syncFromStorage,
    save,
    deleteGroup,
    exportJson,
    loadJson,
  };
}
