import type { CaptureRecord } from "@/shared/types";
import { formatValue } from "@/lib/utils";

interface DividerCaptureProps {
  record: CaptureRecord;
}

export function DividerCapture({ record }: DividerCaptureProps) {
  const title = formatValue(record.data.title);

  return (
    <div className="my-2 flex items-center gap-2 text-[11px] text-muted-foreground">
      <span className="h-px flex-1 bg-border" />
      <span className="shrink-0 px-1 font-medium">{title}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
