import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import type { AppExportBundle, AppBundleStats, ImportBundleOptions } from "@/shared/app/bundle";
import {
  configAvailableAfterImport,
  formatImportWarnings,
  getMissingFieldRefs,
  hasImportWarnings,
} from "@/shared/field/refs";
import type { AppConfig } from "@/shared/types";

interface ImportBundleDialogProps {
  stats: AppBundleStats;
  bundle: AppExportBundle;
  currentConfig: AppConfig;
  onCancel: () => void;
  onConfirm: (options: ImportBundleOptions) => void;
}

export function ImportBundleDialog({
  stats,
  bundle,
  currentConfig,
  onCancel,
  onConfirm,
}: ImportBundleDialogProps) {
  const [ruleGroups, setRuleGroups] = useState(stats.ruleGroupCount > 0);
  const [processors, setProcessors] = useState(stats.processorCount > 0);
  const [aliasMaps, setAliasMaps] = useState(stats.aliasMapCount > 0);
  const [overwriteRuleGroups, setOverwriteRuleGroups] = useState(true);

  const warnings = useMemo(() => {
    if (!ruleGroups || stats.ruleGroupCount === 0) return null;
    const available = configAvailableAfterImport(currentConfig, bundle.config, {
      processors,
      aliasMaps,
    });
    const missing = getMissingFieldRefs(bundle.ruleGroups, available);
    return hasImportWarnings(missing) ? missing : null;
  }, [ruleGroups, processors, aliasMaps, stats.ruleGroupCount, bundle, currentConfig]);

  const canConfirm =
    (ruleGroups && stats.ruleGroupCount > 0) ||
    (processors && stats.processorCount > 0) ||
    (aliasMaps && stats.aliasMapCount > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-lg border bg-background p-4 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-bundle-title"
      >
        <h2 id="import-bundle-title" className="text-base font-semibold">
          导入全量配置
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          检测到完整导出包，请选择要导入的内容：
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <input
              id="import-rule-groups"
              type="checkbox"
              className="mt-0.5"
              checked={ruleGroups}
              disabled={stats.ruleGroupCount === 0}
              onChange={(e) => setRuleGroups(e.target.checked)}
            />
            <label htmlFor="import-rule-groups" className="cursor-pointer">
              规则组
              <span className="ml-1 text-muted-foreground">（{stats.ruleGroupCount} 个）</span>
            </label>
          </li>
          <li className="flex items-start gap-2">
            <input
              id="import-processors"
              type="checkbox"
              className="mt-0.5"
              checked={processors}
              disabled={stats.processorCount === 0}
              onChange={(e) => setProcessors(e.target.checked)}
            />
            <label htmlFor="import-processors" className="cursor-pointer">
              Processor
              <span className="ml-1 text-muted-foreground">（{stats.processorCount} 个）</span>
            </label>
          </li>
          <li className="flex items-start gap-2">
            <input
              id="import-alias"
              type="checkbox"
              className="mt-0.5"
              checked={aliasMaps}
              disabled={stats.aliasMapCount === 0}
              onChange={(e) => setAliasMaps(e.target.checked)}
            />
            <label htmlFor="import-alias" className="cursor-pointer">
              Alias 组
              <span className="ml-1 text-muted-foreground">（{stats.aliasMapCount} 个）</span>
            </label>
          </li>
          {ruleGroups && stats.ruleGroupCount > 0 && (
            <li className="ml-6 flex items-start gap-2">
              <input
                id="import-overwrite"
                type="checkbox"
                className="mt-0.5"
                checked={overwriteRuleGroups}
                onChange={(e) => setOverwriteRuleGroups(e.target.checked)}
              />
              <label htmlFor="import-overwrite" className="cursor-pointer text-xs text-muted-foreground">
                覆盖同名规则组
              </label>
            </li>
          )}
        </ul>

        {warnings && (
          <div className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
            <p className="font-medium">引用缺失警告</p>
            <p className="mt-1 whitespace-pre-wrap">
              规则组引用了以下 ID，但按当前勾选导入后仍不存在，相关功能可能无效：
            </p>
            <pre className="mt-1 font-mono text-[11px]">{formatImportWarnings(warnings)}</pre>
            <p className="mt-1">请勾选导入对应 Processor / Alias，或稍后在设置中补全。</p>
          </div>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            取消
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!canConfirm}
            onClick={() =>
              onConfirm({ ruleGroups, processors, aliasMaps, overwriteRuleGroups })
            }
          >
            导入
          </Button>
        </div>
      </div>
    </div>
  );
}
