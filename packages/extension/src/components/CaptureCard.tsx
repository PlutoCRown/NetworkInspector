import type { CaptureRecord } from "@/shared/types";
import { resolveRendererId } from "@/shared/renderer-registry";
import { Badge } from "@/components/ui/badge";
import { CardCapture } from "./renderers/CardCapture";
import { DividerCapture } from "./renderers/DividerCapture";

interface CaptureCardProps {
  record: CaptureRecord;
}

export function CaptureCard({ record }: CaptureCardProps) {
  const rendererId = resolveRendererId(record.renderer);
  if (rendererId === "divider") {
    return <DividerCapture record={record} />;
  }
  return <CardCapture record={record} />;
}

export function CaptureListHeader({
  count,
  paused,
  onClear,
}: {
  count: number;
  paused: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
      <div className="flex items-center gap-2">
        <span className="font-medium">捕获</span>
        <Badge variant="secondary">{count}</Badge>
        {paused && <Badge variant="outline">已暂停</Badge>}
      </div>
      <button
        type="button"
        className="text-xs text-muted-foreground hover:text-foreground"
        onClick={onClear}
      >
        清空
      </button>
    </div>
  );
}
