import { useMemo } from "react";
import { CaptureListHeader } from "@/components/CaptureCard";
import { CaptureRenderer } from "@/components/CaptureRenderer";
import { useAppState, sendMessage } from "@/hooks/useAppState";
import { getVisibleCaptures } from "@/shared/capture/visible";

export function SidePanelApp() {
  const { state, loading } = useAppState();

  const captures = useMemo(
    () => (state ? getVisibleCaptures(state) : []),
    [state],
  );

  if (loading || !state) {
    return <div className="p-4 text-muted-foreground">加载中…</div>;
  }

  const globalOn = state.captureEnabled;
  const hasEnabledGroup = state.ruleGroups.some((g) => g.enabled);

  return (
    <div className="flex h-screen flex-col">
      <CaptureListHeader
        count={captures.length}
        paused={!globalOn || !hasEnabledGroup}
        onClear={() => sendMessage({ type: "CLEAR_CAPTURES" })}
      />

      <div className="flex-1 overflow-y-auto p-3">
        {!globalOn && (
          <p className="mb-2 rounded-md bg-amber-50 px-2 py-1.5 text-xs text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
            总开关已关闭，不再产生新捕获
          </p>
        )}
        {globalOn && !hasEnabledGroup && (
          <p className="mb-2 text-center text-xs text-muted-foreground">
            请在插件弹窗中启用至少一个规则组
          </p>
        )}
        {captures.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground">
            等待网络请求…
            <br />
            <span className="text-xs">已启用规则组的捕获将显示在此</span>
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {captures.map((record) => (
              <CaptureRenderer key={record.id} record={record} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
