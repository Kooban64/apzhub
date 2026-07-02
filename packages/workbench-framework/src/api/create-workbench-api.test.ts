import { describe, expect, it, vi } from "vitest";

import { createWorkbenchAPI } from "./create-workbench-api";
import type { WorkbenchAPIHost } from "./workbench-api";
import type { WorkbenchActionExecutor } from "./workbench-action-executor";
import { createDefaultLayoutState } from "../engines/layout-engine/layout-engine";
import { DEFAULT_PANEL_STATE } from "../engines/panel-engine/panel-engine";
import { createEmptySelectionState } from "../engines/selection-engine/selection-state";

function createHost(overrides: Partial<WorkbenchAPIHost> = {}): WorkbenchAPIHost {
  return {
    publish: vi.fn(() => ({ ok: true })),
    getState: vi.fn(() => ({
      layout: createDefaultLayoutState(),
      panels: DEFAULT_PANEL_STATE,
      navigation: { activeWorkspaceId: "home", items: [], groups: [], tree: [] },
      views: { descriptors: [], openViews: [], focusedViewId: undefined },
      session: {
        schemaVersion: "1.0" as const,
        hydrated: false,
        persistenceEnabled: false,
        restoreStatus: "none" as const,
        droppedViewCount: 0,
        droppedPermissionCount: 0,
        invalidFieldCount: 0,
        errors: [],
        storageBackend: "none" as const,
      },
      dock: { splitRatios: {} },
      context: {},
      selection: createEmptySelectionState(),
    })),
    subscribe: vi.fn(() => () => undefined),
    getNavigationDiagnostics: vi.fn(() => ({
      contributionCount: 0,
      visibleCount: 0,
      hiddenCount: 0,
      permissionFilteredCount: 0,
      duplicateIds: [],
      orphanParents: [],
      activeWorkspaceId: "home",
      groupCount: 0,
    })),
    getViewDiagnostics: vi.fn(() => ({
      descriptorCount: 0,
      visibleDescriptorCount: 0,
      permissionFilteredCount: 0,
      duplicateViewIds: [],
      openViewCount: 0,
    })),
    getSessionDiagnostics: vi.fn(() => ({
      schemaVersion: "1.0" as const,
      hydrated: false,
      persistenceEnabled: false,
      restoreStatus: "none" as const,
      droppedViewCount: 0,
      droppedPermissionCount: 0,
      invalidFieldCount: 0,
      errors: [],
      storageBackend: "none" as const,
    })),
    getContextDiagnostics: vi.fn(() => ({ hasPayload: false })),
    getSelectionDiagnostics: vi.fn(() => ({
      mode: "none" as const,
      itemCount: 0,
      viewCount: 0,
      droppedInvalidCount: 0,
    })),
    getPermissionDiagnostics: vi.fn(() => ({
      adapterKind: "allow-all" as const,
      hasContext: true,
      roleCount: 0,
      permissionCount: 0,
      deniedRequestCount: 0,
      filteredItemCount: 0,
    })),
    can: vi.fn(() => true),
    recordDeniedRequest: vi.fn(),
    ...overrides,
  };
}

describe("createWorkbenchAPI", () => {
  it("exposes typed view helpers through executeAction", () => {
    const host = createHost();
    const api = createWorkbenchAPI(host);

    const result = api.views.open("platform-home", { workspace: "home" });

    expect(result.ok).toBe(true);
    expect(host.publish).toHaveBeenCalledWith({
      type: "openView",
      viewId: "platform-home",
      workspace: "home",
    });
  });

  it("rejects actions when permission check fails at API boundary", () => {
    const host = createHost({ can: vi.fn(() => false) });
    const api = createWorkbenchAPI(host);

    const result = api.views.open("platform-home", {
      permission: "platform.view.platform-home.open",
    });

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("FORBIDDEN");
    expect(host.publish).not.toHaveBeenCalled();
    expect(host.recordDeniedRequest).toHaveBeenCalled();
  });

  it("returns aggregated diagnostics snapshot", () => {
    const api = createWorkbenchAPI(createHost());
    const diagnostics = api.getDiagnostics();

    expect(diagnostics.navigation.activeWorkspaceId).toBe("home");
    expect(diagnostics.permission.adapterKind).toBe("allow-all");
    expect(diagnostics.actionExecution.executorConfigured).toBe(false);
    expect(diagnostics.actionInvocation.invocationCount).toBe(0);
  });

  it("supports typed panel, navigation, context and selection helpers", () => {
    const host = createHost();
    const api = createWorkbenchAPI(host);

    expect(api.panels.open("context", { tabKey: "details" }).ok).toBe(true);
    expect(api.navigation.reveal("platform-home").ok).toBe(true);
    expect(api.context.set("entity.details", { payload: { id: "1" } }).ok).toBe(true);
    expect(api.selection.clear().ok).toBe(true);
    expect(host.publish).toHaveBeenCalledTimes(4);
  });

  it("executes raw requests and actions", () => {
    const host = createHost();
    const api = createWorkbenchAPI(host);

    expect(api.execute({ type: "closePanel", panelId: "sidebar" }).ok).toBe(true);
    expect(
      api.executeAction({ id: "workbench.panel.close", panelId: "sidebar" }).ok,
    ).toBe(true);
  });

  it("uses legacy publish path when no executor is configured", () => {
    const host = createHost();
    const api = createWorkbenchAPI(host);

    api.views.open("platform-home");

    expect(host.publish).toHaveBeenCalled();
    expect(api.getDiagnostics().actionExecution.legacyPathCount).toBe(1);
    expect(api.getDiagnostics().actionExecution.executorPathCount).toBe(0);
  });

  it("delegates executeAction to injected executor", () => {
    const host = createHost();
    const execute = vi.fn((): ReturnType<WorkbenchActionExecutor["execute"]> => ({
      ok: true,
      code: "SUCCESS",
      workbenchResult: { ok: true },
    }));
    const actionExecutor: WorkbenchActionExecutor = { execute };

    const api = createWorkbenchAPI(host, { actionExecutor });

    const result = api.views.open("platform-home", { workspace: "home" });

    expect(result.ok).toBe(true);
    expect(execute).toHaveBeenCalledWith({
      actionId: "workbench.view.open",
      args: { viewId: "platform-home", workspace: "home" },
      actor: "user",
      permission: undefined,
    });
    expect(host.publish).not.toHaveBeenCalled();
    expect(api.getDiagnostics().actionExecution.executorPathCount).toBe(1);
    expect(api.getDiagnostics().actionInvocation.invocationCount).toBe(1);
  });

  it("maps executor failures to workbench request errors", () => {
    const actionExecutor: WorkbenchActionExecutor = {
      execute: () => ({
        ok: false,
        code: "FORBIDDEN",
        message: "Denied",
      }),
    };

    const api = createWorkbenchAPI(createHost(), { actionExecutor });
    const result = api.views.open("platform-home");

    expect(result.ok).toBe(false);
    expect(result.error?.code).toBe("FORBIDDEN");
    expect(api.getDiagnostics().actionExecution.executorFailureCount).toBe(1);
  });
});
