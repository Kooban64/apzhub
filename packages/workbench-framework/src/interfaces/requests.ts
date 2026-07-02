import type { WorkbenchSelectionItem } from "./types";

export type WorkbenchRequest =
  | {
      type: "openView";
      viewId: string;
      workspace?: string;
      params?: Record<string, unknown>;
    }
  | { type: "closeView"; viewId: string }
  | { type: "focusView"; viewId: string }
  | { type: "openPanel"; panelId: "sidebar" | "context"; tabKey?: string }
  | { type: "closePanel"; panelId: "sidebar" | "context" }
  | { type: "revealNavigationItem"; navId: string }
  | { type: "setContext"; contextKey: string; payload?: Record<string, unknown> }
  | {
      type: "setSelection";
      selection: {
        items: WorkbenchSelectionItem[];
        mode?: "clear" | "single" | "multi";
        viewId?: string;
      };
    };

export type WorkbenchRequestErrorCode =
  "INVALID_REQUEST" | "FORBIDDEN" | "NOT_IMPLEMENTED" | "ENGINE_ERROR";

export interface WorkbenchRequestError {
  code: WorkbenchRequestErrorCode;
  message: string;
  engineId?: string;
}

export interface WorkbenchRequestResult {
  ok: boolean;
  error?: WorkbenchRequestError;
}

export function workbenchRequestError(
  code: WorkbenchRequestErrorCode,
  message: string,
  engineId?: string,
): WorkbenchRequestError {
  return engineId ? { code, message, engineId } : { code, message };
}

export function workbenchRequestOk(): WorkbenchRequestResult {
  return { ok: true };
}

export function workbenchRequestFail(
  error: WorkbenchRequestError,
): WorkbenchRequestResult {
  return { ok: false, error };
}

/** Request types routed in Phase 1. */
export const PHASE1_REQUEST_TYPES = ["openPanel", "closePanel"] as const;

export type Phase1WorkbenchRequest = Extract<
  WorkbenchRequest,
  { type: (typeof PHASE1_REQUEST_TYPES)[number] }
>;

/** Maps request type to target engine id. */
export const REQUEST_ENGINE_MAP: Record<WorkbenchRequest["type"], string> = {
  openView: "view",
  closeView: "view",
  focusView: "view",
  openPanel: "panel",
  closePanel: "panel",
  revealNavigationItem: "navigation",
  setContext: "context",
  setSelection: "selection",
};
