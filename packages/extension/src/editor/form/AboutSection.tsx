import { Download, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_VERSION } from "@/shared/app/meta";
import { buildAppExport } from "@/shared/app/bundle";
import type { useImportJson } from "@/hooks/useImportJson";
import type { AppState } from "@/shared/types";

interface AboutSectionProps {
  state: AppState;
  importJson: ReturnType<typeof useImportJson>;
}

export function AboutSection({ state, importJson }: AboutSectionProps) {
  const exportAll = () => {
    const bundle = buildAppExport(state);
    const blob = new Blob([JSON.stringify(bundle, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `network-inspector-export-${Date.now()}.json`;
    a.click();
  };

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="font-medium">About</h2>
        <p className="text-xs text-muted-foreground">NetworkInspector 扩展信息</p>
      </div>

      <dl className="space-y-2 rounded-lg border p-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">名称</dt>
          <dd className="font-medium">{APP_NAME}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">版本</dt>
          <dd className="font-mono">{APP_VERSION}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">规则组</dt>
          <dd>{state.ruleGroups.length} 个</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Processor</dt>
          <dd>{Object.keys(state.config.customProcessors).length} 个自定义</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Alias 组</dt>
          <dd>{Object.keys(state.config.aliasMaps).length} 个</dd>
        </div>
      </dl>

      <div className="rounded-lg border p-4 space-y-3">
        <div>
          <h3 className="text-sm font-medium">备份与迁移</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            导出或导入包含规则组、Processor、Alias 的全量 JSON；导入时可勾选需要的内容。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportAll}>
            <Download className="h-4 w-4" />
            导出全部配置
          </Button>
          <Button variant="outline" onClick={importJson.openFilePicker}>
            <FileUp className="h-4 w-4" />
            导入全部配置
          </Button>
        </div>
      </div>
    </section>
  );
}
