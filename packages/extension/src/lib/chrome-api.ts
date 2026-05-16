/**
 * 在 popup 按钮的同步点击回调中调用（不要用 async onClick）。
 * 使用 callback 版 tabs.query，避免 await 导致用户手势失效。
 */
export function openSidePanel(onDone?: () => void): void {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const done = () => onDone?.();

    if (tab?.id != null) {
      chrome.sidePanel.open({ tabId: tab.id }).then(done).catch(done);
      return;
    }
    if (tab?.windowId != null) {
      chrome.sidePanel.open({ windowId: tab.windowId }).then(done).catch(done);
      return;
    }
    done();
  });
}

export function openEditorTab(
  ruleGroupId?: string,
  options?: { newGroup?: boolean; view?: "processors" | "alias" | "about" },
): void {
  const base = chrome.runtime.getURL("src/editor/index.html");
  let url = base;
  if (options?.view) url = `${base}?view=${options.view}`;
  else if (options?.newGroup) url = `${base}?new=1`;
  else if (ruleGroupId) url = `${base}?id=${encodeURIComponent(ruleGroupId)}`;
  void chrome.tabs.create({ url });
}
