import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { message } from "@/lib/message";
import { cn } from "@/lib/utils";
import type { AliasMapGroup, AppConfig } from "@/shared/types";

const invalidFieldClass =
  "border-destructive focus-visible:ring-destructive aria-invalid:border-destructive";

export function newAliasMapkey(): string {
  return `alias-${Date.now().toString(36)}`;
}

type MappingRow = { id: string; match: string; replace: string };

function mappingsToRows(mappings: Record<string, string>): MappingRow[] {
  const rows = Object.entries(mappings).map(([match, replace]) => ({
    id: `row-${match}`,
    match,
    replace,
  }));
  rows.push({ id: "__new__", match: "", replace: "" });
  return rows;
}

function rowsToMappings(rows: MappingRow[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const row of rows) {
    const key = row.match.trim();
    if (!key) continue;
    out[key] = row.replace;
  }
  return out;
}

interface AliasMapGroupCardProps {
  mapkey: string;
  group: AliasMapGroup;
  onUpdate: (patch: Partial<AliasMapGroup>) => void;
  onRemove: () => void;
}

function AliasMapGroupCard({ mapkey, group, onUpdate, onRemove }: AliasMapGroupCardProps) {
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonDraft, setJsonDraft] = useState("");
  const [rows, setRows] = useState<MappingRow[]>(() => mappingsToRows(group.mappings));

  useEffect(() => {
    if (!jsonMode) {
      setRows(mappingsToRows(group.mappings));
    }
  }, [group.mappings, jsonMode]);

  const commitRows = (nextRows: MappingRow[]) => {
    setRows(nextRows);
    onUpdate({ mappings: rowsToMappings(nextRows) });
  };

  const updateRow = (id: string, patch: Partial<Pick<MappingRow, "match" | "replace">>) => {
    commitRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  };

  const removeRow = (id: string) => {
    const next = rows.filter((r) => r.id !== id);
    if (!next.some((r) => r.id === "__new__")) {
      next.push({ id: "__new__", match: "", replace: "" });
    }
    commitRows(next);
  };

  const addRow = () => {
    const withoutTrailing = rows.filter((r) => r.id !== "__new__");
    commitRows([
      ...withoutTrailing,
      { id: `row-${Date.now().toString(36)}`, match: "", replace: "" },
      { id: "__new__", match: "", replace: "" },
    ]);
  };

  const enterJsonMode = () => {
    setJsonDraft(JSON.stringify(group.mappings, null, 2));
    setJsonMode(true);
  };

  const applyJson = () => {
    try {
      const parsed = JSON.parse(jsonDraft) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("invalid");
      }
      const mappings: Record<string, string> = {};
      for (const [k, v] of Object.entries(parsed)) {
        if (typeof v !== "string") throw new Error("invalid value");
        mappings[k] = v;
      }
      onUpdate({ mappings });
      setJsonMode(false);
      message.success("映射已更新");
    } catch {
      message.error("JSON 解析失败，请检查格式");
    }
  };

  const nameInvalid = !group.name.trim();

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <Label className="text-[10px] text-muted-foreground">组名</Label>
          <Input
            className={cn("h-8 text-xs", nameInvalid && invalidFieldClass)}
            value={group.name}
            placeholder="埋点名"
            aria-invalid={nameInvalid || undefined}
            onChange={(e) => onUpdate({ name: e.target.value })}
          />
          {nameInvalid && (
            <p className="text-[10px] text-destructive">组名不能为空；修正后再保存</p>
          )}
          <p className="text-[10px] text-muted-foreground">
            ID <code className="font-mono text-foreground">{mapkey}</code>
            {" · "}
            引用 <code className="font-mono text-foreground">[alias:{mapkey}]</code>
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onRemove}
          aria-label="删除 Alias 组"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-[10px] text-muted-foreground">映射</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => (jsonMode ? setJsonMode(false) : enterJsonMode())}
          >
            {jsonMode ? "列表" : "JSON"}
          </Button>
        </div>

        {jsonMode ? (
          <div className="space-y-2">
            <Textarea
              className="min-h-[120px] font-mono text-xs"
              value={jsonDraft}
              onChange={(e) => setJsonDraft(e.target.value)}
              placeholder='{"page_view":"页面浏览"}'
            />
            <Button type="button" size="sm" variant="secondary" onClick={applyJson}>
              应用 JSON
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {rows.map((row) => (
              <li key={row.id} className="flex items-center gap-2">
                <Input
                  className="h-8 flex-1 font-mono text-xs"
                  value={row.match}
                  placeholder="原始值"
                  onChange={(e) => updateRow(row.id, { match: e.target.value })}
                />
                <span className="shrink-0 text-xs text-muted-foreground">→</span>
                <Input
                  className="h-8 flex-1 text-xs"
                  value={row.replace}
                  placeholder="展示文案"
                  onChange={(e) => updateRow(row.id, { replace: e.target.value })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  disabled={rows.length <= 1 && !row.match.trim()}
                  onClick={() => removeRow(row.id)}
                  aria-label="删除映射"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
            <li>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={addRow}
              >
                <Plus className="mr-1 h-3.5 w-3.5" />
                添加映射
              </Button>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}

interface AliasSectionProps {
  config: AppConfig;
  mapkey: string | null;
  onChange: (config: AppConfig) => void;
  onRemove: (mapkey: string) => void;
}

export function AliasSection({ config, mapkey, onChange, onRemove }: AliasSectionProps) {
  const group = mapkey ? config.aliasMaps[mapkey] : undefined;
  if (!mapkey || !group) {
    return (
      <p className="text-sm text-muted-foreground">在左侧选择别名组，或新建一个。</p>
    );
  }

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <div>
        <h2 className="font-medium">别名</h2>
        <p className="text-xs text-muted-foreground">
          填写组名即可；ID 自动生成，字段中使用{" "}
          <code className="text-foreground">[alias:ID]</code> 引用
        </p>
      </div>
      <AliasMapGroupCard
        mapkey={mapkey}
        group={group}
        onUpdate={(patch) =>
          onChange({
            ...config,
            aliasMaps: {
              ...config.aliasMaps,
              [mapkey]: { name: group.name, mappings: group.mappings, ...patch },
            },
          })
        }
        onRemove={() => onRemove(mapkey)}
      />
    </section>
  );
}
