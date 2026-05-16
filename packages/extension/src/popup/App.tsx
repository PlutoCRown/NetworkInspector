import { useEffect, useRef, useState } from "react";
import { FileUp, PanelRight, Pencil, Plus, RefreshCw } from "lucide-react";
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
            {globalOn
              ? `捕获已启用 · ${enabledCount} 个规则组参与`
              : "已暂停所有新捕获"}
          </p>
        </div>
        <Switch
          id="global-switch"
          checked={globalOn}
          onCheckedChange={() => sendMessage({ type: "TOGGLE_CAPTURE_ENABLED" })}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground">规则组</p>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs"
            onClick={() => openEditorTab(undefined, { newGroup: true })}
          >
            <Plus className="mr-1 h-3 w-3" />
            新建
          </Button>
        </div>
        {groups.length === 0 ? (
          <p className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
            暂无规则组
          </p>
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
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        activeCapture && !siteOk && "text-muted-foreground",
                      )}
                    >
                      {group.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {group.enabled ? (
                        <Badge variant="success" className="mr-1 px-1 py-0 text-[9px]">
                          已启用
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="mr-1 px-1 py-0 text-[9px]">
                          已关闭
                        </Badge>
                      )}
                      {!siteOk && group.enabled && (
                        <Badge variant="outline" className="mr-1 px-1 py-0 text-[9px]">
                          该规则在当前网页不会生效
                        </Badge>
                      )}
                      {group.rules.length} 条规则
                    </p>
                  </div>
                  <Switch
                    checked={group.enabled}
                    disabled={!globalOn}
                    onCheckedChange={() =>
                      sendMessage({ type: "TOGGLE_RULE_GROUP", id: group.id })
                    }
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 shrink-0"
                    onClick={() => openEditorTab(group.id)}
                    title="编辑规则组"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="grid gap-2 border-t pt-3">
        <Button className="w-full justify-start" onClick={() => openSidePanel(() => window.close())}>
          <PanelRight className="h-4 w-4" />
          打开侧边栏
        </Button>
        <Button
          className="w-full justify-start"
          variant="outline"
          onClick={() => fileRef.current?.click()}
        >
          <FileUp className="h-4 w-4" />
          导入 JSON
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
    </div>
  );
}
