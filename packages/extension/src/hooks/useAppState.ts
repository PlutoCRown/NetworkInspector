import { useCallback, useEffect, useState } from "react";
import type { Message } from "@/shared/messages";
import type { AppState } from "@/shared/types";

export function useAppState() {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await chrome.runtime.sendMessage({ type: "GET_STATE" } satisfies Message);
    setState(res as AppState);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const listener = (msg: Message) => {
      if (msg.type === "STATE_UPDATED") setState(msg.state);
      if (msg.type === "CAPTURE_ADDED") {
        setState((prev) =>
          prev ? { ...prev, captures: msg.captures } : prev,
        );
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [refresh]);

  return { state, loading, refresh };
}

export async function sendMessage<T = unknown>(msg: Message): Promise<T> {
  return chrome.runtime.sendMessage(msg) as Promise<T>;
}
