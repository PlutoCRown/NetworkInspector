import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { RuleGroup } from "@/shared/types";

interface GroupMetaSectionProps {
  group: RuleGroup;
  onChange: (patch: Partial<RuleGroup>) => void;
}

export function GroupMetaSection({ group, onChange }: GroupMetaSectionProps) {
  return (
    <section className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <Label htmlFor="name">名称</Label>
        <div className="flex items-center gap-2">
          <Label htmlFor="enabled">启用捕获</Label>
          <Switch
            id="enabled"
            checked={group.enabled}
            onCheckedChange={(enabled) => onChange({ enabled })}
          />
        </div>
      </div>
      <Input
        id="name"
        value={group.name}
        onChange={(e) => onChange({ name: e.target.value })}
      />
      <div>
        <Label>站点正则（每行一条）</Label>
        <Textarea
          className="mt-1 font-mono text-xs"
          rows={3}
          value={group.sites.join("\n")}
          onChange={(e) =>
            onChange({ sites: e.target.value.split("\n").filter(Boolean) })
          }
        />
      </div>
    </section>
  );
}
