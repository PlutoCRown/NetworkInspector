import { createEmptyRule } from "@/shared/create-empty-rule";
import { normalizeRuleGroup } from "@/shared/normalize-rule-group";
import type { AppConfig, Rule, RuleGroup } from "@/shared/types";
import { CaptureUrlsSection } from "./form/CaptureUrlsSection";
import { GroupMetaSection } from "./form/GroupMetaSection";
import { RuleBlockSection } from "./form/RuleBlockSection";

interface RuleGroupFormProps {
  group: RuleGroup;
  config: AppConfig;
  onChange: (group: RuleGroup) => void;
}

export function RuleGroupForm({ group, config, onChange }: RuleGroupFormProps) {
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
        rules: [...g.rules, createEmptyRule(url)],
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <GroupMetaSection group={g} onChange={setGroup} />
      <CaptureUrlsSection
        group={g}
        onAdd={addCaptureRule}
        onUpdateUrl={updateCaptureUrl}
        onRemove={removeCaptureRule}
      />
      {g.rules.map((rule, i) => (
        <RuleBlockSection
          key={rule.id}
          rule={rule}
          index={i}
          captureUrl={g.capture[i] ?? ""}
          config={config}
          onUpdate={(patch) => updateRule(i, patch)}
        />
      ))}
    </div>
  );
}
