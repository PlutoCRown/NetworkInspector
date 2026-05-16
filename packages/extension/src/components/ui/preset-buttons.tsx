import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** 工具栏 / 弹窗标题栏：ghost 图标按钮 32×32 */
export function ToolbarIconButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8 shrink-0", className)}
      {...props}
    />
  );
}

/** 表单行内删除等：ghost 图标按钮 32×32 */
export function RowIconButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8 shrink-0", className)}
      {...props}
    />
  );
}

/** 侧栏列表底部「新建」 */
export function SidebarNewButton({ className, children, ...props }: ButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("h-7 w-full justify-start px-2 text-xs", className)}
      {...props}
    >
      {children}
    </Button>
  );
}

/** 编辑器主区顶栏：outline + sm */
export function EditorToolbarButton({ className, ...props }: ButtonProps) {
  return <Button variant="outline" size="sm" className={className} {...props} />;
}

/** 编辑器主区顶栏：primary + sm */
export function EditorSaveButton({ className, ...props }: ButtonProps) {
  return <Button size="sm" className={className} {...props} />;
}
