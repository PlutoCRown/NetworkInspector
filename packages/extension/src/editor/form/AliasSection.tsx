import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AppConfig } from "@/shared/types";

interface AliasSectionProps {
  config: AppConfig;
  onChange: (config: AppConfig) => void;
}

export function AliasSection({ config, onChange }: AliasSectionProps) {
  const aliasIds = Object.keys(config.aliasMaps);

  const addAliasMap = () => {
    const id = `alias-${Date.now()}`;
    onChange({
      ...config,
      aliasMaps: { ...config.aliasMaps, [id]: {} },
    });
  };

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <div>
        <h2 className="font-medium">Alias</h2>
        <p className="text-xs text-muted-foreground">
          创建映射表后，在字段表达式中使用 Alias:表名 标签
        </p>
      </div>

      <div className="space-y-2 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <Label>Alias 映射表</Label>
          <Button type="button" size="sm" variant="outline" onClick={addAliasMap}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {aliasIds.length === 0 ? (
          <p className="text-xs text-muted-foreground">暂无 Alias 组</p>
        ) : (
          <ul className="space-y-3">
            {aliasIds.map((mapId) => (
              <li key={mapId} className="space-y-1 rounded-md border p-2">
                <div className="flex items-center gap-2">
                  <Input
                    className="h-8 text-xs"
                    value={mapId}
                    onChange={(e) => {
                      const maps = { ...config.aliasMaps };
                      maps[e.target.value] = maps[mapId]!;
                      delete maps[mapId];
                      onChange({ ...config, aliasMaps: maps });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const maps = { ...config.aliasMaps };
                      delete maps[mapId];
                      onChange({ ...config, aliasMaps: maps });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  className="font-mono text-xs"
                  rows={4}
                  value={JSON.stringify(config.aliasMaps[mapId], null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value) as Record<string, string>;
                      onChange({
                        ...config,
                        aliasMaps: { ...config.aliasMaps, [mapId]: parsed },
                      });
                    } catch {
                      /* 编辑中 */
                    }
                  }}
                  placeholder='{"page_view":"页面浏览"}'
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
