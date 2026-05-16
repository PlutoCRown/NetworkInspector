import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SubListItem({
  active,
  onClick,
  primary,
  secondary,
  leading,
}: {
  active: boolean;
  onClick: () => void;
  primary: string;
  secondary?: string;
  leading?: ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
          secondary ? "flex-col items-stretch gap-0.5" : "",
          active
            ? "bg-accent font-medium text-accent-foreground"
            : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {leading}
          <span className={cn("truncate", !secondary && "flex-1")}>{primary}</span>
        </div>
        {secondary && (
          <span className="truncate font-mono text-[10px] opacity-70">{secondary}</span>
        )}
      </button>
    </li>
  );
}
