import { useId, useRef, useState } from "react";
import type { CaptureRecord } from "@/shared/types";
import {
  fieldHasContent,
  interpolateText,
  type ParsedRenderer,
} from "@network-inspector/presets";
import { getBuiltinRenderer } from "@/shared/renderer-registry";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";

interface TemplateCaptureProps {
  record: CaptureRecord;
}

function builtinCtx(record: CaptureRecord) {
  return {
    timestamp: record.timestamp,
    requestUrl: record.requestUrl,
    ruleId: record.ruleId,
    ruleGroupId: record.ruleGroupId,
  };
}

function ScopedStyle({ css, scopeId }: { css: string; scopeId: string }) {
  if (!css.trim()) return null;
  const scoped = css.replace(/(^|\})\s*([^@{}][^{]*)\{/g, (_, brace, sel) => {
    const trimmed = sel.trim();
    if (trimmed.startsWith("@")) return `${brace} ${trimmed}{`;
    return `${brace} [data-ni-scope="${scopeId}"] ${trimmed}{`;
  });
  return <style>{scoped}</style>;
}

function DividerView({
  renderer,
  record,
}: {
  renderer: ParsedRenderer;
  record: CaptureRecord;
}) {
  const scopeId = useId().replace(/:/g, "");
  const ctx = builtinCtx(record);
  const title = interpolateText("{{title}}", record.data, ctx);

  return (
    <div data-ni-scope={scopeId}>
      <ScopedStyle css={renderer.styles} scopeId={scopeId} />
      <div x-divider className="ni-divider">
        <span className="ni-divider__line" />
        <span className="ni-divider__title">{title || "—"}</span>
        <span className="ni-divider__line" />
      </div>
    </div>
  );
}

function CardView({
  renderer,
  record,
}: {
  renderer: ParsedRenderer;
  record: CaptureRecord;
}) {
  const scopeId = useId().replace(/:/g, "");
  const ctx = builtinCtx(record);
  const [expanded, setExpanded] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const hoverRef = useRef(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showExpand =
    renderer.slots.expand && fieldHasContent(record.data, "expend");
  const showPopover =
    renderer.slots.popover && fieldHasContent(record.data, "popover");
  const showDesc = renderer.slots.desc && fieldHasContent(record.data, "desc");

  const titlePlain = interpolateText("{{title}}", record.data, ctx);
  const titleHighlight = interpolateText("{{title}}", record.data, ctx);
  const desc = interpolateText("{{desc}}", record.data, ctx);
  const expend = interpolateText("{{expend}}", record.data, ctx);
  const popoverText = interpolateText("{{popover}}", record.data, ctx);
  const requestUrl = interpolateText("{{__REQUEST_URL__}}", record.data, ctx);
  const time = interpolateText("{{__TIME__}}", record.data, ctx);

  const useHighlight = Boolean(record.highlight?.tone);
  const titleTone = record.highlight?.tone;

  const openPopover = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    hoverRef.current = true;
    setPopoverOpen(true);
  };

  const scheduleClosePopover = () => {
    hoverRef.current = false;
    closeTimer.current = setTimeout(() => {
      if (!hoverRef.current) setPopoverOpen(false);
    }, 120);
  };

  const card = (
    <article
      data-ni-scope={scopeId}
      x-card
      className="ni-card"
      onMouseEnter={showPopover ? openPopover : undefined}
      onMouseLeave={showPopover ? scheduleClosePopover : undefined}
    >
      <div
        className="ni-card__hit"
        onClick={() => {
          if (showExpand) setExpanded((v) => !v);
        }}
        role={showExpand ? "button" : undefined}
        tabIndex={showExpand ? 0 : undefined}
        onKeyDown={(e) => {
          if (showExpand && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setExpanded((v) => !v);
          }
        }}
      >
        {useHighlight ? (
          <div x-title data-highlight className="ni-card__title" data-tone={titleTone}>
            {titleHighlight || "—"}
          </div>
        ) : (
          <div x-title className="ni-card__title">
            {titlePlain || "—"}
          </div>
        )}
        {showDesc && (
          <div x-if="desc" className="ni-card__desc">
            {desc}
          </div>
        )}
        <div className="ni-card__meta">
          <span className="ni-card__url">{requestUrl}</span>
          <span>{time}</span>
        </div>
      </div>
      {renderer.slots.expand && (
        <div
          x-expand
          className="ni-expand-outer"
          data-expanded={expanded && showExpand ? "true" : "false"}
        >
          <div className="ni-expand-inner">
            <div className="ni-expand-body">
              <pre>{showExpand && expanded ? expend : ""}</pre>
            </div>
          </div>
        </div>
      )}
    </article>
  );

  if (!showPopover) {
    return (
      <>
        <ScopedStyle css={renderer.styles} scopeId={scopeId} />
        {card}
      </>
    );
  }

  return (
    <>
      <ScopedStyle css={renderer.styles} scopeId={scopeId} />
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverAnchor asChild>{card}</PopoverAnchor>
        <PopoverContent
          className="ni-popover-content max-h-64 w-80 overflow-auto p-3"
          side="right"
          align="start"
          onMouseEnter={openPopover}
          onMouseLeave={scheduleClosePopover}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <pre>{popoverText}</pre>
        </PopoverContent>
      </Popover>
    </>
  );
}

export function TemplateCapture({ record }: TemplateCaptureProps) {
  const renderer =
    getBuiltinRenderer(record.renderer) ?? getBuiltinRenderer("card");
  if (!renderer) return null;
  if (renderer.slots.divider) {
    return <DividerView renderer={renderer} record={record} />;
  }
  return <CardView renderer={renderer} record={record} />;
}
