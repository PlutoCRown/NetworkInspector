import type { CaptureRecord } from "@/shared/types";
import { isCaptureError } from "@/shared/capture/capture-error";
import { isCaptureWarning } from "@/shared/capture/capture-warning";
import { getRendererDefinition } from "@/shared/render/registry";
import { CardCapture } from "./renderers/CardCapture";
import { DividerCapture } from "./renderers/DividerCapture";
import { ErrorCapture } from "./renderers/ErrorCapture";
import { WarningCapture } from "./renderers/WarningCapture";

export function CaptureRenderer({ record }: { record: CaptureRecord }) {
  if (isCaptureError(record)) {
    return <ErrorCapture record={record} />;
  }
  if (isCaptureWarning(record)) {
    return <WarningCapture record={record} />;
  }
  if (getRendererDefinition(record.renderer)?.id === "divider") {
    return <DividerCapture record={record} />;
  }
  return <CardCapture record={record} />;
}
