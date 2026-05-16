import type { AppConfig } from "../types";

export function isProcessorIdValid(id: string): boolean {
  return id.trim().length > 0;
}

export function isProcessorBodyValid(body: string): boolean {
  const source = body.trim();
  if (!source) return false;
  try {
    new Function("value", `return (${source})(value);`);
    return true;
  } catch {
    return false;
  }
}

/** 保存前校验；编辑过程中允许草稿无效 */
export function validateAppConfigForSave(config: AppConfig): string[] {
  const errors: string[] = [];

  for (const [id, body] of Object.entries(config.customProcessors)) {
    if (!isProcessorIdValid(id)) {
      errors.push("存在空的处理器 ID");
      continue;
    }
    if (!isProcessorBodyValid(body)) {
      errors.push(`处理器「${id}」：函数体不能为空且须为合法的 (value) => … 表达式`);
    }
  }

  for (const [mapkey, group] of Object.entries(config.aliasMaps)) {
    if (!group.name.trim()) {
      errors.push(`别名组「${mapkey}」：组名不能为空`);
    }
  }

  return errors;
}
