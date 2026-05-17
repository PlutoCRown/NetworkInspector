import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ImportBundleCategorySection,
  type ImportBundleItem,
} from "@/components/ImportBundleCategorySection";
import type { AppExportBundle, ImportBundleOptions } from "@/shared/app/bundle";
import { hasBundleImportSelection } from "@/shared/app/bundle";
import {
  configAvailableAfterImport,
  formatImportWarnings,
  getMissingFieldRefs,
  hasImportWarnings,
} from "@/shared/field/refs";
import type { AppConfig } from "@/shared/types";

interface ImportBundleDialogProps {
  bundle: AppExportBundle;
  currentConfig: AppConfig;
  onCancel: () => void;
  onConfirm: (options: ImportBundleOptions) => void;
}

function initialSelected(ids: string[]): Set<string> {
  return new Set(ids);
}

export function ImportBundleDialog({
  bundle,
  currentConfig,
  onCancel,
  onConfirm,
}: ImportBundleDialogProps) {
  const ruleGroupItems: ImportBundleItem[] = useMemo(
    () =>
      bundle.ruleGroups.map((g) => ({
        id: g.id,
        label: g.name,
        hint: g.id,
      })),
    [bundle.ruleGroups],
  );

  const processorItems: ImportBundleItem[] = useMemo(
    () =>
      Object.keys(bundle.config.customProcessors).map((id) => ({
        id,
        label: id,
      })),
    [bundle.config.customProcessors],
  );

  const aliasItems: ImportBundleItem[] = useMemo(
    () =>
      Object.entries(bundle.config.aliasMaps).map(([mapkey, group]) => ({
        id: mapkey,
        label: group.name || mapkey,
        hint: mapkey,
      })),
    [bundle.config.aliasMaps],
  );

  const [selectedRuleGroups, setSelectedRuleGroups] = useState(() =>
    initialSelected(ruleGroupItems.map((i) => i.id)),
  );
  const [selectedProcessors, setSelectedProcessors] = useState(() =>
    initialSelected(processorItems.map((i) => i.id)),
  );
  const [selectedAliases, setSelectedAliases] = useState(() =>
    initialSelected(aliasItems.map((i) => i.id)),
  );

  const [expandedRuleGroups, setExpandedRuleGroups] = useState(ruleGroupItems.length > 0);
  const [expandedProcessors, setExpandedProcessors] = useState(false);
  const [expandedAliases, setExpandedAliases] = useState(false);
  const [overwriteRuleGroups, setOverwriteRuleGroups] = useState(true);

  const importOptions = useMemo(
    (): ImportBundleOptions => ({
      ruleGroupIds: [...selectedRuleGroups],
      processorIds: [...selectedProcessors],
      aliasMapKeys: [...selectedAliases],
      overwriteRuleGroups,
    }),
    [selectedRuleGroups, selectedProcessors, selectedAliases, overwriteRuleGroups],
  );

  const warnings = useMemo(() => {
    if (selectedRuleGroups.size === 0) return null;
    const groupsToImport = bundle.ruleGroups.filter((g) => selectedRuleGroups.has(g.id));
    const available = configAvailableAfterImport(currentConfig, bundle.config, {
      processorIds: [...selectedProcessors],
      aliasMapKeys: [...selectedAliases],
    });
    const missing = getMissingFieldRefs(groupsToImport, available);
    return hasImportWarnings(missing) ? missing : null;
  }, [
    selectedRuleGroups,
    selectedProcessors,
    selectedAliases,
    bundle,
    currentConfig,
  ]);

  const canConfirm = hasBundleImportSelection(importOptions);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="flex max-h-[min(90vh,640px)] w-full max-w-lg flex-col rounded-lg border bg-background shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-bundle-title"
      >
        <div className="shrink-0 border-b px-4 py-3">
          <h2 id="import-bundle-title" className="text-base font-semibold">
            导入配置
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            展开各类别，勾选要导入的项（可仅导入部分规则组 / Processor / Alias）
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
          <ImportBundleCategorySection
            title="规则组"
            items={ruleGroupItems}
            selected={selectedRuleGroups}
            onSelectedChange={setSelectedRuleGroups}
            expanded={expandedRuleGroups}
            onExpandedChange={setExpandedRuleGroups}
          >
            <label className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                className="mt-0.5"
                checked={overwriteRuleGroups}
                onChange={(e) => setOverwriteRuleGroups(e.target.checked)}
              />
              覆盖同名规则组
            </label>
          </ImportBundleCategorySection>

          <ImportBundleCategorySection
            title="Processor"
            items={processorItems}
            selected={selectedProcessors}
            onSelectedChange={setSelectedProcessors}
            expanded={expandedProcessors}
            onExpandedChange={setExpandedProcessors}
          />

          <ImportBundleCategorySection
            title="Alias 组"
            items={aliasItems}
            selected={selectedAliases}
            onSelectedChange={setSelectedAliases}
            expanded={expandedAliases}
            onExpandedChange={setExpandedAliases}
          />
        </div>

        {warnings && (
          <div className="shrink-0 border-t px-4 py-2">
            <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
              <p className="font-medium">引用缺失警告</p>
              <p className="mt-1 whitespace-pre-wrap">
                已选规则组引用了以下 ID，按当前勾选导入后仍不存在：
              </p>
              <pre className="mt-1 font-mono text-[11px]">{formatImportWarnings(warnings)}</pre>
              <p className="mt-1">请勾选对应 Processor / Alias，或稍后在设置中补全。</p>
            </div>
          </div>
        )}

        <div className="flex shrink-0 justify-end gap-2 border-t px-4 py-3">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            取消
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!canConfirm}
            onClick={() => onConfirm(importOptions)}
          >
            导入
          </Button>
        </div>
      </div>
    </div>
  );
}
