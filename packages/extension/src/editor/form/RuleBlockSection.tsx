import { Label } from "@/components/ui/label";
import { FieldRefInput } from "@/components/FieldRefInput";
import { hasAggregateSource } from "@/shared/field-expr";
import {
  defaultFieldsForRenderer,
  getRendererDefinition,
  RENDERER_DEFINITIONS,
} from "@/shared/renderer-registry";
import type { AppConfig, RendererId, Rule } from "@/shared/types";

interface RuleBlockSectionProps {
  rule: Rule;
  index: number;
  captureUrl: string;
  config: AppConfig;
  onUpdate: (patch: Partial<Rule>) => void;
}

export function RuleBlockSection({
  rule,
  index,
  captureUrl,
  config,
  onUpdate,
}: RuleBlockSectionProps) {
  const rid = getRendererDefinition(rule.renderer)?.id ?? "card";
  const rendererDef = getRendererDefinition(rid);
  const fieldKeys = rendererDef?.fields ?? ["title"];
  const ruleHasAggregate = hasAggregateSource(rule.aggregateFrom ?? "");

  const onRendererChange = (renderer: RendererId) => {
    const hasAgg = hasAggregateSource(rule.aggregateFrom ?? "");
    onUpdate({
      renderer,
      fields: defaultFieldsForRenderer(renderer, hasAgg),
    });
  };

  return (
    <section className="space-y-3 rounded-lg border p-4">
      <div className="min-w-0">
        <h2 className="font-medium">规则 {index + 1}</h2>
        <code className="text-[10px] text-muted-foreground">{captureUrl}</code>
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

      <div className="space-y-1.5 rounded-md bg-muted/40 p-3">
        <Label>聚合数据源</Label>
        <p className="text-[10px] text-muted-foreground">
          用 + 选择 json / response 等来源并填路径，再添加 Aggregate 标签打散数组
        </p>
        <FieldRefInput
          mode="aggregate-source"
          config={config}
          value={rule.aggregateFrom ?? ""}
          onChange={(aggregateFrom) => {
            const isAggregate = hasAggregateSource(aggregateFrom);
            onUpdate({
              aggregateFrom: isAggregate ? aggregateFrom : undefined,
              fields: defaultFieldsForRenderer(rid, isAggregate),
            });
          }}
          placeholder="data"
        />
      </div>

      {fieldKeys.map((field) => (
        <div key={field}>
          <Label className="mb-1 block">
            {field}
            <span className="ml-1 font-normal text-muted-foreground">
              {ruleHasAggregate
                ? "（Aggregate / 来源 + Processor / Alias）"
                : "（来源 + Processor / Alias）"}
            </span>
          </Label>
          <FieldRefInput
            mode="field"
            ruleHasAggregate={ruleHasAggregate}
            config={config}
            value={rule.fields[field] ?? ""}
            onChange={(v) =>
              onUpdate({
                fields: { ...rule.fields, [field]: v },
              })
            }
            placeholder={ruleHasAggregate ? "name" : "event.name"}
          />
        </div>
      ))}
    </section>
  );
}
