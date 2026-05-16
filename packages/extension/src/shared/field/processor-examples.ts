import type { CustomProcessorConfig } from "../types";

/** 首次安装时的示例 Processor，用户可编辑或删除 */
export const EXAMPLE_PROCESSORS: CustomProcessorConfig = {
  time: `(value) => {
  const n = Number(value);
  const ms =
    typeof value === "number"
      ? n < 1e12
        ? n * 1000
        : n
      : Date.parse(String(value));
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return String(value ?? "");
  const p = (x) => String(x).padStart(2, "0");
  return p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
}`,
  datetime: `(value) => {
  const n = Number(value);
  const ms =
    typeof value === "number"
      ? n < 1e12
        ? n * 1000
        : n
      : Date.parse(String(value));
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? String(value ?? "") : d.toLocaleString();
}`,
  date: `(value) => {
  const n = Number(value);
  const ms =
    typeof value === "number"
      ? n < 1e12
        ? n * 1000
        : n
      : Date.parse(String(value));
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return String(value ?? "");
  const p = (x) => String(x).padStart(2, "0");
  return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
}`,
};
