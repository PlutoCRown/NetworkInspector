import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  applyAutocompleteId,
  buildAutocompleteItems,
  parseSlashSegment,
  type AutocompleteItem,
  type FieldRefInputMode,
} from "@/components/field-ref-autocomplete";
import {
  emptyFieldExpr,
  parseFieldExpr,
  serializeFieldExpr,
  SOURCE_TAG_OPTIONS,
  type FieldExpr,
} from "@/shared/field/expr";
import type { AppConfig, FieldSource } from "@/shared/types";
import { cn } from "@/lib/utils";

export type { FieldRefInputMode };

interface FieldRefInputProps {
  value: string;
  onChange: (value: string) => void;
  mode: FieldRefInputMode;
  splitNames?: string[];
  config: AppConfig;
  placeholder?: string;
  className?: string;
}

function RemovableTag({
  label,
  tone = "default",
  onRemove,
}: {
  label: string;
  tone?: "default" | "source" | "aggregate" | "processor" | "alias";
  onRemove: () => void;
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
        "inline-flex max-w-full items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-medium",
        toneClass,
      )}
    >
      <span className="truncate">{label}</span>
      <button
        type="button"
        className="shrink-0 rounded-sm opacity-70 hover:opacity-100"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onRemove}
        aria-label={`移除 ${label}`}
      >
        <X className="size-3" />
      </button>
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [slashActive, setSlashActive] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /** 避免 onChange → 父组件回写 value 时用 parse 结果覆盖正在输入的 pathDraft */
  const lastEmittedRef = useRef(value);

  const defaultPlaceholder =
    mode === "split-source"
      ? "路径或 /json、/processor/time"
      : "路径或 /json、/aggregate/item、/processor/time";

  useEffect(() => {
    if (value === lastEmittedRef.current) return;
    lastEmittedRef.current = value;
    const next = parseFieldExpr(value);
    setExpr(next);
    setPathDraft(next.path);
    setSlashActive(false);
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
        setSlashActive(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const emitSerialized = (next: FieldExpr) => {
    const serialized = serializeFieldExpr(next);
    lastEmittedRef.current = serialized;
    onChange(serialized);
    return serialized;
  };

  const commit = (next: FieldExpr, draftOverride?: string) => {
    setExpr(next);
    const draft = draftOverride ?? next.path;
    setPathDraft(draft);
    emitSerialized(next);
  };

  const hasSource = Boolean(expr.source);
  const hasSplitRef = Boolean(expr.splitRef);
  const isLiteral = !hasSource && !hasSplitRef;

  const slashSeg = parseSlashSegment(pathDraft);
  const autocompleteItems: AutocompleteItem[] =
    slashActive && slashSeg
      ? buildAutocompleteItems({
        mode,
        query: slashSeg.query,
        hasSource,
        hasSplitRef,
        splitNames,
        processorIds: expr.processors,
        hasAlias: Boolean(expr.aliasMap),
        config,
      })
      : [];

  const showAutocomplete = slashActive && autocompleteItems.length > 0;

  useEffect(() => {
    setHighlightIdx(0);
  }, [pathDraft, showAutocomplete]);

  const pickSource = (source: FieldSource) => {
    commit({ ...expr, source, splitRef: null });
    setMenuOpen(false);
    setSlashActive(false);
  };

  const pickSplitRef = (name: string) => {
    commit({ ...expr, splitRef: name, source: null });
    setMenuOpen(false);
    setSlashActive(false);
  };

  const addProcessor = (id: string) => {
    if (expr.processors.includes(id)) return;
    commit({ ...expr, processors: [...expr.processors, id] });
    setMenuOpen(false);
    setSlashActive(false);
  };

  const removeProcessor = (id: string) => {
    commit({
      ...expr,
      processors: expr.processors.filter((p) => p !== id),
    });
  };

  const setAlias = (mapId: string) => {
    commit({ ...expr, aliasMap: mapId });
    setMenuOpen(false);
    setSlashActive(false);
  };

  const clearAlias = () => commit({ ...expr, aliasMap: null });

  const clearPrefix = () => commit(emptyFieldExpr());

  const setPath = (path: string) => {
    const seg = parseSlashSegment(path);
    const inSlash = seg !== null;
    setSlashActive(inSlash);
    const storedPath = inSlash ? seg.base : path;
    const next = { ...expr, path: storedPath };
    setExpr(next);
    setPathDraft(path);
    if (!inSlash) {
      emitSerialized(next);
    }
  };

  const finalizePath = () => {
    const seg = parseSlashSegment(pathDraft);
    if (seg) {
      const next = { ...expr, path: seg.base };
      setExpr(next);
      setPathDraft(seg.base);
      emitSerialized(next);
    } else if (pathDraft !== expr.path) {
      const next = { ...expr, path: pathDraft };
      commit(next);
    }
    setSlashActive(false);
  };

  const applyAutocomplete = (item: AutocompleteItem) => {
    const seg = parseSlashSegment(pathDraft);
    const base = seg?.base ?? pathDraft;

    const action = applyAutocompleteId(item.id);
    if (!action) return;

    let next = { ...expr, path: base };

    switch (action.kind) {
      case "source":
        next = { ...next, source: action.source, splitRef: null };
        break;
      case "aggregate":
        next = { ...next, splitRef: action.name, source: null };
        break;
      case "processor":
        if (!next.processors.includes(action.processorId)) {
          next.processors = [...next.processors, action.processorId];
        }
        break;
      case "alias":
        next.aliasMap = action.mapkey;
        break;
    }

    commit(next, base);
    setSlashActive(false);
    inputRef.current?.focus();
  };

  const handlePathKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (showAutocomplete) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIdx((i) => (i + 1) % autocompleteItems.length);
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIdx(
          (i) => (i - 1 + autocompleteItems.length) % autocompleteItems.length,
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const item = autocompleteItems[highlightIdx];
        if (item) applyAutocomplete(item);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setSlashActive(false);
        if (slashSeg) setPath(slashSeg.base);
        return;
      }
    }

    if (e.key === "Backspace" && pathDraft.length === 0) {
      if (expr.aliasMap) {
        e.preventDefault();
        clearAlias();
        return;
      }
      if (hasSplitRef || hasSource) {
        e.preventDefault();
        clearPrefix();
      }
    }
  };

  const processorOptions = Object.keys(config.customProcessors).map((id) => ({
    id,
    label: id,
    description: "Processor",
  }));
  const aliasOptions = Object.entries(config.aliasMaps).map(([mapkey, group]) => ({
    mapkey,
    label: group.name ? `${group.name} (${mapkey})` : mapkey,
  }));

  const renderMenu = (items: AutocompleteItem[], onPick: (item: AutocompleteItem) => void) => {
    const groups = [...new Set(items.map((i) => i.group))];
    return (
      <ul className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-auto rounded-md border bg-popover py-1 shadow-md">
        {groups.map((group) => (
          <li key={group}>
            <div className="px-3 py-1 text-[10px] font-medium text-muted-foreground">
              {group}
            </div>
            {items
              .filter((i) => i.group === group)
              .map((item) => {
                const idx = items.indexOf(item);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={cn(
                      "flex w-full flex-col px-3 py-1.5 text-left text-xs hover:bg-accent",
                      showAutocomplete && idx === highlightIdx && "bg-accent",
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onPick(item);
                    }}
                  >
                    <span className="font-mono">{item.label}</span>
                    {item.hint && (
                      <span className="text-[10px] text-muted-foreground">{item.hint}</span>
                    )}
                  </button>
                );
              })}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div ref={wrapRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-1 rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring",
        )}
      >
        {hasSplitRef && (
          <RemovableTag
            label={`aggregate:${expr.splitRef}`}
            tone="aggregate"
            onRemove={clearPrefix}
          />
        )}
        {hasSource && (
          <RemovableTag
            label={`source:${expr.source}`}
            tone="source"
            onRemove={clearPrefix}
          />
        )}
        {isLiteral && pathDraft && !slashActive && (
          <RemovableTag label="固定文本" tone="default" onRemove={() => commit({ ...expr, path: "" })} />
        )}

        {expr.processors.map((p) => (
          <RemovableTag
            key={p}
            label={`processor:${p}`}
            tone="processor"
            onRemove={() => removeProcessor(p)}
          />
        ))}

        {expr.aliasMap && (
          <RemovableTag
            label={`alias:${expr.aliasMap}`}
            tone="alias"
            onRemove={clearAlias}
          />
        )}

        <input
          ref={inputRef}
          className="min-w-[100px] flex-1 bg-transparent py-0.5 text-xs font-mono outline-none placeholder:text-muted-foreground"
          value={pathDraft}
          placeholder={placeholder ?? defaultPlaceholder}
          onChange={(e) => setPath(e.target.value)}
          onKeyDown={handlePathKeyDown}
          onFocus={() => {
            if (parseSlashSegment(pathDraft)) setSlashActive(true);
          }}
          onBlur={finalizePath}
        />

        <div className="relative shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <Plus className="size-3.5" />
          </Button>
          {menuOpen && !showAutocomplete && (
            <ul className="absolute right-0 z-50 mt-1 max-h-56 w-52 overflow-auto rounded-md border bg-popover py-1 shadow-md">
              {!hasSource && !hasSplitRef && (
                <>
                  <li className="px-3 py-1 text-[10px] font-medium text-muted-foreground">
                    数据来源
                  </li>
                  {SOURCE_TAG_OPTIONS.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        className="w-full px-3 py-1.5 text-left font-mono text-xs hover:bg-accent"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          pickSource(s.id as FieldSource);
                        }}
                      >
                        source:{s.id}
                      </button>
                    </li>
                  ))}
                </>
              )}
              {mode === "field" && splitNames.length > 0 && !hasSplitRef && (
                <>
                  <li className="px-3 py-1 text-[10px] font-medium text-muted-foreground">
                    拆分项
                  </li>
                  {splitNames.map((name) => (
                    <li key={name}>
                      <button
                        type="button"
                        className="w-full px-3 py-1.5 text-left font-mono text-xs hover:bg-accent"
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
              {(hasSource || hasSplitRef) && (
                <li className="px-3 py-1 text-[10px] font-medium text-muted-foreground">
                  Processor
                </li>
              )}
              {processorOptions.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={expr.processors.includes(p.id)}
                    className="w-full px-3 py-1.5 text-left font-mono text-xs hover:bg-accent disabled:opacity-40"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      addProcessor(p.id);
                    }}
                  >
                    processor:{p.id}
                  </button>
                </li>
              ))}
              {(hasSource || hasSplitRef) && !expr.aliasMap && (
                <li className="px-3 py-1 text-[10px] font-medium text-muted-foreground">
                  Alias
                </li>
              )}
              {aliasOptions.map(({ mapkey, label }) => (
                <li key={mapkey}>
                  <button
                    type="button"
                    className="w-full px-3 py-1.5 text-left text-xs hover:bg-accent"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setAlias(mapkey);
                    }}
                  >
                    <span className="font-mono">alias:{mapkey}</span>
                    {label !== mapkey && (
                      <span className="ml-1 text-muted-foreground">· {label}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showAutocomplete &&
        renderMenu(autocompleteItems, applyAutocomplete)}

      <p className="mt-1 text-[10px] text-muted-foreground">
        输入 <kbd className="rounded border px-1 font-mono">/</kbd> 唤起补全；Processor 可叠加多个
      </p>
    </div>
  );
}
