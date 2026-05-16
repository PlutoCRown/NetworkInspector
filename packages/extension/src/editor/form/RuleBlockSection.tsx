import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FieldRefInput } from "@/components/FieldRefInput";
import {
  defaultFieldsForRenderer,
  RENDERER_DEFINITIONS,
  resolveRendererId,
} from "@/shared/renderer-registry";
import type { Rule } from "@/shared/types";

interface RuleBlockSectionProps {
  rule: Rule;
  index: number;
  captureUrl: string;
  onUpdate: (patch: Partial<Rule>) => void;
}

export function RuleBlockSection({
  rule,
  index,
  captureUrl,
  onUpdate,
}: RuleBlockSectionProps) {
  const rid = resolveRendererId(rule.renderer);
  const rendererDef = RENDERER_DEFINITIONS.find((r) => r.id === rid);
  const fieldKeys = rendererDef?.fields ?? ["title"];

  const onRendererChange = (renderer: string) => {
    const resolved = resolveRendererId(renderer);
    onUpdate({
      renderer: resolved,
      fields: defaultFieldsForRenderer(resolved, Boolean(rule.aggregate)),
    });
  };

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-medium">规则 {index + 1}</h2>
          <code className="text-[10px] text-muted-foreground">{captureUrl}</code>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor={`agg-${rule.id}`} className="text-xs whitespace-nowrap">
            聚合请求
          </Label>
          <Switch
            id={`agg-${rule.id}`}
            checked={Boolean(rule.aggregate)}
            onCheckedChange={(aggregate) =>
              onUpdate({
                aggregate,
                aggregateFrom: aggregate ? rule.aggregateFrom ?? "json:" : undefined,
                fields: defaultFieldsForRenderer(rid, aggregate),
              })
            }
          />
        </div>
      </div>

      <div>
        <Label>Renderer</Label>
        <select
          className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={rid}
          onChange={(e) => onRendererChange(e.target.value)}
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

      {rule.aggregate && (
        <div className="space-y-1.5 rounded-md bg-muted/40 p-3">
          <Label>聚合数据源（须为 JSON 数组）</Label>
          <FieldRefInput
            value={rule.aggregateFrom ?? ""}
            onChange={(aggregateFrom) => onUpdate({ aggregateFrom })}
            placeholder="json:events"
          />
          <p className="text-[10px] text-muted-foreground">
            选择 json 来源并指向数组路径；下方字段可用 aggregate 读数组项，或其它来源读整包请求
          </p>
        </div>
      )}

      {fieldKeys.map((field) => (
        <div key={field}>
          <Label className="mb-1 block">
            {field}
            <span className="ml-1 font-normal text-muted-foreground">
              {rule.aggregate ? "（来源:路径，aggregate=数组项）" : "（来源:路径）"}
            </span>
          </Label>
          <FieldRefInput
            allowAggregate={Boolean(rule.aggregate)}
            value={rule.fields[field] ?? ""}
            onChange={(v) =>
              onUpdate({
                fields: { ...rule.fields, [field]: v },
              })
            }
            placeholder={
              rule.aggregate ? "aggregate:event 或 json:headers" : "json:event.name"
            }
          />
        </div>
      ))}
    </section>
  );
}
