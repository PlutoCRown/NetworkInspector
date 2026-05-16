import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME, APP_VERSION } from "@/shared/app-meta";
import { buildAppExport } from "@/shared/app-bundle";
import type { AppState } from "@/shared/types";

interface AboutSectionProps {
  state: AppState;
}

export function AboutSection({ state }: AboutSectionProps) {
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

      <div className="rounded-lg border p-4">
        <h3 className="text-sm font-medium">导出全部数据</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          导出包含所有规则组、Processor 与 Alias 的 JSON，可用于备份或迁移。
        </p>
        <Button className="mt-3" variant="outline" onClick={exportAll}>
          <Download className="h-4 w-4" />
          导出全量 JSON
        </Button>
      </div>
    </section>
  );
}
