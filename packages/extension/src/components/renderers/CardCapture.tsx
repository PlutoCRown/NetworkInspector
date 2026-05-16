import { useRef, useState } from "react";
import type { CaptureRecord } from "@/shared/types";
import { cn, formatTime, formatValue } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const hoverRef = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const title = formatValue(record.data.title);
  const desc = hasContent(record.data.desc) ? formatValue(record.data.desc) : null;
  const expand = record.data.expand;
  const popover = record.data.popover;
  const tone = record.highlight?.tone;

  const showExpand = hasContent(expand);
  const showPopover = hasContent(popover);

  const openPopover = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    hoverRef.current = true;
    setPopoverOpen(true);
  };

  const scheduleClosePopover = () => {
    hoverRef.current = false;
    closeTimer.current = setTimeout(() => {
      if (!hoverRef.current) setPopoverOpen(false);
    }, 120);
  };

  const card = (
    <Card
      className={cn(
        "overflow-hidden transition-shadow",
        showPopover && "hover:shadow-md",
      )}
      onMouseEnter={showPopover ? openPopover : undefined}
      onMouseLeave={showPopover ? scheduleClosePopover : undefined}
    >
      <CardHeader
        className={cn("cursor-pointer pb-2", !showExpand && "cursor-default")}
        onClick={() => {
          if (showExpand) setExpanded((v) => !v);
        }}
        role={showExpand ? "button" : undefined}
        tabIndex={showExpand ? 0 : undefined}
        onKeyDown={(e) => {
          if (showExpand && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setExpanded((v) => !v);
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
    </Card>
  );

  if (!showPopover) return card;

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverAnchor asChild>{card}</PopoverAnchor>
      <PopoverContent
        className="max-h-64 w-80 overflow-auto p-3"
        side="right"
        align="start"
        onMouseEnter={openPopover}
        onMouseLeave={scheduleClosePopover}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <pre className="whitespace-pre-wrap break-all text-xs">{formatValue(popover)}</pre>
      </PopoverContent>
    </Popover>
  );
}
