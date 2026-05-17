import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import type { CaptureRecord } from "@/shared/types";
import { getRendererDefinition } from "@/shared/render/registry";
import { cn } from "@/lib/utils";
import { CardCapture } from "./CardCapture";
import { DividerCapture } from "./DividerCapture";

interface WarningCaptureProps {
  record: CaptureRecord;
}

export function WarningCapture({ record }: WarningCaptureProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const warn = record.warning!;

  const body =
    getRendererDefinition(record.renderer)?.id === "divider" ? (
      <DividerCapture record={record} embedded />
    ) : (
      <CardCapture record={record} embedded />
    );

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-amber-300/80",
        "bg-card shadow-sm dark:border-amber-700/60",
      )}
    >
      <button
        type="button"
        className={cn(
          "flex w-full items-start gap-2 border-b border-amber-200/70 px-3 py-2 text-left",
          "bg-amber-50/90 hover:bg-amber-100/90 dark:border-amber-800/50",
          "dark:bg-amber-950/40 dark:hover:bg-amber-950/60",
        )}
        onClick={() => setDetailOpen((v) => !v)}
        aria-expanded={detailOpen}
      >
        <ChevronDown
          className={cn(
            "mt-0.5 size-4 shrink-0 text-amber-700 transition-transform dark:text-amber-400",
            !detailOpen && "-rotate-90",
          )}
        />
        <span className="min-w-0 flex-1 text-sm font-medium text-amber-900 dark:text-amber-100">
          {warn.summary}
        </span>
      </button>

      <CollapsiblePanel open={detailOpen}>
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all border-b border-amber-200/70 bg-muted/50 px-3 py-2 font-mono text-[11px] leading-relaxed text-foreground dark:border-amber-800/50">
          {warn.detail}
        </pre>
      </CollapsiblePanel>

      {body}
    </div>
  );
}
