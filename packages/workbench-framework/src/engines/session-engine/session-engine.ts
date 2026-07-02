import type { WorkbenchEngine } from "../../interfaces/dependencies";
import type { WorkbenchPermissionAdapter } from "../../interfaces/permission-adapter";
import type { WorkbenchRequest } from "../../interfaces/requests";
import {
  workbenchRequestError,
  workbenchRequestFail,
  type WorkbenchRequestResult,
} from "../../interfaces/requests";
import type {
  NavigationItem,
  NavigationState,
  SessionDiagnostics,
  ViewDescriptor,
  WorkbenchState,
} from "../../interfaces/types";
import { captureWorkbenchSession } from "../../session/session-capture";
import {
  sanitizeSessionForRestore,
  type SessionRestoreContext,
} from "../../session/session-restore";
import type { SessionStore } from "../../session/session-store";
import type { WorkbenchSessionPayload } from "../../session/workbench-session-payload";
import { WORKBENCH_SESSION_SCHEMA_VERSION } from "../../session/workbench-session-payload";

export interface SessionEngineOptions {
  readonly sessionStore?: SessionStore;
  readonly storageBackend?: SessionDiagnostics["storageBackend"];
}

export interface SessionRestoreTargets {
  permissionAdapter: WorkbenchPermissionAdapter;
  navigationItems: readonly NavigationItem[];
  viewDescriptors: readonly ViewDescriptor[];
  setActiveWorkspace: (workspaceId: string) => WorkbenchRequestResult;
  restoreFocusedView: (
    viewId: string | undefined,
    workspace: string,
  ) => WorkbenchRequestResult;
  applyPanelState: (panels: WorkbenchSessionPayload["panels"]) => void;
  applyLayoutPreferences: (layout: WorkbenchSessionPayload["layout"]) => void;
  applySelection: (selection: WorkbenchSessionPayload["selection"]) => void;
  applyDock: (dock: WorkbenchSessionPayload["dock"]) => void;
}

export class SessionEngine implements WorkbenchEngine {
  readonly id = "session" as const;

  private readonly sessionStore?: SessionStore;

  private readonly storageBackend: SessionDiagnostics["storageBackend"];

  private diagnostics: SessionDiagnostics = createInitialDiagnostics("none");

  constructor(options: SessionEngineOptions = {}) {
    this.sessionStore = options.sessionStore;
    this.storageBackend =
      options.storageBackend ?? (options.sessionStore ? "memory" : "none");
    this.diagnostics = createInitialDiagnostics(this.storageBackend);
  }

  getState(): SessionDiagnostics {
    return this.diagnostics;
  }

  getStateSlice(): SessionDiagnostics {
    return this.getState();
  }

  getDiagnostics(): SessionDiagnostics {
    return this.diagnostics;
  }

  capture(state: WorkbenchState, navigation: NavigationState): WorkbenchSessionPayload {
    const payload = captureWorkbenchSession(state, navigation);
    this.diagnostics = {
      ...this.diagnostics,
      schemaVersion: WORKBENCH_SESSION_SCHEMA_VERSION,
      lastCapturedAt: payload.capturedAt,
    };
    return payload;
  }

  async restore(
    userId: string,
    targets: SessionRestoreTargets,
  ): Promise<SessionRestoreResult> {
    if (!this.sessionStore) {
      return { restored: false, status: "none" };
    }

    const raw = await this.sessionStore.load(userId);
    if (!raw) {
      this.diagnostics = {
        ...this.diagnostics,
        hydrated: false,
        restoreStatus: "none",
        userId,
      };
      return { restored: false, status: "none" };
    }

    const context: SessionRestoreContext = {
      permissionAdapter: targets.permissionAdapter,
      navigationItems: targets.navigationItems,
      viewDescriptors: targets.viewDescriptors,
    };

    const sanitized = sanitizeSessionForRestore(raw, context);
    if (
      !sanitized ||
      sanitized.status === "invalid" ||
      sanitized.status === "version_mismatch"
    ) {
      await this.sessionStore.clear(userId);
      this.diagnostics = {
        ...this.diagnostics,
        hydrated: false,
        restoreStatus: sanitized?.status ?? "invalid",
        userId,
        droppedViewCount: sanitized?.droppedViewCount ?? 0,
        droppedPermissionCount: sanitized?.droppedPermissionCount ?? 0,
        invalidFieldCount: sanitized?.invalidFieldCount ?? 1,
        errors: sanitized?.errors ?? ["Invalid session payload"],
      };
      return { restored: false, status: sanitized?.status ?? "invalid" };
    }

    const { payload } = sanitized;

    if (payload.activeWorkspace) {
      targets.setActiveWorkspace(payload.activeWorkspace);
    }

    targets.applyPanelState(payload.panels);
    targets.applyLayoutPreferences(payload.layout);
    targets.applyDock(payload.dock);
    targets.restoreFocusedView(payload.focusedViewId, payload.activeWorkspace);
    targets.applySelection(payload.selection);

    const restoredAt = new Date().toISOString();
    this.diagnostics = {
      ...this.diagnostics,
      hydrated: true,
      restoreStatus: sanitized.status,
      userId,
      lastRestoredAt: restoredAt,
      droppedViewCount: sanitized.droppedViewCount,
      droppedPermissionCount: sanitized.droppedPermissionCount,
      invalidFieldCount: sanitized.invalidFieldCount,
      errors: sanitized.errors,
    };

    return { restored: true, status: sanitized.status, payload };
  }

  async persist(
    userId: string,
    state: WorkbenchState,
    navigation: NavigationState,
  ): Promise<void> {
    if (!this.sessionStore) {
      return;
    }

    const payload = this.capture(state, navigation);
    await this.sessionStore.save(userId, payload);
    this.diagnostics = {
      ...this.diagnostics,
      persistenceEnabled: true,
      userId,
      lastPersistedAt: payload.capturedAt,
    };
  }

  async clear(userId: string): Promise<void> {
    if (!this.sessionStore) {
      return;
    }

    await this.sessionStore.clear(userId);
    this.diagnostics = {
      ...createInitialDiagnostics(this.storageBackend),
      restoreStatus: "none",
    };
  }

  setPersistenceEnabled(enabled: boolean, userId?: string): void {
    this.diagnostics = {
      ...this.diagnostics,
      persistenceEnabled: enabled,
      userId: enabled ? userId : undefined,
    };
  }

  handleRequest(_request: WorkbenchRequest): WorkbenchRequestResult {
    return workbenchRequestFail(
      workbenchRequestError(
        "NOT_IMPLEMENTED",
        "Session Engine does not accept workbench requests in Phase 5",
        this.id,
      ),
    );
  }
}

export interface SessionRestoreResult {
  readonly restored: boolean;
  readonly status: SessionDiagnostics["restoreStatus"];
  readonly payload?: WorkbenchSessionPayload;
}

export function createSessionEngine(options?: SessionEngineOptions): SessionEngine {
  return new SessionEngine(options);
}

function createInitialDiagnostics(
  storageBackend: SessionDiagnostics["storageBackend"],
): SessionDiagnostics {
  return {
    schemaVersion: WORKBENCH_SESSION_SCHEMA_VERSION,
    hydrated: false,
    persistenceEnabled: false,
    restoreStatus: "none",
    droppedViewCount: 0,
    droppedPermissionCount: 0,
    invalidFieldCount: 0,
    errors: [],
    storageBackend,
  };
}
