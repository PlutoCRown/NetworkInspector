import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CollapsiblePanelProps {
  open: boolean;
  children: ReactNode;
  className?: string;
}

/** 高度展开/收起动画（grid 0fr ↔ 1fr） */
export function CollapsiblePanel({ open, children, className }: CollapsiblePanelProps) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows] duration-200 ease-out",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      )}
    >
      <div className={cn("min-h-0 overflow-hidden", className)}>{children}</div>
    </div>
  );
}
