import { useRef, useState } from "react";
import { sendMessage } from "@/hooks/useAppState";
import {
  type AppBundleStats,
  type AppExportBundle,
  type ImportBundleOptions,
  parseImportJson,
} from "@/shared/app/bundle";
import {
  formatImportWarnings,
  getMissingFieldRefs,
  hasImportWarnings,
} from "@/shared/field/refs";
import type { AppConfig, RuleGroup } from "@/shared/types";

export function useImportJson(
  currentConfig: AppConfig,
  onDone?: () => void | Promise<void>,
) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [bundleDialog, setBundleDialog] = useState<AppBundleStats | null>(null);
  const [pendingBundle, setPendingBundle] = useState<AppExportBundle | null>(null);

  const openFilePicker = () => fileRef.current?.click();

  const warnMissingRefs = (group: RuleGroup): boolean => {
    const missing = getMissingFieldRefs([group], currentConfig);
    if (!hasImportWarnings(missing)) return true;
    return confirm(
      `规则组引用了当前配置中不存在的 ID，相关功能可能无效：\n\n${formatImportWarnings(missing)}\n\n是否仍要导入？`,
    );
  };

  const importRuleGroup = async (group: RuleGroup) => {
    if (!warnMissingRefs(group)) return;
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
    pendingBundle,
    openFilePicker,
    handleFile,
    confirmBundleImport,
    cancelBundleImport,
  };
}
