import type { WorkbenchAction } from "./workbench-actions";
import type { WorkbenchDiagnosticsSnapshot } from "./workbench-diagnostics";
import type { WorkbenchRequest, WorkbenchRequestResult } from "../interfaces/requests";
import type {
  Unsubscribe,
  WorkbenchSelectionItem,
  WorkbenchState,
  WorkbenchStateListener,
} from "../interfaces/types";

export const WORKBENCH_API_VERSION = "1.0" as const;

/** Host surface required to construct the public Workbench API. */
export interface WorkbenchAPIHost {
  publish(request: WorkbenchRequest): WorkbenchRequestResult;
  getState(): WorkbenchState;
  subscribe(listener: WorkbenchStateListener): Unsubscribe;
  getNavigationDiagnostics(): WorkbenchDiagnosticsSnapshot["navigation"];
  getViewDiagnostics(): WorkbenchDiagnosticsSnapshot["view"];
  getSessionDiagnostics(): WorkbenchDiagnosticsSnapshot["session"];
  getContextDiagnostics(): WorkbenchDiagnosticsSnapshot["context"];
  getSelectionDiagnostics(): WorkbenchDiagnosticsSnapshot["selection"];
  getPermissionDiagnostics(): WorkbenchDiagnosticsSnapshot["permission"];
  can?(permission?: string): boolean;
  recordDeniedRequest?(): void;
}

/**
 * Public Workbench API — the supported capability interface (ADR-0020).
 * Capabilities must use this API; engines remain internal to Workbench Manager.
 */
export interface WorkbenchAPI {
  readonly version: typeof WORKBENCH_API_VERSION;

  /** Execute a typed Workbench Request through Workbench Manager. */
  execute(request: WorkbenchRequest): WorkbenchRequestResult;

  /** Execute a Workbench Action (Sprint 004 command precursor). */
  executeAction(action: WorkbenchAction): WorkbenchRequestResult;

  getState(): WorkbenchState;
  subscribe(listener: WorkbenchStateListener): Unsubscribe;
  getDiagnostics(): WorkbenchDiagnosticsSnapshot;

  views: {
    open(
      viewId: string,
      options?: {
        workspace?: string;
        params?: Record<string, unknown>;
        permission?: string;
      },
    ): WorkbenchRequestResult;
    close(viewId: string): WorkbenchRequestResult;
    focus(viewId: string): WorkbenchRequestResult;
  };

  panels: {
    open(
      panelId: "sidebar" | "context",
      options?: { tabKey?: string; permission?: string },
    ): WorkbenchRequestResult;
    close(panelId: "sidebar" | "context"): WorkbenchRequestResult;
  };

  navigation: {
    reveal(navId: string, options?: { permission?: string }): WorkbenchRequestResult;
  };

  context: {
    set(
      contextKey: string,
      options?: { payload?: Record<string, unknown>; permission?: string },
    ): WorkbenchRequestResult;
  };

  selection: {
    set(
      items: readonly WorkbenchSelectionItem[],
      options?: {
        mode?: "clear" | "single" | "multi";
        viewId?: string;
        permission?: string;
      },
    ): WorkbenchRequestResult;
    clear(viewId?: string): WorkbenchRequestResult;
  };
}

/** Capability registration context — inject at capability bootstrap. */
export interface WorkbenchCapabilityRegistrationContext {
  readonly workbench: WorkbenchAPI;
}
