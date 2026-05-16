import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  isProcessorBodyValid,
  isProcessorIdValid,
} from "@/shared/app/validate-config";
import type { AppConfig } from "@/shared/types";
import { cn } from "@/lib/utils";

const invalidFieldClass =
  "border-destructive focus-visible:ring-destructive aria-invalid:border-destructive";

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
  if (!processorId || !(processorId in config.customProcessors)) {
    return (
      <p className="text-sm text-muted-foreground">
        在左侧选择处理器，或新建一个。示例（time / date / datetime）可直接编辑或删除。
      </p>
    );
  }

  const body = config.customProcessors[processorId] ?? "";
  const idInvalid = !isProcessorIdValid(processorId);
  const bodyInvalid = !isProcessorBodyValid(body);

  const updateId = (nextId: string) => {
    if (nextId === processorId) return;
    const trimmed = nextId.trim();
    if (!trimmed) return;
    const next = { ...config.customProcessors };
    delete next[processorId];
    next[trimmed] = body;
    onChange({ ...config, customProcessors: next });
    onIdChange(trimmed);
  };

  const updateBody = (nextBody: string) => {
    onChange({
      ...config,
      customProcessors: {
        ...config.customProcessors,
        [processorId]: nextBody,
      },
    });
  };

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <div>
        <h2 className="font-medium">处理器</h2>
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
            aria-label="删除处理器"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
        <Input
          className={cn("font-mono text-xs", idInvalid && invalidFieldClass)}
          value={processorId}
          aria-invalid={idInvalid || undefined}
          onChange={(e) => updateId(e.target.value)}
        />
        {idInvalid && (
          <p className="text-[10px] text-destructive">ID 不能为空</p>
        )}

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">函数体</Label>
          <Textarea
            className={cn("min-h-[200px] font-mono text-xs", bodyInvalid && invalidFieldClass)}
            value={body}
            aria-invalid={bodyInvalid || undefined}
            onChange={(e) => updateBody(e.target.value)}
            placeholder="(value) => String(value)"
          />
          {bodyInvalid && (
            <p className="text-[10px] text-destructive">
              函数体不能为空，且须为可执行的 (value) =&gt; … 表达式；修正后再保存
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
