import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BUILTIN_PROCESSORS } from "@/shared/processors";
import type { AppConfig } from "@/shared/types";

interface ProcessorSectionProps {
  config: AppConfig;
  onChange: (config: AppConfig) => void;
}

export function ProcessorSection({ config, onChange }: ProcessorSectionProps) {
  const customIds = Object.keys(config.customProcessors);

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
    <section className="mx-auto max-w-2xl space-y-4">
      <div>
        <h2 className="font-medium">Processor</h2>
        <p className="text-xs text-muted-foreground">
          内置 Processor 可直接在字段中使用；自定义函数签名为 (value) =&gt; 任意
        </p>
      </div>

      <div className="space-y-2 rounded-lg border p-4">
        <Label>内置</Label>
        <ul className="text-xs text-muted-foreground">
          {BUILTIN_PROCESSORS.map((p) => (
            <li key={p.id}>
              <code className="text-foreground">{p.id}</code> — {p.description}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2 rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <Label>自定义 Processor</Label>
          <Button type="button" size="sm" variant="outline" onClick={addProcessor}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {customIds.length === 0 ? (
          <p className="text-xs text-muted-foreground">暂无自定义 Processor</p>
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
    </section>
  );
}
