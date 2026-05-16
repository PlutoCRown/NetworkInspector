import { useRef } from "react";
import { FileUp, PanelRight, Pencil, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState, sendMessage } from "@/hooks/useAppState";
import { validateRuleGroup } from "@/shared/pipeline";
import type { RuleGroup } from "@/shared/types";

export function PopupApp() {
  const { state } = useAppState();
  const fileRef = useRef<HTMLInputElement>(null);

  const activeGroup = state?.ruleGroups.find((g) => g.id === state.activeRuleGroupId);

  const handleImportFile = async (file: File) => {
    const text = await file.text();
    const json = JSON.parse(text) as RuleGroup;
    if (!validateRuleGroup(json)) {
      alert("无效的规则组 JSON");
      return;
    }
    const res = await sendMessage<{ ok: boolean; conflict?: boolean }>({
      type: "IMPORT_RULE_GROUP",
      group: json,
      overwrite: true,
    });
    if (!res.ok) alert("导入失败");
    else alert(`已导入：${json.name}`);
  };

  return (
    <div className="w-80 space-y-3 p-4">
      <div>
        <h1 className="text-lg font-semibold">NetworkInspector</h1>
        <p className="text-xs text-muted-foreground">网络埋点捕获与检查</p>
      </div>

      {activeGroup && (
        <div className="rounded-md border bg-muted/40 p-3 text-sm">
          <p className="font-medium">{activeGroup.name}</p>
          <p className="text-xs text-muted-foreground">
            {activeGroup.enabled ? "已启用" : "已暂停"} · {activeGroup.rules.length} 条规则
          </p>
        </div>
      )}

      <div className="grid gap-2">
        <Button
          className="w-full justify-start"
          onClick={() => sendMessage({ type: "OPEN_SIDE_PANEL" })}
        >
          <PanelRight className="h-4 w-4" />
          打开侧边栏
        </Button>
        <Button
          className="w-full justify-start"
          variant="secondary"
          onClick={() => sendMessage({ type: "OPEN_EDITOR" })}
        >
          <Pencil className="h-4 w-4" />
          创建 / 编辑规则组
        </Button>
        <Button
          className="w-full justify-start"
          variant="outline"
          onClick={() => sendMessage({ type: "TOGGLE_ENABLED" })}
          disabled={!activeGroup}
        >
          <Power className="h-4 w-4" />
          {activeGroup?.enabled ? "暂停捕获" : "启用捕获"}
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
            if (f) handleImportFile(f);
            e.target.value = "";
          }}
        />
      </div>

      <p className="text-[10px] leading-relaxed text-muted-foreground">
        文档与 Playground 即将推出。可先导入仓库根目录的 rule-group.schema.example.json 进行测试。
      </p>
    </div>
  );
}
