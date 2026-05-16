import type { CaptureRecord } from "@/shared/types";
import { getRendererDefinition } from "@/shared/render/registry";
import { CardCapture } from "./renderers/CardCapture";
import { DividerCapture } from "./renderers/DividerCapture";

export function CaptureRenderer({ record }: { record: CaptureRecord }) {
  if (getRendererDefinition(record.renderer)?.id === "divider") {
    return <DividerCapture record={record} />;
  }
  return <CardCapture record={record} />;
}
