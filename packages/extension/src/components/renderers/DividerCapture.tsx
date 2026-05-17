import type { CaptureRecord } from "@/shared/types";
import { formatValue } from "@/lib/utils";

interface DividerCaptureProps {
  record: CaptureRecord;
  embedded?: boolean;
}

export function DividerCapture({ record, embedded = false }: DividerCaptureProps) {
  const title = formatValue(record.data.title);

  return (
    <div
      className={
        embedded
          ? "flex items-center gap-2 px-3 py-2 text-[11px] text-muted-foreground"
          : "my-2 flex items-center gap-2 text-[11px] text-muted-foreground"
      }
    >
      <span className="h-px flex-1 bg-border" />
      <span className="shrink-0 px-1 font-medium">{title}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
