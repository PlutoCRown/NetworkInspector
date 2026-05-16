import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type RemovableTagTone =
  | "default"
  | "source"
  | "aggregate"
  | "processor"
  | "alias";

const toneClass: Record<RemovableTagTone, string> = {
  default: "bg-muted text-foreground",
  source: "bg-primary/10 text-primary",
  aggregate: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
  processor: "bg-blue-500/10 text-blue-800 dark:text-blue-200",
  alias: "bg-violet-500/10 text-violet-800 dark:text-violet-200",
};

export function RemovableTag({
  label,
  tone = "default",
  onRemove,
}: {
  label: string;
  tone?: RemovableTagTone;
  onRemove: () => void;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium",
        toneClass[tone],
      )}
    >
      <span className="truncate">{label}</span>
      <button
        type="button"
        className="shrink-0 rounded-sm opacity-70 hover:opacity-100"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onRemove}
        aria-label={`移除 ${label}`}
      >
        <X className="size-3" />
      </button>
    </span>
  );
}
