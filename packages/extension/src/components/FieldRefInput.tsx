import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  emptyFieldExpr,
  parseFieldExpr,
  serializeFieldExpr,
  SOURCE_TAG_OPTIONS,
  type FieldExpr,
} from "@/shared/field/expr";
import { BUILTIN_PROCESSORS } from "@/shared/field/processors";
import type { AppConfig, FieldSource } from "@/shared/types";
import { cn } from "@/lib/utils";

export type FieldRefInputMode = "split-source" | "field";

interface FieldRefInputProps {
  value: string;
  onChange: (value: string) => void;
  mode: FieldRefInputMode;
  /** 聚合模式下可选的拆分名，用于 [aggregate:name] */
  splitNames?: string[];
  config: AppConfig;
  placeholder?: string;
  className?: string;
}

function Tag({
  label,
  tone = "default",
}: {
  label: string;
  tone?: "default" | "source" | "aggregate" | "processor" | "alias";
}) {
  const toneClass = {
    default: "bg-muted text-foreground",
    source: "bg-primary/10 text-primary",
    aggregate: "bg-amber-500/15 text-amber-800 dark:text-amber-200",
    processor: "bg-blue-500/10 text-blue-800 dark:text-blue-200",
    alias: "bg-violet-500/10 text-violet-800 dark:text-violet-200",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        toneClass,
      )}
    >
      {label}
    </span>
  );
}

export function FieldRefInput({
  value,
  onChange,
  mode,
  splitNames = [],
  config,
  placeholder,
  className,
}: FieldRefInputProps) {
  const [expr, setExpr] = useState<FieldExpr>(() => parseFieldExpr(value));
  const [pathDraft, setPathDraft] = useState(expr.path);
  const [addOpen, setAddOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const defaultPlaceholder =
    mode === "split-source"
      ? "路径（如 items），+ 选择 json / response 等来源"
      : "固定文本或路径，+ 选择来源";

  useEffect(() => {
    const next = parseFieldExpr(value);
    setExpr(next);
    setPathDraft(next.path);
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setAddOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const commit = (next: FieldExpr) => {
    setExpr(next);
    setPathDraft(next.path);
    onChange(serializeFieldExpr(next));
  };

  const pickSource = (source: FieldSource) => {
    commit({ ...expr, source, splitRef: null, scope: "request" as const });
    setAddOpen(false);
  };

  const setPath = (path: string) => {
    setPathDraft(path);
    commit({ ...expr, path });
  };

  const pickSplitRef = (name: string) => {
    commit({
      ...expr,
      splitRef: name,
      source: null,
      scope: "item",
    });
    setAddOpen(false);
  };

  const addProcessor = (id: string) => {
    if (expr.processors.includes(id)) return;
    commit({ ...expr, processors: [...expr.processors, id] });
    setAddOpen(false);
  };

  const addAlias = (mapId: string) => {
    commit({ ...expr, aliasMap: mapId });
    setAddOpen(false);
  };

  const hasSource = Boolean(expr.source);
  const hasSplitRef = Boolean(expr.splitRef);
  const isLiteral = !hasSource && !hasSplitRef;
  const showSplitPicker = mode === "field" && splitNames.length > 0;

  const removeLastTag = () => {
    if (expr.aliasMap) {
      commit({ ...expr, aliasMap: null });
      return;
    }
    if (expr.processors.length > 0) {
      commit({ ...expr, processors: expr.processors.slice(0, -1) });
      return;
    }
    if (hasSplitRef || hasSource) {
      commit(emptyFieldExpr("request"));
    }
  };

  const handlePathKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Backspace" && e.key !== "Delete") return;
    if (pathDraft.length > 0) return;
    e.preventDefault();
    removeLastTag();
  };

  const processorOptions = [
    ...BUILTIN_PROCESSORS,
    ...Object.keys(config.customProcessors).map((id) => ({
      id,
      label: id,
      description: "自定义",
    })),
  ];
  const aliasOptions = Object.entries(config.aliasMaps).map(([mapkey, group]) => ({
    mapkey,
    label: group.name ? `${group.name} (${mapkey})` : mapkey,
  }));

  return (
    <div
      ref={wrapRef}
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
    >
      {hasSplitRef && (
        <Tag label={`aggregate:${expr.splitRef}`} tone="aggregate" />
      )}
      {hasSource && <Tag label={`source:${expr.source}`} tone="source" />}
      {isLiteral && pathDraft && <Tag label="固定文本" tone="default" />}

      <input
        className="min-w-[80px] flex-1 bg-transparent py-0.5 text-xs font-mono outline-none placeholder:text-muted-foreground"
        value={pathDraft}
        placeholder={placeholder ?? defaultPlaceholder}
        onChange={(e) => setPath(e.target.value)}
        onKeyDown={handlePathKeyDown}
      />

      {expr.processors.map((p) => (
        <Tag key={p} label={`processor:${p}`} tone="processor" />
      ))}
      {expr.aliasMap && <Tag label={`alias:${expr.aliasMap}`} tone="alias" />}

      <div className="relative">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setAddOpen((v) => !v)}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
        {addOpen && (
          <ul className="absolute right-0 z-50 mt-1 max-h-56 w-48 overflow-auto rounded-md border bg-popover py-1 shadow-md">
            {!hasSource && !hasSplitRef && (
              <>
                <li className="px-3 py-1 text-[10px] font-medium text-muted-foreground">
                  数据来源
                </li>
                {SOURCE_TAG_OPTIONS.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className="w-full px-3 py-1.5 text-left text-xs hover:bg-accent"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pickSource(s.id as FieldSource);
                      }}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </>
            )}
            {showSplitPicker && !hasSplitRef && (
              <>
                <li className="px-3 py-1 text-[10px] font-medium text-muted-foreground">
                  拆分项
                </li>
                {splitNames.map((name) => (
                  <li key={name}>
                    <button
                      type="button"
                      className="w-full px-3 py-1.5 text-left text-xs hover:bg-accent"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pickSplitRef(name);
                      }}
                    >
                      aggregate:{name}
                    </button>
                  </li>
                ))}
              </>
            )}
            {showSplitPicker && hasSource && !hasSplitRef && (
              <li className="px-3 py-1 text-[10px] text-muted-foreground">
                请求级字段请直接选来源；数组项字段请选 aggregate
              </li>
            )}
            {(hasSource || hasSplitRef) && (
              <li className="px-3 py-1 text-[10px] font-medium text-muted-foreground">
                后处理
              </li>
            )}
            {processorOptions.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-accent"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addProcessor(p.id);
                  }}
                >
                  Processor: {p.label}
                </button>
              </li>
            ))}
            {aliasOptions.map(({ mapkey, label }) => (
              <li key={mapkey}>
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-accent"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addAlias(mapkey);
                  }}
                >
                  [alias:{mapkey}] {label !== mapkey ? `· ${label}` : ""}
                </button>
              </li>
            ))}
            {aliasOptions.length === 0 && (hasSource || hasSplitRef) && (
              <li className="px-3 py-1.5 text-[10px] text-muted-foreground">
                请先在全局配置中添加 Alias 表
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
