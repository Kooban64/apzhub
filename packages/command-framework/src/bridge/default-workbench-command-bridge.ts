import {
  actionToRequest,
  type WorkbenchAction,
  type WorkbenchRequest,
  type WorkbenchSelectionItem,
} from "@apzhub/workbench-framework";

import type { WorkbenchCommandBridgeDiagnostics } from "./bridge-diagnostics";
import {
  isWorkbenchBridgeActionId,
  WORKBENCH_BRIDGE_ACTION_IDS,
  type WorkbenchBridgeActionId,
} from "./workbench-bridge-action-ids";
import type { ActionWorkbenchCommandBridge } from "./workbench-command-bridge";

function readString(
  payload: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = payload?.[key];
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function readRecord(
  payload: Record<string, unknown> | undefined,
  key: string,
): Record<string, unknown> | undefined {
  const value = payload?.[key];
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
}

function readPanelId(
  payload: Record<string, unknown> | undefined,
): "sidebar" | "context" | undefined {
  const panelId = readString(payload, "panelId");
  return panelId === "sidebar" || panelId === "context" ? panelId : undefined;
}

function readSelectionItems(
  payload: Record<string, unknown> | undefined,
): readonly WorkbenchSelectionItem[] | undefined {
  const selectionPayload = readRecord(payload, "selection") ?? payload;
  const items = selectionPayload?.items;
  const mode = selectionPayload?.mode;

  if (!Array.isArray(items)) {
    return mode === "clear" ? [] : undefined;
  }

  const parsed: WorkbenchSelectionItem[] = [];
  for (const item of items) {
    if (typeof item !== "object" || item === null) {
      continue;
    }
    const record = item as Record<string, unknown>;
    const id = readString(record, "id");
    const kind = readString(record, "kind");
    if (!id || !kind) {
      continue;
    }
    const scope = readString(record, "scope");
    const permission = readString(record, "permission");
    const entry: WorkbenchSelectionItem = {
      id,
      kind,
      ...(scope ? { scope } : {}),
      ...(permission ? { permission } : {}),
    };
    parsed.push(entry);
  }

  if (mode === "clear") {
    return parsed;
  }

  return parsed.length > 0 ? parsed : undefined;
}

function mapPayloadToAction(
  actionId: WorkbenchBridgeActionId,
  payload?: Record<string, unknown>,
): WorkbenchAction | null {
  switch (actionId) {
    case "workbench.view.open": {
      const viewId = readString(payload, "viewId");
      if (!viewId) {
        return null;
      }
      return {
        id: actionId,
        viewId,
        workspace: readString(payload, "workspace"),
        params: readRecord(payload, "params"),
      };
    }
    case "workbench.view.close":
    case "workbench.view.focus": {
      const viewId = readString(payload, "viewId");
      if (!viewId) {
        return null;
      }
      return { id: actionId, viewId };
    }
    case "workbench.panel.open": {
      const panelId = readPanelId(payload);
      if (!panelId) {
        return null;
      }
      return {
        id: actionId,
        panelId,
        tabKey: readString(payload, "tabKey"),
      };
    }
    case "workbench.panel.close": {
      const panelId = readPanelId(payload);
      if (!panelId) {
        return null;
      }
      return { id: actionId, panelId };
    }
    case "workbench.navigation.reveal": {
      const navId = readString(payload, "navId");
      if (!navId) {
        return null;
      }
      return { id: actionId, navId };
    }
    case "workbench.context.set": {
      const contextKey =
        readString(payload, "contextKey") ?? readString(payload, "context");
      if (!contextKey) {
        return null;
      }
      return {
        id: actionId,
        contextKey,
        payload: readRecord(payload, "payload"),
      };
    }
    case "workbench.selection.set": {
      const selectionPayload = readRecord(payload, "selection") ?? payload;
      const mode = selectionPayload?.mode;
      const items = readSelectionItems(payload);
      if (items === undefined) {
        return null;
      }
      return {
        id: actionId,
        items,
        mode:
          mode === "clear" || mode === "single" || mode === "multi" ? mode : undefined,
        viewId: readString(selectionPayload, "viewId"),
      };
    }
    default: {
      const exhaustive: never = actionId;
      return exhaustive;
    }
  }
}

/**
 * Default Workbench Command Bridge — maps Action ids to Workbench actions and requests.
 *
 * ## Canonical execution pipeline
 *
 * ```text
 * Action Request
 *     ↓
 * Registry Lookup
 *     ↓
 * Permission Check (WorkbenchPermissionAdapter)
 *     ↓
 * Execution Context
 *     ↓
 * Handler Resolution
 *     ↓
 * Workbench Command Bridge  ← this component
 *     ↓
 * Workbench Request
 *     ↓
 * Workbench Manager
 *     ↓
 * Result
 * ```
 */
export class DefaultWorkbenchCommandBridge implements ActionWorkbenchCommandBridge {
  private translationCount = 0;
  private unsupportedActionCount = 0;
  private invalidPayloadCount = 0;
  private lastTranslationAt: string | undefined;

  supports(actionId: string): boolean {
    return isWorkbenchBridgeActionId(actionId);
  }

  toAction(
    commandId: string,
    payload?: Record<string, unknown>,
  ): WorkbenchAction | null {
    if (!this.supports(commandId)) {
      this.unsupportedActionCount += 1;
      return null;
    }

    const action = mapPayloadToAction(commandId as WorkbenchBridgeActionId, payload);
    if (!action) {
      this.invalidPayloadCount += 1;
      return null;
    }

    this.recordTranslation();
    return action;
  }

  toRequest(
    commandId: string,
    payload?: Record<string, unknown>,
  ): WorkbenchRequest | null {
    const action = this.toAction(commandId, payload);
    if (!action) {
      if (this.supports(commandId)) {
        // toAction already incremented invalidPayloadCount
        return null;
      }
      return null;
    }

    return actionToRequest(action);
  }

  getDiagnostics(): WorkbenchCommandBridgeDiagnostics {
    return {
      status: "ready",
      supportedActionIds: WORKBENCH_BRIDGE_ACTION_IDS,
      translationCount: this.translationCount,
      unsupportedActionCount: this.unsupportedActionCount,
      invalidPayloadCount: this.invalidPayloadCount,
      lastTranslationAt: this.lastTranslationAt,
    };
  }

  private recordTranslation(): void {
    this.translationCount += 1;
    this.lastTranslationAt = new Date().toISOString();
  }
}

export function createDefaultWorkbenchCommandBridge(): ActionWorkbenchCommandBridge {
  return new DefaultWorkbenchCommandBridge();
}

/** DI factory for bridge instances. */
export const defaultWorkbenchCommandBridgeFactory = {
  create(): ActionWorkbenchCommandBridge {
    return createDefaultWorkbenchCommandBridge();
  },
};
