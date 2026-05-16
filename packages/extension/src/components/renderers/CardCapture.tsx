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
}

export function CardCapture({ record }: CardCaptureProps) {
  const [expanded, setExpanded] = useState(false);

  const title = formatValue(record.data.title);
  const desc = hasContent(record.data.desc) ? formatValue(record.data.desc) : null;
  const expand = record.data.expand;
  const popover = record.data.popover;
  const tone = record.highlight?.tone;

  const showExpand = hasContent(expand);
  const showPopover = hasContent(popover);
  const expandable = showExpand || showPopover;

  const toggleExpanded = () => {
    if (expandable) setExpanded((v) => !v);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className={cn("pb-2", expandable && "cursor-pointer")}
        onClick={toggleExpanded}
        role={expandable ? "button" : undefined}
        tabIndex={expandable ? 0 : undefined}
        onKeyDown={(e) => {
          if (expandable && (e.key === "Enter" || e.key === " ")) {
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
            <p className="mt-1 truncate text-[10px] text-muted-foreground">
              {record.requestUrl}
            </p>
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {formatTime(record.timestamp)}
          </span>
        </div>
      </CardHeader>

      {expandable && (
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <CardContent className="space-y-2 border-t border-dashed pt-0">
              {showExpand && (
                <pre className="mt-2 whitespace-pre-wrap break-all rounded-md bg-muted p-2 text-xs">
                  {formatValue(expand)}
                </pre>
              )}
              {showPopover && (
                <pre className="whitespace-pre-wrap break-all rounded-md bg-muted p-2 text-xs">
                  {formatValue(popover)}
                </pre>
              )}
            </CardContent>
          </div>
        </div>
      )}
    </Card>
  );
}
