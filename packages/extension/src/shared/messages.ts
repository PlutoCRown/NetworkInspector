import type { CaptureRecord, RawRequestPayload, RuleGroup } from "./types";

export type Message =
  | { type: "RAW_REQUEST"; payload: RawRequestPayload }
  | { type: "GET_STATE" }
  | { type: "CAPTURE_ADDED"; capture: CaptureRecord; captures: CaptureRecord[] }
  | { type: "STATE_UPDATED"; state: import("./types").AppState }
  | { type: "TOGGLE_ENABLED" }
  | { type: "SET_ACTIVE_GROUP"; id: string }
  | { type: "IMPORT_RULE_GROUP"; group: RuleGroup; overwrite?: boolean }
  | { type: "SAVE_RULE_GROUP"; group: RuleGroup }
  | { type: "DELETE_RULE_GROUP"; id: string }
  | { type: "CLEAR_CAPTURES" }
  | { type: "OPEN_SIDE_PANEL" }
  | { type: "OPEN_EDITOR" };
