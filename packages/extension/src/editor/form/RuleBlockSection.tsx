import { Trash2 } from "lucide-react";
import { FieldRefInput } from "@/components/FieldRefInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DEFAULT_SPLIT_NAME,
  getSplitNames,
  ruleHasSplits,
} from "@/shared/field/expr";
import {
  defaultFieldsForRenderer,
  getRendererDefinition,
  RENDERER_DEFINITIONS,
} from "@/shared/render/registry";
import type { AppConfig, RendererId, Rule } from "@/shared/types";

interface RuleBlockSectionProps {
  rule: Rule;
  index: number;
  canRemove: boolean;
  config: AppConfig;
  onUpdate: (patch: Partial<Rule>) => void;
  onRemove: () => void;
}

export function RuleBlockSection({
  rule,
  index,
  canRemove,
  config,
  onUpdate,
  onRemove,
}: RuleBlockSectionProps) {
  const rid = getRendererDefinition(rule.renderer)?.id ?? "card";
  const rendererDef = getRendererDefinition(rid);
  const fieldKeys = rendererDef?.fields ?? ["title"];
  const aggregateEnabled = ruleHasSplits(rule);
  const splitNames = getSplitNames(rule);
  const primarySplit = splitNames[0] ?? DEFAULT_SPLIT_NAME;

  const onRendererChange = (renderer: RendererId) => {
    onUpdate({
      renderer,
      fields: defaultFieldsForRenderer(renderer, aggregateEnabled, primarySplit),
    });
  };

  const setAggregateEnabled = (enabled: boolean) => {
    if (enabled) {
      onUpdate({
        splits: { [DEFAULT_SPLIT_NAME]: "[source:json]items" },
        fields: defaultFieldsForRenderer(rid, true, DEFAULT_SPLIT_NAME),
      });
    } else {
      onUpdate({
        splits: undefined,
        fields: defaultFieldsForRenderer(rid, false),
      });
    }
  };

  const updateSplitExpr = (expr: string) => {
    onUpdate({
      splits: { ...rule.splits, [primarySplit]: expr },
    });
  };

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-medium">规则 {index + 1}</h2>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          disabled={!canRemove}
          onClick={onRemove}
          aria-label="删除规则"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <Label>捕获 URL 正则</Label>
        <Input
          className="mt-1 font-mono text-xs"
          value={rule.url}
          placeholder="/v1/events"
          onChange={(e) => onUpdate({ url: e.target.value })}
        />
      </div>

      <div>
        <Label>Renderer</Label>
        <select
          className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={rid}
          onChange={(e) => onRendererChange(e.target.value as RendererId)}
        >
          {RENDERER_DEFINITIONS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
        {rendererDef && (
          <p className="mt-1 text-[10px] text-muted-foreground">
            字段：{rendererDef.fields.join(", ") || "无"}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2">
        <div>
          <Label htmlFor={`agg-${rule.id}`}>聚合模式</Label>
          <p className="text-[10px] text-muted-foreground">
            将数组拆成多条卡片展示
          </p>
        </div>
        <Switch
          id={`agg-${rule.id}`}
          checked={aggregateEnabled}
          onCheckedChange={setAggregateEnabled}
        />
      </div>

      {aggregateEnabled && (
        <div className="space-y-1.5 rounded-md bg-muted/40 p-3">
          <Label>拆分数据源 ({primarySplit})</Label>
          <p className="text-[10px] text-muted-foreground">
            解析为数组的路径，字段中用 [aggregate:{primarySplit}] 读取每一项
          </p>
          <FieldRefInput
            mode="split-source"
            config={config}
            value={rule.splits?.[primarySplit] ?? ""}
            onChange={updateSplitExpr}
            placeholder="items"
          />
        </div>
      )}

      {fieldKeys.map((field) => (
        <div key={field}>
          <Label className="mb-1 block">
            {field}
            <span className="ml-1 font-normal text-muted-foreground">
              {aggregateEnabled
                ? "（aggregate / 来源 + Processor / Alias）"
                : "（来源 + Processor / Alias）"}
            </span>
          </Label>
          <FieldRefInput
            mode="field"
            splitNames={aggregateEnabled ? splitNames : []}
            config={config}
            value={rule.fields[field] ?? ""}
            onChange={(v) =>
              onUpdate({
                fields: { ...rule.fields, [field]: v },
              })
            }
            placeholder={aggregateEnabled ? "action" : "event.name"}
          />
        </div>
      ))}
    </section>
  );
}
