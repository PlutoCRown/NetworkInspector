import type { CaptureRecord } from "@/shared/types";
import { resolveRendererId } from "@/shared/renderer-registry";
import { CardCapture } from "./renderers/CardCapture";
import { DividerCapture } from "./renderers/DividerCapture";

export function CaptureRenderer({ record }: { record: CaptureRecord }) {
  if (resolveRendererId(record.renderer) === "divider") {
    return <DividerCapture record={record} />;
  }
  return <CardCapture record={record} />;
}
