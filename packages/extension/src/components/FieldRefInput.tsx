import { useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  emptyFieldExpr,
  parseFieldExpr,
  serializeFieldExpr,
  SOURCE_TAG_OPTIONS,
  type FieldExpr,
} from "@/shared/field-expr";
import { BUILTIN_PROCESSORS } from "@/shared/processors";
import type { AppConfig, FieldSource } from "@/shared/types";
import { cn } from "@/lib/utils";

export type FieldRefInputMode = "aggregate-source" | "field";

interface FieldRefInputProps {
  value: string;
  onChange: (value: string) => void;
  mode: FieldRefInputMode;
  /** 规则已配置聚合源时，字段默认从数组项读取 */
  ruleHasAggregate?: boolean;
  config: AppConfig;
  placeholder?: string;
  className?: string;
}

function Tag({
  label,
  tone = "default",
  onRemove,
}: {
  label: string;
  tone?: "default" | "source" | "aggregate" | "processor" | "alias";
  onRemove?: () => void;
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
        "inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium",
        toneClass,
      )}
    >
      {label}
      {onRemove && (
        <button type="button" className="rounded hover:bg-black/10" onClick={onRemove}>
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}

export function FieldRefInput({
  value,
  onChange,
  mode,
  ruleHasAggregate = false,
  config,
  placeholder = "路径",
  className,
}: FieldRefInputProps) {
  const [expr, setExpr] = useState<FieldExpr>(() => parseFieldExpr(value));
  const [pathDraft, setPathDraft] = useState(expr.path);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const next = parseFieldExpr(value);
    setExpr(next);
    setPathDraft(next.path);
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setSourceOpen(false);
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
    const next = { ...expr, source, scope: "request" as const };
    commit(next);
    setSourceOpen(false);
  };

  const setPath = (path: string) => {
    setPathDraft(path);
    commit({ ...expr, path });
  };

  const toggleAggregateTag = () => {
    commit({ ...expr, aggregate: !expr.aggregate });
  };

  const setItemScope = () => {
    commit({
      ...expr,
      scope: "item",
      source: null,
      aggregate: false,
    });
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

  const showItemScope = mode === "field" && ruleHasAggregate;
  const hasSource = Boolean(expr.source);
  const hasItemScope = expr.scope === "item";
  const needsPicker = !hasSource && !hasItemScope;

  if (needsPicker) {
    return (
      <div ref={wrapRef} className={cn("relative", className)}>
        <Input
          className="bg-background font-mono text-xs"
          placeholder={
            mode === "aggregate-source"
              ? "选择来源：json / query / form-data / header"
              : "选择 Aggregate 或请求来源"
          }
          onFocus={() => setSourceOpen(true)}
          readOnly
        />
        {sourceOpen && (
          <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border bg-popover py-1 shadow-md">
            {showItemScope && (
              <li>
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-accent"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setItemScope();
                    setSourceOpen(false);
                  }}
                >
                  Aggregate（数组项内路径）
                </button>
              </li>
            )}
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
          </ul>
        )}
      </div>
    );
  }

  const processorOptions = [
    ...BUILTIN_PROCESSORS,
    ...Object.keys(config.customProcessors).map((id) => ({
      id,
      label: id,
      description: "自定义",
    })),
  ];
  const aliasOptions = Object.keys(config.aliasMaps);

  return (
    <div
      ref={wrapRef}
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
    >
      {hasItemScope && (
        <Tag label="Aggregate" tone="aggregate" onRemove={() => commit(emptyFieldExpr("request"))} />
      )}
      {hasSource && (
        <Tag
          label={expr.source!}
          tone="source"
          onRemove={() => commit({ ...expr, source: null })}
        />
      )}
      {expr.aggregate && mode === "aggregate-source" && (
        <Tag label="Aggregate" tone="aggregate" onRemove={toggleAggregateTag} />
      )}

      <input
        className="min-w-[80px] flex-1 bg-transparent py-0.5 text-xs font-mono outline-none placeholder:text-muted-foreground"
        value={pathDraft}
        placeholder={placeholder}
        onChange={(e) => setPath(e.target.value)}
      />

      {expr.processors.map((p) => (
        <Tag
          key={p}
          label={`Processor:${p}`}
          tone="processor"
          onRemove={() =>
            commit({ ...expr, processors: expr.processors.filter((x) => x !== p) })
          }
        />
      ))}
      {expr.aliasMap && (
        <Tag
          label={`Alias:${expr.aliasMap}`}
          tone="alias"
          onRemove={() => commit({ ...expr, aliasMap: null })}
        />
      )}

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
          <ul className="absolute right-0 z-50 mt-1 max-h-48 w-44 overflow-auto rounded-md border bg-popover py-1 shadow-md">
            {mode === "aggregate-source" && !expr.aggregate && (
              <li>
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-accent"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    toggleAggregateTag();
                  }}
                >
                  Aggregate（打散数组）
                </button>
              </li>
            )}
            {showItemScope && !hasItemScope && hasSource && (
              <li>
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-accent"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setItemScope();
                  }}
                >
                  改为 Aggregate 项内路径
                </button>
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
            {aliasOptions.map((id) => (
              <li key={id}>
                <button
                  type="button"
                  className="w-full px-3 py-1.5 text-left text-xs hover:bg-accent"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addAlias(id);
                  }}
                >
                  Alias: {id}
                </button>
              </li>
            ))}
            {aliasOptions.length === 0 && (
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
