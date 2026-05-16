import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FieldRefInput } from "@/components/FieldRefInput";
import { normalizeRuleGroup } from "@/shared/normalize-rule-group";
import {
  defaultFieldsForRenderer,
  RENDERER_DEFINITIONS,
  resolveRendererId,
} from "@/shared/renderer-registry";
import type { Rule, RuleGroup } from "@/shared/types";

function emptyRuleForUrl(url: string): Rule {
  const renderer = "card";
  return {
    id: `rule-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    url,
    renderer,
    aggregate: false,
    fields: defaultFieldsForRenderer(renderer, false),
  };
}

interface RuleGroupFormProps {
  group: RuleGroup;
  onChange: (group: RuleGroup) => void;
}

export function RuleGroupForm({ group, onChange }: RuleGroupFormProps) {
  const g = normalizeRuleGroup(group);

  const setGroup = (patch: Partial<RuleGroup>) => {
    onChange(normalizeRuleGroup({ ...g, ...patch }));
  };

  const updateCaptureUrl = (index: number, url: string) => {
    const capture = [...g.capture];
    capture[index] = url;
    const rules = g.rules.map((r, i) => (i === index ? { ...r, url } : r));
    onChange(normalizeRuleGroup({ ...g, capture, rules }));
  };

  const addCaptureRule = () => {
    const url = "/api/";
    onChange(
      normalizeRuleGroup({
        ...g,
        capture: [...g.capture, url],
        rules: [...g.rules, emptyRuleForUrl(url)],
      }),
    );
  };

  const removeCaptureRule = (index: number) => {
    if (g.capture.length <= 1) return;
    onChange(
      normalizeRuleGroup({
        ...g,
        capture: g.capture.filter((_, i) => i !== index),
        rules: g.rules.filter((_, i) => i !== index),
      }),
    );
  };

  const updateRule = (index: number, patch: Partial<Rule>) => {
    const rules = [...g.rules];
    rules[index] = { ...rules[index]!, ...patch };
    onChange(normalizeRuleGroup({ ...g, rules }));
  };

  const onRendererChange = (index: number, renderer: string) => {
    const rid = resolveRendererId(renderer);
    const fields = defaultFieldsForRenderer(rid, Boolean(g.rules[index]?.aggregate));
    updateRule(index, { renderer: rid, fields });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="name">名称</Label>
          <div className="flex items-center gap-2">
            <Label htmlFor="enabled">启用捕获</Label>
            <Switch
              id="enabled"
              checked={g.enabled}
              onCheckedChange={(enabled) => setGroup({ enabled })}
            />
          </div>
        </div>
        <Input
          id="name"
          value={g.name}
          onChange={(e) => setGroup({ name: e.target.value })}
        />
        <div>
          <Label>站点正则（每行一条）</Label>
          <Textarea
            className="mt-1 font-mono text-xs"
            rows={3}
            value={g.sites.join("\n")}
            onChange={(e) =>
              setGroup({ sites: e.target.value.split("\n").filter(Boolean) })
            }
          />
        </div>
      </section>

      <section className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <Label>捕获 URL 正则</Label>
          <Button type="button" variant="outline" size="sm" onClick={addCaptureRule}>
            <Plus className="h-4 w-4" />
            添加
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground">
          每条 URL 对应下方一个提取规则块
        </p>
        <ul className="space-y-2">
          {g.capture.map((url, i) => (
            <li key={g.rules[i]?.id ?? i} className="flex gap-2">
              <Input
                className="font-mono text-xs"
                value={url}
                placeholder="/v1/events"
                onChange={(e) => updateCaptureUrl(i, e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={g.capture.length <= 1}
                onClick={() => removeCaptureRule(i)}
                aria-label="删除"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </section>

      {g.rules.map((rule, i) => {
        const rid = resolveRendererId(rule.renderer);
        const rendererDef = RENDERER_DEFINITIONS.find((r) => r.id === rid);
        const fieldKeys = rendererDef?.fields ?? ["title"];

        return (
          <section key={rule.id} className="space-y-3 rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <h2 className="font-medium">规则 {i + 1}</h2>
                <code className="text-[10px] text-muted-foreground">{g.capture[i]}</code>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor={`agg-${rule.id}`} className="text-xs whitespace-nowrap">
                    聚合请求
                  </Label>
                  <Switch
                    id={`agg-${rule.id}`}
                    checked={Boolean(rule.aggregate)}
                    onCheckedChange={(aggregate) =>
                      updateRule(i, {
                        aggregate,
                        aggregateFrom: aggregate ? rule.aggregateFrom ?? "json:" : undefined,
                        fields: defaultFieldsForRenderer(rid, aggregate),
                      })
                    }
                  />
                </div>
              </div>
            </div>

            <div>
              <Label>Renderer</Label>
              <select
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={rid}
                onChange={(e) => onRendererChange(i, e.target.value)}
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
                  onChange={(aggregateFrom) => updateRule(i, { aggregateFrom })}
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
                    updateRule(i, {
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
      })}
    </div>
  );
}
