import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface MenuItemButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  mono?: boolean;
  hint?: string;
}

/** 下拉 / 补全菜单项 */
export function MenuItemButton({
  active,
  mono = true,
  hint,
  className,
  children,
  ...props
}: MenuItemButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full flex-col px-3 py-1.5 text-left text-xs hover:bg-accent",
        mono && "font-mono",
        active && "bg-accent",
        className,
      )}
      {...props}
    >
      {children}
      {hint && <span className="text-[10px] font-sans text-muted-foreground">{hint}</span>}
    </button>
  );
}
