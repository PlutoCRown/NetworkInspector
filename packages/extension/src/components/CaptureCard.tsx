import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { CaptureRecord } from "@/shared/types";
import { cn, formatTime, formatValue } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const toneClass: Record<string, string> = {
  danger: "text-red-600",
  success: "text-green-600",
};

interface CaptureCardProps {
  record: CaptureRecord;
}

export function CaptureCard({ record }: CaptureCardProps) {
  const [expanded, setExpanded] = useState(false);
  const title = formatValue(record.data.title);
  const desc = formatValue(record.data.desc);
  const expend = record.data.expend;
  const popover = record.data.popover;
  const tone = record.highlight?.tone;
  const renderer = record.renderer;

  if (renderer === "title-popover") {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Card className="cursor-default transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle
                  className={cn(
                    "text-sm",
                    tone && toneClass[tone],
                  )}
                >
                  {title}
                </CardTitle>
                <span className="shrink-0 text-[10px] text-muted-foreground">
                  {formatTime(record.timestamp)}
                </span>
              </div>
              <p className="truncate text-[10px] text-muted-foreground">{record.requestUrl}</p>
            </CardHeader>
          </Card>
        </PopoverTrigger>
        <PopoverContent className="max-h-64 overflow-auto">
          <pre className="whitespace-pre-wrap break-all text-xs">{formatValue(popover)}</pre>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <button
          type="button"
          className="flex w-full items-start gap-2 text-left"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? (
            <ChevronDown className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <CardTitle
              className={cn("text-sm", tone && toneClass[tone])}
            >
              {title}
            </CardTitle>
            {desc !== "—" && (
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
            )}
            <p className="mt-1 truncate text-[10px] text-muted-foreground">
              {record.requestUrl}
            </p>
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {formatTime(record.timestamp)}
          </span>
        </button>
      </CardHeader>
      {expanded && (
        <CardContent>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted p-2 text-xs">
            {formatValue(expend)}
          </pre>
        </CardContent>
      )}
    </Card>
  );
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
