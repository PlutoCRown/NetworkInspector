import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import type { CaptureRecord } from "@/shared/types";
import { cn, formatTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorCaptureProps {
  record: CaptureRecord;
}

export function ErrorCapture({ record }: ErrorCaptureProps) {
  const [expanded, setExpanded] = useState(false);
  const err = record.error!;

  return (
    <Card
      className={cn(
        "overflow-hidden border-destructive/40 bg-destructive/5 dark:bg-destructive/10",
      )}
    >
      <CardHeader
        className="cursor-pointer pb-2"
        onClick={() => setExpanded((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
      >
        <div className="flex items-start gap-2">
          <ChevronDown
            className={cn(
              "mt-0.5 size-4 shrink-0 text-destructive transition-transform",
              !expanded && "-rotate-90",
            )}
          />
          <div className="min-w-0 flex-1">
            <CardTitle className="text-sm font-medium text-destructive">
              {err.summary}
            </CardTitle>
            <p className="mt-1 truncate text-[10px] text-muted-foreground">
              {record.requestUrl}
            </p>
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {formatTime(record.timestamp)}
          </span>
        </div>
      </CardHeader>

      <CollapsiblePanel open={expanded}>
        <CardContent className="border-t border-destructive/20 pt-0">
          <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted/80 p-2 font-mono text-[11px] leading-relaxed text-foreground">
            {err.detail}
          </pre>
        </CardContent>
      </CollapsiblePanel>
    </Card>
  );
}
