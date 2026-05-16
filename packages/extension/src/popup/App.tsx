import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileUp,
  PanelRight,
  RefreshCw,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAppState, sendMessage } from "@/hooks/useAppState";
import { openEditorTab, openSidePanel } from "@/lib/chrome-api";
import { validateRuleGroup } from "@/shared/pipeline";
import { matchesAny } from "@/shared/regex";
import type { RuleGroup } from "@/shared/types";
import { cn } from "@/lib/utils";

export function PopupApp() {
  const { state, refresh } = useAppState();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tabUrl, setTabUrl] = useState<string | null>(null);
  const [groupsExpanded, setGroupsExpanded] = useState(false);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setTabUrl(tabs[0]?.url ?? null);
    });
  }, []);

  const groups = state?.ruleGroups ?? [];
  const globalOn = state?.captureEnabled ?? true;
  const enabledCount = groups.filter((g) => g.enabled).length;

  const siteMatches = (group: RuleGroup) => {
    if (!tabUrl) return true;
    return matchesAny(tabUrl, group.sites);
  };

  const effectiveCount = globalOn
    ? groups.filter((g) => g.enabled && siteMatches(g)).length
    : 0;

  const handleImportFile = async (file: File) => {
    const text = await file.text();
    const json = JSON.parse(text) as RuleGroup;
    if (!validateRuleGroup(json)) {
      alert("无效的规则组 JSON");
      return;
    }
    const res = await sendMessage<{ ok: boolean }>({
      type: "IMPORT_RULE_GROUP",
      group: json,
      overwrite: true,
    });
    if (!res.ok) alert("导入失败");
    else await refresh();
  };

  const handleRefresh = () => {
    void sendMessage({ type: "RELOAD_STATE" }).then(() => {
      void refresh();
    });
  };

  return (
    <div className="w-[340px] space-y-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">NetworkInspector</h1>
          <p className="text-xs text-muted-foreground">快捷网络检查和回放面板</p>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-8 w-8 shrink-0"
          onClick={handleRefresh}
          title="刷新规则组"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div
        className={cn(
          "flex items-center justify-between rounded-lg border px-3 py-2.5",
          globalOn
            ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950/50"
            : "border-border bg-muted/40",
        )}
      >
        <div>
          <Label htmlFor="global-switch" className="text-sm font-medium">
            总开关
          </Label>
          <p className="text-[10px] text-muted-foreground">
            {globalOn ? "捕获已启用" : "已暂停所有新捕获"}
          </p>
        </div>
        <Switch
          id="global-switch"
          checked={globalOn}
          onCheckedChange={() => sendMessage({ type: "TOGGLE_CAPTURE_ENABLED" })}
        />
      </div>

      <Button className="w-full justify-start" onClick={() => openSidePanel(() => window.close())}>
        <PanelRight className="h-4 w-4" />
        打开侧边栏
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => openEditorTab(undefined, { view: "settings" })}
      >
        <Settings className="h-4 w-4" />
        全局配置
      </Button>

      <section className="overflow-hidden rounded-lg border">
        <div className="flex items-center gap-2 bg-muted/30 px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">规则组</p>
            <p className="text-[10px] text-muted-foreground">
              {enabledCount} 个启用中
              <span className="mx-1 text-muted-foreground/50">·</span>
              {effectiveCount} 个生效中
            </p>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={() => setGroupsExpanded((v) => !v)}
            title={groupsExpanded ? "收起" : "展开"}
          >
            {groupsExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={() => fileRef.current?.click()}
            title="导入 JSON"
          >
            <FileUp className="h-4 w-4" />
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleImportFile(f);
              e.target.value = "";
            }}
          />
        </div>

        {groupsExpanded && (
          <div className="border-t p-2">
            {groups.length === 0 ? (
              <p className="py-3 text-center text-xs text-muted-foreground">暂无规则组</p>
            ) : (
              <ul className="max-h-[220px] space-y-1.5 overflow-y-auto">
                {groups.map((group) => {
                  const siteOk = siteMatches(group);
                  const activeCapture = group.enabled && globalOn;
                  return (
                    <li
                      key={group.id}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-2",
                        activeCapture &&
                        siteOk &&
                        "border-green-200 bg-green-50/80 dark:border-green-800 dark:bg-green-950/40",
                        activeCapture && !siteOk && "border-border bg-muted/30 opacity-60",
                        !activeCapture && "border-border bg-muted/20",
                      )}
                    >
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => openEditorTab(group.id)}
                      >
                        <p
                          className={cn(
                            "truncate text-sm font-medium",
                            activeCapture && !siteOk && "text-muted-foreground",
                          )}
                        >
                          {group.name}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {group.enabled ? (
                            <Badge variant="success" className="mr-1 px-1 py-0 text-[9px]">
                              已启用
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="mr-1 px-1 py-0 text-[9px]">
                              已关闭
                            </Badge>
                          )}
                          {group.enabled && globalOn && siteOk && (
                            <Badge variant="success" className="mr-1 px-1 py-0 text-[9px]">
                              生效中
                            </Badge>
                          )}
                          {group.enabled && globalOn && !siteOk && (
                            <Badge variant="outline" className="mr-1 px-1 py-0 text-[9px]">
                              当前页不匹配
                            </Badge>
                          )}
                          {group.rules.length} 条规则
                        </p>
                      </button>
                      <Switch
                        checked={group.enabled}
                        disabled={!globalOn}
                        onCheckedChange={() =>
                          sendMessage({ type: "TOGGLE_RULE_GROUP", id: group.id })
                        }
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
