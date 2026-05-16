import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { CollapsiblePanel } from "@/components/CollapsiblePanel";
import { SidebarNewButton } from "@/components/ui/preset-buttons";

interface SidebarSubListProps {
  open: boolean;
  newLabel: string;
  onNew: () => void;
  children: ReactNode;
}

export function SidebarSubList({ open, newLabel, onNew, children }: SidebarSubListProps) {
  return (
    <CollapsiblePanel open={open} className="ml-2 border-l border-border/60 pl-1">
      <ul className="max-h-[min(280px,40vh)] space-y-0.5 overflow-y-auto py-1">{children}</ul>
      <div className="border-t border-border/60 p-1.5">
        <SidebarNewButton onClick={onNew}>
          <Plus className="size-3.5" />
          {newLabel}
        </SidebarNewButton>
      </div>
    </CollapsiblePanel>
  );
}
