import { useRef, useState } from "react";
import { sendMessage } from "@/hooks/useAppState";
import {
  type AppBundleStats,
  type ImportBundleOptions,
  parseImportJson,
} from "@/shared/app-bundle";
import type { RuleGroup } from "@/shared/types";

export function useImportJson(onDone?: () => void | Promise<void>) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [bundleDialog, setBundleDialog] = useState<AppBundleStats | null>(null);
  const [pendingBundle, setPendingBundle] = useState<import("@/shared/app-bundle").AppExportBundle | null>(
    null,
  );

  const openFilePicker = () => fileRef.current?.click();

  const importRuleGroup = async (group: RuleGroup) => {
    const res = await sendMessage<{ ok: boolean }>({
      type: "IMPORT_RULE_GROUP",
      group,
      overwrite: true,
    });
    if (!res.ok) {
      alert("导入失败");
      return;
    }
    await onDone?.();
    alert("规则组已导入");
  };

  const handleFile = async (file: File) => {
    const text = await file.text();
    const detected = parseImportJson(text);

    if (detected.kind === "invalid") {
      alert("无效的 JSON 文件");
      return;
    }

    if (detected.kind === "rule-group") {
      await importRuleGroup(detected.group);
      return;
    }

    setPendingBundle(detected.bundle);
    setBundleDialog(detected.stats);
  };

  const confirmBundleImport = async (options: ImportBundleOptions) => {
    if (!pendingBundle) return;
    const res = await sendMessage<{ ok: boolean }>({
      type: "IMPORT_APP_BUNDLE",
      bundle: pendingBundle,
      options,
    });
    setBundleDialog(null);
    setPendingBundle(null);
    if (!res.ok) {
      alert("导入失败");
      return;
    }
    await onDone?.();
    alert("已导入所选内容");
  };

  const cancelBundleImport = () => {
    setBundleDialog(null);
    setPendingBundle(null);
  };

  return {
    fileRef,
    bundleDialog,
    openFilePicker,
    handleFile,
    confirmBundleImport,
    cancelBundleImport,
  };
}
