import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AppConfig } from "@/shared/types";

interface ProcessorSectionProps {
  config: AppConfig;
  processorId: string | null;
  onChange: (config: AppConfig) => void;
  onRemove: (id: string) => void;
  onIdChange: (id: string) => void;
}

export function ProcessorSection({
  config,
  processorId,
  onChange,
  onRemove,
  onIdChange,
}: ProcessorSectionProps) {
  if (!processorId || !config.customProcessors[processorId]) {
    return (
      <p className="text-sm text-muted-foreground">
        在左侧选择 Processor，或新建一个。示例（time / date / datetime）可直接编辑或删除。
      </p>
    );
  }

  const updateId = (nextId: string) => {
    if (!nextId.trim() || nextId === processorId) return;
    const body = config.customProcessors[processorId]!;
    const next = { ...config.customProcessors };
    delete next[processorId];
    next[nextId] = body;
    onChange({ ...config, customProcessors: next });
    onIdChange(nextId);
  };

  const updateBody = (body: string) => {
    onChange({
      ...config,
      customProcessors: {
        ...config.customProcessors,
        [processorId]: body,
      },
    });
  };

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <div>
        <h2 className="font-medium">Processor</h2>
        <p className="text-xs text-muted-foreground">
          编写 JS 函数体，签名为 <code className="text-foreground">(value) =&gt; 任意</code>
          ，字段中使用 <code className="text-foreground">[processor:ID]</code>
        </p>
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-[10px] text-muted-foreground">ID</Label>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => onRemove(processorId)}
            aria-label="删除 Processor"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
        <Input
          className="font-mono text-xs"
          value={processorId}
          onChange={(e) => updateId(e.target.value)}
        />

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">函数体</Label>
          <Textarea
            className="min-h-[200px] font-mono text-xs"
            value={config.customProcessors[processorId]}
            onChange={(e) => updateBody(e.target.value)}
            placeholder="(value) => String(value)"
          />
        </div>
      </div>
    </section>
  );
}
