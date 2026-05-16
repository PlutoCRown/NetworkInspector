import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BUILTIN_PROCESSORS } from "@/shared/processors";
import type { AppConfig } from "@/shared/types";

interface GlobalConfigSectionProps {
  config: AppConfig;
  onChange: (config: AppConfig) => void;
}

export function GlobalConfigSection({ config, onChange }: GlobalConfigSectionProps) {
  const aliasIds = Object.keys(config.aliasMaps);
  const customIds = Object.keys(config.customProcessors);

  const addAliasMap = () => {
    const id = `alias-${Date.now()}`;
    onChange({
      ...config,
      aliasMaps: { ...config.aliasMaps, [id]: {} },
    });
  };

  const addProcessor = () => {
    const id = `fn-${Date.now()}`;
    onChange({
      ...config,
      customProcessors: {
        ...config.customProcessors,
        [id]: "(value) => value",
      },
    });
  };

  return (
    <section className="space-y-6 rounded-lg border p-4">
      <div>
        <h2 className="font-medium">全局配置</h2>
        <p className="text-xs text-muted-foreground">
          Alias 表与自定义 Processor 可在字段输入框中通过标签引用
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>内置 Processor</Label>
        </div>
        <ul className="text-xs text-muted-foreground">
          {BUILTIN_PROCESSORS.map((p) => (
            <li key={p.id}>
              <code className="text-foreground">{p.id}</code> — {p.description}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>自定义 Processor</Label>
          <Button type="button" size="sm" variant="outline" onClick={addProcessor}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {customIds.length === 0 ? (
          <p className="text-xs text-muted-foreground">暂无；函数签名：(value) =&gt; 任意</p>
        ) : (
          <ul className="space-y-3">
            {customIds.map((id) => (
              <li key={id} className="space-y-1 rounded-md border p-2">
                <div className="flex items-center gap-2">
                  <Input
                    className="h-8 font-mono text-xs"
                    value={id}
                    onChange={(e) => {
                      const next = { ...config.customProcessors };
                      const body = next[id]!;
                      delete next[id];
                      next[e.target.value] = body;
                      onChange({ ...config, customProcessors: next });
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const next = { ...config.customProcessors };
                      delete next[id];
                      onChange({ ...config, customProcessors: next });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Textarea
                  className="font-mono text-xs"
                  rows={3}
                  value={config.customProcessors[id]}
                  onChange={(e) =>
                    onChange({
                      ...config,
                      customProcessors: {
                        ...config.customProcessors,
                        [id]: e.target.value,
                      },
                    })
                  }
                  placeholder="(value) => String(value)"
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Alias 映射表</Label>
          <Button type="button" size="sm" variant="outline" onClick={addAliasMap}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {aliasIds.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            创建映射表后，在字段中使用 Alias:表名 标签
          </p>
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
