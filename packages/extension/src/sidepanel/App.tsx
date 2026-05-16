import { useMemo } from "react";
import { PanelRightOpen } from "lucide-react";
import { CaptureCard, CaptureListHeader } from "@/components/CaptureCard";
import { Button } from "@/components/ui/button";
import { useAppState, sendMessage } from "@/hooks/useAppState";
export function SidePanelApp() {
  const { state, loading } = useAppState();

  const activeGroup = useMemo(
    () => state?.ruleGroups.find((g) => g.id === state.activeRuleGroupId),
    [state],
  );

  if (loading || !state) {
    return <div className="p-4 text-muted-foreground">加载中…</div>;
  }

  if (!activeGroup) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <p className="text-muted-foreground">未选择规则组</p>
        <Button onClick={() => sendMessage({ type: "OPEN_EDITOR" })}>创建 / 导入</Button>
      </div>
    );
  }

  const captures = state.captures.filter((c) => c.ruleGroupId === activeGroup.id);
  const paused = !activeGroup.enabled;

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="truncate font-semibold">{activeGroup.name}</h1>
            <p className="text-[10px] text-muted-foreground">
              {activeGroup.enabled ? "运行中" : "已暂停"}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => sendMessage({ type: "TOGGLE_ENABLED" })}
          >
            {activeGroup.enabled ? "暂停" : "启用"}
          </Button>
        </div>
      </header>

      <CaptureListHeader
        count={captures.length}
        paused={paused}
        onClear={() => sendMessage({ type: "CLEAR_CAPTURES" })}
      />

      <div className="flex-1 overflow-y-auto p-3">
        {paused && captures.length > 0 && (
          <p className="mb-2 text-xs text-amber-600">规则组已暂停，以下为历史记录</p>
        )}
        {!paused && captures.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            等待网络请求…
            <br />
            <span className="text-xs">在匹配站点上触发 fetch / XHR</span>
          </p>
        )}
        <div className="flex flex-col gap-2">
          {captures.map((record) => (
            <CaptureCard key={record.id} record={record} />
          ))}
        </div>
      </div>

      <footer className="border-t p-2">
        <Button
          className="w-full"
          variant="secondary"
          size="sm"
          onClick={() => sendMessage({ type: "OPEN_EDITOR" })}
        >
          <PanelRightOpen className="h-4 w-4" />
          编辑规则组
        </Button>
      </footer>
    </div>
  );
}
