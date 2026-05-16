import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  FIELD_SOURCES,
  filterSourceSuggestions,
  formatFieldRef,
  parseFieldRef,
} from "@/shared/field-ref";
import type { FieldSource } from "@/shared/types";
import { cn } from "@/lib/utils";

interface FieldRefInputProps {
  value: string;
  onChange: (value: string) => void;
  pathOnly?: boolean;
  placeholder?: string;
  className?: string;
}

export function FieldRefInput({
  value,
  onChange,
  pathOnly = false,
  placeholder = "路径，如 event.name",
  className,
}: FieldRefInputProps) {
  const parsed = parseFieldRef(value);
  const [pathDraft, setPathDraft] = useState(parsed.path);
  const [sourceQuery, setSourceQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sourceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPathDraft(parseFieldRef(value).path);
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pickSource = (s: FieldSource) => {
    onChange(formatFieldRef(s, pathDraft));
    setSourceQuery("");
    setOpen(false);
  };

  const clearSource = () => {
    onChange(pathDraft);
    setSourceQuery("");
    setOpen(true);
    requestAnimationFrame(() => sourceInputRef.current?.focus());
  };

  const commitPath = (path: string) => {
    setPathDraft(path);
    const { source } = parseFieldRef(value);
    onChange(source ? formatFieldRef(source, path) : path);
  };

  if (pathOnly) {
    return (
      <Input
        className={cn("bg-background font-mono text-xs", className)}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }

  const source = parsed.source;
  const suggestions = filterSourceSuggestions(sourceQuery);

  const handleSourceKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && open && suggestions.length === 1) {
      e.preventDefault();
      pickSource(suggestions[0]!.id);
    }
  };

  const handlePathKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && pathDraft === "" && source) {
      e.preventDefault();
      clearSource();
    }
  };

  if (!source) {
    return (
      <div ref={wrapRef} className={cn("relative", className)}>
        <Input
          ref={sourceInputRef}
          className="bg-background font-mono text-xs"
          value={sourceQuery || value}
          placeholder="输入 query / json / form-data / header"
          onChange={(e) => {
            const v = e.target.value;
            setSourceQuery(v);
            setOpen(true);
            const exact = FIELD_SOURCES.find((s) => s.id === v);
            if (exact) pickSource(exact.id);
            else onChange(v);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleSourceKeyDown}
        />
        {open && suggestions.length > 0 && (
          <ul className="absolute z-50 mt-1 max-h-40 w-full overflow-auto rounded-md border bg-popover py-1 shadow-md">
            {suggestions.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className="w-full bg-background px-3 py-1.5 text-left text-xs hover:bg-accent"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pickSource(s.id);
                  }}
                >
                  <span className="font-medium">{s.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md border border-input bg-background px-2 py-0.5 focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
    >
      <span className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
        {source}
        <button
          type="button"
          className="rounded hover:bg-primary/20"
          onClick={clearSource}
          aria-label="移除来源"
        >
          <X className="h-3 w-3" />
        </button>
      </span>
      <input
        className="min-w-0 flex-1 bg-transparent py-1.5 text-xs font-mono outline-none placeholder:text-muted-foreground"
        value={pathDraft}
        placeholder={placeholder}
        onChange={(e) => commitPath(e.target.value)}
        onKeyDown={handlePathKeyDown}
      />
    </div>
  );
}
