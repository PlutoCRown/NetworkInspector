import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AliasMapGroup, AppConfig } from "@/shared/types";

interface AliasSectionProps {
  config: AppConfig;
  onChange: (config: AppConfig) => void;
}

function newMapkey(): string {
  return `alias-${Date.now().toString(36)}`;
}

export function AliasSection({ config, onChange }: AliasSectionProps) {
  const entries = Object.entries(config.aliasMaps);

  const addAliasMap = () => {
    const mapkey = newMapkey();
    onChange({
      ...config,
      aliasMaps: {
        ...config.aliasMaps,
        [mapkey]: { name: "新 Alias 组", mappings: {} },
      },
    });
  };

  const updateGroup = (mapkey: string, patch: Partial<AliasMapGroup>) => {
    const group = config.aliasMaps[mapkey];
    if (!group) return;
    onChange({
      ...config,
      aliasMaps: { ...config.aliasMaps, [mapkey]: { ...group, ...patch } },
    });
  };

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <div>
        <h2 className="font-medium">Alias</h2>
        <p className="text-xs text-muted-foreground">
          填写组名即可；ID 自动生成，字段中使用 <code className="text-foreground">[alias:ID]</code>{" "}
          引用
        </p>
      </div>

      <div className="space-y-2 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <Label>Alias 映射表</Label>
          <Button type="button" size="sm" variant="outline" onClick={addAliasMap}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {entries.length === 0 ? (
          <p className="text-xs text-muted-foreground">暂无 Alias 组</p>
        ) : (
          <ul className="space-y-3">
            {entries.map(([mapkey, group]) => (
              <li key={mapkey} className="space-y-2 rounded-md border p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <Label className="text-[10px] text-muted-foreground">组名</Label>
                    <Input
                      className="h-8 text-xs"
                      value={group.name}
                      placeholder="埋点名"
                      onChange={(e) => updateGroup(mapkey, { name: e.target.value })}
                    />
                    <p className="text-[10px] text-muted-foreground">
                      ID <code className="font-mono text-foreground">{mapkey}</code>
                      {" · "}
                      引用 <code className="font-mono text-foreground">[alias:{mapkey}]</code>
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => {
                      const maps = { ...config.aliasMaps };
                      delete maps[mapkey];
                      onChange({ ...config, aliasMaps: maps });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">映射 JSON</Label>
                  <Textarea
                    className="font-mono text-xs"
                    rows={4}
                    value={JSON.stringify(group.mappings, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value) as Record<string, string>;
                        updateGroup(mapkey, { mappings: parsed });
                      } catch {
                        /* 编辑中 */
                      }
                    }}
                    placeholder='{"page_view":"页面浏览"}'
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
