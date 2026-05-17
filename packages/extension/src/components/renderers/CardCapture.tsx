import { useState } from "react";
import type { CaptureRecord } from "@/shared/types";
import { cn, formatTime, formatValue } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const toneClass: Record<string, string> = {
  danger: "text-red-600 dark:text-red-400",
  success: "text-green-600 dark:text-green-400",
};

function hasContent(value: unknown): boolean {
  const s = formatValue(value);
  return s !== "—" && s !== "";
}

interface CardCaptureProps {
  record: CaptureRecord;
  /** 嵌套在 WarningCapture 内，不再套一层 Card 边框 */
  embedded?: boolean;
}

export function CardCapture({ record, embedded = false }: CardCaptureProps) {
  const [expanded, setExpanded] = useState(false);

  const title = formatValue(record.data.title);
  const desc = hasContent(record.data.desc) ? formatValue(record.data.desc) : null;
  const expand = record.data.expand;
  const tone = record.highlight?.tone;

  const showExpand = hasContent(expand);

  const toggleExpanded = () => {
    if (showExpand) setExpanded((v) => !v);
  };

  const shellClass = embedded ? "overflow-hidden" : undefined;

  const inner = (
    <>
      <CardHeader
        className={cn("pb-2", showExpand && "cursor-pointer")}
        onClick={toggleExpanded}
        role={showExpand ? "button" : undefined}
        tabIndex={showExpand ? 0 : undefined}
        onKeyDown={(e) => {
          if (showExpand && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            toggleExpanded();
          }
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className={cn("text-sm", tone && toneClass[tone])}>
              {title}
            </CardTitle>
            {desc && (
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            )}
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {formatTime(record.timestamp)}
          </span>
        </div>
      </CardHeader>

      {showExpand && (
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <CardContent className="border-t border-dashed pt-0">
              <pre className="mt-2 whitespace-pre-wrap break-all rounded-md bg-muted p-2 text-xs">
                {formatValue(expand)}
              </pre>
            </CardContent>
          </div>
        </div>
      )}
    </>
  );

  if (embedded) {
    return <div className={shellClass}>{inner}</div>;
  }

  return <Card className="overflow-hidden">{inner}</Card>;
}
