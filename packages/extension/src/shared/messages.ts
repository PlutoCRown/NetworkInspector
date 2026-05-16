import type { AppConfig, CaptureRecord, RawRequestPayload, RuleGroup } from "./types";

export type Message =
  | { type: "RAW_REQUEST"; payload: RawRequestPayload }
  | { type: "GET_STATE" }
  | { type: "CAPTURE_ADDED"; capture: CaptureRecord; captures: CaptureRecord[] }
  | { type: "STATE_UPDATED"; state: import("./types").AppState }
  | { type: "TOGGLE_RULE_GROUP"; id: string }
  | { type: "TOGGLE_CAPTURE_ENABLED" }
  | { type: "SET_ACTIVE_GROUP"; id: string }
  | { type: "RELOAD_STATE" }
  | { type: "IMPORT_RULE_GROUP"; group: RuleGroup; overwrite?: boolean }
  | { type: "SAVE_RULE_GROUP"; group: RuleGroup }
  | { type: "DELETE_RULE_GROUP"; id: string }
  | { type: "CLEAR_CAPTURES" }
  | { type: "SAVE_APP_CONFIG"; config: AppConfig }
  | { type: "OPEN_EDITOR"; ruleGroupId?: string };
