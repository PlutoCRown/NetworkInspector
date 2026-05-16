/** 扩展是否仍可用（重载后旧 content script 会失效） */
export function isExtensionContextValid(): boolean {
  try {
    return typeof chrome !== "undefined" && Boolean(chrome.runtime?.id);
  } catch {
    return false;
  }
}

export function isContextInvalidatedError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes("Extension context invalidated") ||
    msg.includes("Receiving end does not exist") ||
    msg.includes("Could not establish connection")
  );
}

/** 向 background 发消息；扩展已失效时静默失败，不抛出未捕获异常 */
export function safeRuntimeSendMessage(
  message: unknown,
  onInvalidated?: () => void,
): void {
  if (!isExtensionContextValid()) {
    onInvalidated?.();
    return;
  }
  try {
    chrome.runtime.sendMessage(message, () => {
      const err = chrome.runtime.lastError;
      if (err && isContextInvalidatedError(err)) {
        onInvalidated?.();
      }
    });
  } catch (err) {
    if (isContextInvalidatedError(err)) {
      onInvalidated?.();
    }
  }
}
