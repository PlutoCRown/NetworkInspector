/** 扩展内共享模块入口（按域分子目录，此处聚合常用导出） */

export * from "./types";
export { DEFAULT_RULE_GROUPS, DEFAULT_ALIAS_MAPS } from "./defaults";

export { APP_NAME, APP_VERSION } from "./app/meta";
export {
  APP_EXPORT_VERSION,
  buildAppExport,
  detectImportPayload,
  getBundleStats,
  isAppExportBundle,
  parseAppExportBundle,
  parseImportJson,
  type AppBundleStats,
  type AppExportBundle,
  type ImportBundleOptions,
  type ImportDetectResult,
} from "./app/bundle";
export { normalizeAppConfig } from "./app/normalize-config";
export {
  appendCapture,
  clearCaptures,
  loadState,
  saveActiveRuleGroupId,
  saveAppConfig,
  saveCaptureEnabled,
  saveCaptures,
  saveRuleGroups,
} from "./app/storage";
export type { Message } from "./app/messages";

export { processCapture, validateRuleGroup } from "./capture/pipeline";
export { syncActionBadge } from "./capture/badge";
export { countVisibleCaptures, getVisibleCaptures } from "./capture/visible";

export {
  DEFAULT_SPLIT_NAME,
  emptyFieldExpr,
  getSplitNames,
  parseFieldExpr,
  ruleHasSplits,
  serializeFieldExpr,
  SOURCE_TAG_OPTIONS,
  type FieldExpr,
  type FieldExprTagOption,
} from "./field/expr";
export { extractField, extractFields, extractFromSource, type ExtractInput } from "./field/extract";
export {
  collectFieldRefIdsFromRuleGroup,
  collectFieldRefIdsFromRuleGroups,
  configAvailableAfterImport,
  formatImportWarnings,
  getMissingFieldRefs,
  hasImportWarnings,
  type FieldRefIds,
  type ImportDependencyWarning,
} from "./field/refs";
export { resolveFieldExpr, resolveSplitArray, type SplitContext } from "./field/resolve";
export { applyAliasMap, runProcessor, runProcessors } from "./field/processors";
export { EXAMPLE_PROCESSORS } from "./field/processor-examples";

export { createEmptyRule } from "./rule/create-empty";
export { normalizeRuleGroup } from "./rule/normalize";

export {
  defaultFieldsForRenderer,
  getRendererDefinition,
  getRendererFields,
  normalizeRendererId,
  RENDERER_DEFINITIONS,
  type RendererDefinition,
} from "./render/registry";

export { getByPath, deleteByPath } from "./util/path";
export { matchesAny } from "./util/regex";
export {
  isExtensionContextValid,
  isContextInvalidatedError,
  safeRuntimeSendMessage,
} from "./util/extension-context";
