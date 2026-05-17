import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { cn } from "@/lib/utils";

export interface ImportBundleItem {
  id: string;
  label: string;
  hint?: string;
}

interface ImportBundleCategorySectionProps {
  title: string;
  items: ImportBundleItem[];
  selected: Set<string>;
  onSelectedChange: (next: Set<string>) => void;
  expanded: boolean;
  onExpandedChange: (open: boolean) => void;
  emptyLabel?: string;
  children?: ReactNode;
}

function categoryCheckState(
  selected: Set<string>,
  allIds: string[],
): "checked" | "indeterminate" | "unchecked" {
  if (allIds.length === 0) return "unchecked";
  const n = allIds.filter((id) => selected.has(id)).length;
  if (n === 0) return "unchecked";
  if (n === allIds.length) return "checked";
  return "indeterminate";
}

export function ImportBundleCategorySection({
  title,
  items,
  selected,
  onSelectedChange,
  expanded,
  onExpandedChange,
  emptyLabel = "（无）",
  children,
}: ImportBundleCategorySectionProps) {
  const allIds = items.map((i) => i.id);
  const state = categoryCheckState(selected, allIds);
  const selectedCount = allIds.filter((id) => selected.has(id)).length;
  const disabled = items.length === 0;

  const setAll = (on: boolean) => {
    const next = new Set(selected);
    for (const id of allIds) {
      if (on) next.add(id);
      else next.delete(id);
    }
    onSelectedChange(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectedChange(next);
  };

  return (
    <div className="rounded-md border border-border/80">
      <div className="flex items-center gap-1 px-2 py-1.5">
        <button
          type="button"
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md hover:bg-accent",
            disabled && "pointer-events-none opacity-40",
          )}
          aria-expanded={expanded}
          aria-label={expanded ? "收起" : "展开"}
          onClick={() => onExpandedChange(!expanded)}
        >
          <ChevronDown
            className={cn("size-3.5 transition-transform", !expanded && "-rotate-90")}
          />
        </button>
        <input
          type="checkbox"
          className="shrink-0"
          disabled={disabled}
          checked={state === "checked"}
          ref={(el) => {
            if (el) el.indeterminate = state === "indeterminate";
          }}
          onChange={(e) => setAll(e.target.checked)}
        />
        <button
          type="button"
          className="min-w-0 flex-1 text-left text-sm"
          disabled={disabled}
          onClick={() => !disabled && onExpandedChange(!expanded)}
        >
          {title}
          <span className="ml-1 text-xs text-muted-foreground">
            {disabled ? emptyLabel : `（${selectedCount}/${items.length}）`}
          </span>
        </button>
      </div>
    <CollapsiblePanel open={expanded && !disabled} className="border-t border-border/60">
        <ul className="max-h-36 space-y-0.5 overflow-y-auto px-2 py-1.5">
          {items.map((item) => (
            <li key={item.id}>
              <label className="flex cursor-pointer items-start gap-2 rounded px-1 py-1 hover:bg-accent/50">
                <input
                  type="checkbox"
                  className="mt-0.5 shrink-0"
                  checked={selected.has(item.id)}
                  onChange={() => toggleOne(item.id)}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">{item.label}</span>
                  {item.hint && (
                    <span className="block truncate font-mono text-[10px] text-muted-foreground">
                      {item.hint}
                    </span>
                  )}
                </span>
              </label>
            </li>
          ))}
        </ul>
        {children ? (
          <div className="border-t border-border/60 px-2 py-1.5">{children}</div>
        ) : null}
      </CollapsiblePanel>
    </div>
  );
}
