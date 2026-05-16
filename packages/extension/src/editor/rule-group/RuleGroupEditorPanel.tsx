import { Download, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  EditorSaveButton,
  EditorToolbarButton,
} from "@/components/ui/preset-buttons";
import { normalizeRuleGroup } from "@/shared/rule/normalize";
import type { AppConfig, RuleGroup } from "@/shared/types";
import { RuleGroupForm } from "./RuleGroupForm";

interface RuleGroupEditorPanelProps {
  group: RuleGroup;
  config: AppConfig;
  jsonMode: boolean;
  jsonText: string;
  onGroupChange: (group: RuleGroup) => void;
  onJsonModeToggle: () => void;
  onJsonTextChange: (text: string) => void;
  onSave: () => void;
  onDelete: () => void;
  onExport: () => void;
  onLoadJson: () => void;
}

export function RuleGroupEditorPanel({
  group,
  config,
  jsonMode,
  jsonText,
  onGroupChange,
  onJsonModeToggle,
  onJsonTextChange,
  onSave,
  onDelete,
  onExport,
  onLoadJson,
}: RuleGroupEditorPanelProps) {
  return (
    <>
      <div className="mb-6 flex flex-wrap gap-2">
        <EditorToolbarButton onClick={onJsonModeToggle}>
          {jsonMode ? "表单" : "JSON"}
        </EditorToolbarButton>
        <EditorToolbarButton onClick={onExport}>
          <Download className="h-4 w-4" />
          导出
        </EditorToolbarButton>
        <EditorToolbarButton onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          删除
        </EditorToolbarButton>
        <EditorSaveButton onClick={onSave}>
          <Save className="h-4 w-4" />
          保存
        </EditorSaveButton>
      </div>

      {jsonMode ? (
        <div className="space-y-3">
          <Textarea
            className="min-h-[420px] font-mono text-xs"
            value={jsonText || JSON.stringify(normalizeRuleGroup(group), null, 2)}
            onChange={(e) => onJsonTextChange(e.target.value)}
          />
          <Button onClick={onLoadJson}>应用 JSON</Button>
        </div>
      ) : (
        <RuleGroupForm group={group} config={config} onChange={onGroupChange} />
      )}
    </>
  );
}
