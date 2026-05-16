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

export function AliasSection({ config, onChange }: AliasSectionProps) {
  const entries = Object.entries(config.aliasMaps);

  const addAliasMap = () => {
    const mapkey = `map-${Date.now()}`;
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

  const renameMapkey = (oldKey: string, newKey: string) => {
    const trimmed = newKey.trim();
    if (!trimmed || trimmed === oldKey) return;
    if (config.aliasMaps[trimmed]) {
      alert("该 Key 已存在");
      return;
    }
    const maps = { ...config.aliasMaps };
    maps[trimmed] = maps[oldKey]!;
    delete maps[oldKey];
    onChange({ ...config, aliasMaps: maps });
  };

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <div>
        <h2 className="font-medium">Alias</h2>
        <p className="text-xs text-muted-foreground">
          填写组名与 Key；字段表达式中使用{" "}
          <code className="text-foreground">[alias:Key]</code> 引用（Key 为下方 Key 字段）
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
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">组名</Label>
                    <Input
                      className="h-8 text-xs"
                      value={group.name}
                      placeholder="埋点名"
                      onChange={(e) => updateGroup(mapkey, { name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Key（mapkey）</Label>
                    <Input
                      className="h-8 font-mono text-xs"
                      defaultValue={mapkey}
                      key={mapkey}
                      placeholder="event-alias"
                      onBlur={(e) => renameMapkey(mapkey, e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] text-muted-foreground">
                    引用：<code>[alias:{mapkey}]</code>
                  </p>
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
