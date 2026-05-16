import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RuleGroup } from "@/shared/types";

interface CaptureUrlsSectionProps {
  group: RuleGroup;
  onAdd: () => void;
  onUpdateUrl: (index: number, url: string) => void;
  onRemove: (index: number) => void;
}

export function CaptureUrlsSection({
  group,
  onAdd,
  onUpdateUrl,
  onRemove,
}: CaptureUrlsSectionProps) {
  return (
    <section className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <Label>捕获 URL 正则</Label>
        <Button type="button" variant="outline" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          添加
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground">
        每条 URL 对应下方一个提取规则块
      </p>
      <ul className="space-y-2">
        {group.capture.map((url, i) => (
          <li key={group.rules[i]?.id ?? i} className="flex gap-2">
            <Input
              className="font-mono text-xs"
              value={url}
              placeholder="/v1/events"
              onChange={(e) => onUpdateUrl(i, e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={group.capture.length <= 1}
              onClick={() => onRemove(i)}
              aria-label="删除"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}
