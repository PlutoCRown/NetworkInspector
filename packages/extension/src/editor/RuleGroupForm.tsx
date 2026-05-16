import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createEmptyRule } from "@/shared/create-empty-rule";
import { normalizeRuleGroup } from "@/shared/normalize-rule-group";
import type { AppConfig, Rule, RuleGroup } from "@/shared/types";
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

  const addRule = () => {
    const url = "/api/";
    onChange(
      normalizeRuleGroup({
        ...g,
        rules: [...g.rules, createEmptyRule(url)],
      }),
    );
  };

  const removeRule = (index: number) => {
    if (g.rules.length <= 1) return;
    onChange(
      normalizeRuleGroup({
        ...g,
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
      {g.rules.map((rule, i) => (
        <RuleBlockSection
          key={rule.id}
          rule={rule}
          index={i}
          canRemove={g.rules.length > 1}
          config={config}
          onUpdate={(patch) => updateRule(i, patch)}
          onRemove={() => removeRule(i)}
        />
      ))}
      <Button type="button" variant="outline" className="w-full" onClick={addRule}>
        <Plus className="mr-2 h-4 w-4" />
        新增规则
      </Button>
    </div>
  );
}
