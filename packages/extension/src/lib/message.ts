export type MessageKind = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  kind: MessageKind;
  text: string;
}

export interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}

interface ConfirmRequest extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

const DEFAULT_DURATION_MS = 3200;

let toasts: ToastItem[] = [];
let confirmRequest: ConfirmRequest | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

function pushToast(kind: MessageKind, text: string, durationMs = DEFAULT_DURATION_MS) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  toasts = [...toasts, { id, kind, text }];
  emit();
  window.setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, durationMs);
}

export function subscribeMessage(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToasts(): readonly ToastItem[] {
  return toasts;
}

export function getConfirmRequest(): ConfirmRequest | null {
  return confirmRequest;
}

export function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function resolveConfirm(value: boolean) {
  const req = confirmRequest;
  confirmRequest = null;
  emit();
  req?.resolve(value);
}

export const message = {
  success(text: string) {
    pushToast("success", text);
  },
  error(text: string) {
    pushToast("error", text, 4500);
  },
  warning(text: string) {
    pushToast("warning", text, 4000);
  },
  info(text: string) {
    pushToast("info", text);
  },
  confirm(options: ConfirmOptions): Promise<boolean> {
    return new Promise((resolve) => {
      confirmRequest = { ...options, resolve };
      emit();
    });
  },
};
