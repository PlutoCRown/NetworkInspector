import { useSyncExternalStore } from "react";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  dismissToast,
  getConfirmRequest,
  getToasts,
  resolveConfirm,
  subscribeMessage,
  type MessageKind,
  type ToastItem,
} from "@/lib/message";

const KIND_STYLES: Record<
  MessageKind,
  { icon: typeof Info; className: string }
> = {
  success: {
    icon: CheckCircle2,
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
  },
  error: {
    icon: XCircle,
    className: "border-destructive/40 bg-destructive/10 text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-100",
  },
  info: {
    icon: Info,
    className: "border-border bg-muted/80 text-foreground",
  },
};

function ToastCard({ item }: { item: ToastItem }) {
  const { icon: Icon, className } = KIND_STYLES[item.kind];
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-2 rounded-lg border px-3 py-2.5 text-sm shadow-lg backdrop-blur-sm",
        className,
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p className="min-w-0 flex-1 whitespace-pre-wrap leading-snug">{item.text}</p>
      <button
        type="button"
        className="shrink-0 rounded-sm opacity-70 hover:opacity-100"
        onClick={() => dismissToast(item.id)}
        aria-label="关闭"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

function ConfirmLayer() {
  const req = useSyncExternalStore(subscribeMessage, getConfirmRequest, () => null);
  if (!req) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="取消"
        onClick={() => resolveConfirm(false)}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="message-confirm-title"
        className="relative z-10 w-full max-w-md rounded-lg border bg-background p-5 shadow-xl"
      >
        <h2 id="message-confirm-title" className="text-base font-semibold">
          {req.title}
        </h2>
        {req.description && (
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
            {req.description}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => resolveConfirm(false)}
          >
            {req.cancelLabel ?? "取消"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant={req.destructive ? "destructive" : "default"}
            onClick={() => resolveConfirm(true)}
          >
            {req.confirmLabel ?? "确定"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Toaster() {
  const items = useSyncExternalStore(subscribeMessage, getToasts, () => []);

  if (items.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed right-4 top-4 z-[90] flex w-[min(100vw-2rem,24rem)] flex-col gap-2"
      aria-live="polite"
    >
      {items.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>
  );
}

export function MessageHost({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
      <ConfirmLayer />
    </>
  );
}
