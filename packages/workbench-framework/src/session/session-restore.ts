import type { WorkbenchPermissionAdapter } from "../interfaces/permission-adapter";
import type { NavigationItem, ViewDescriptor } from "../interfaces/types";
import { sanitizeSelectionForRestore } from "../engines/selection-engine/selection-sanitize";
import type { WorkbenchSessionPayload } from "./workbench-session-payload";
import {
  parseWorkbenchSessionPayload,
  type SessionRestoreStatus,
} from "./workbench-session-payload";

export interface SessionRestoreContext {
  readonly permissionAdapter: WorkbenchPermissionAdapter;
  readonly navigationItems: readonly NavigationItem[];
  readonly viewDescriptors: readonly ViewDescriptor[];
}

export interface SanitizedWorkbenchSession {
  readonly payload: WorkbenchSessionPayload;
  readonly status: SessionRestoreStatus;
  readonly droppedViewCount: number;
  readonly droppedPermissionCount: number;
  readonly invalidFieldCount: number;
  readonly errors: readonly string[];
}

export function sanitizeSessionForRestore(
  raw: unknown,
  context: SessionRestoreContext,
): SanitizedWorkbenchSession | null {
  const parsed = parseWorkbenchSessionPayload(raw);

  if (!parsed.ok) {
    return {
      payload: {
        schemaVersion: "1.0",
        activeWorkspace: "",
        openViews: [],
        panels: {},
        capturedAt: new Date().toISOString(),
      },
      status: parsed.status,
      droppedViewCount: 0,
      droppedPermissionCount: 0,
      invalidFieldCount: 1,
      errors: parsed.errors,
    };
  }

  const errors: string[] = [];
  let droppedViewCount = 0;
  let droppedPermissionCount = 0;
  let invalidFieldCount = 0;

  const visibleNavItems = context.permissionAdapter.filter([
    ...context.navigationItems,
  ]) as NavigationItem[];

  const visibleDescriptors = context.permissionAdapter.filter([
    ...context.viewDescriptors,
  ]) as ViewDescriptor[];

  const activityBarItems = visibleNavItems.filter(
    (item) => item.level === "activity-bar",
  );

  let activeWorkspace = parsed.payload.activeWorkspace;
  if (!activityBarItems.some((item) => item.workspace === activeWorkspace)) {
    invalidFieldCount += 1;
    activeWorkspace = activityBarItems[0]?.workspace ?? "";
    errors.push(`Dropped invalid activeWorkspace "${parsed.payload.activeWorkspace}"`);
  }

  let activeActivityBarItemId = parsed.payload.activeActivityBarItemId;
  if (
    activeActivityBarItemId &&
    !activityBarItems.some((item) => item.id === activeActivityBarItemId)
  ) {
    invalidFieldCount += 1;
    activeActivityBarItemId = activityBarItems.find(
      (item) => item.workspace === activeWorkspace,
    )?.id;
    errors.push("Dropped invalid activeActivityBarItemId");
  }

  const sidebarItems = visibleNavItems.filter(
    (item) => item.level === "sidebar" && item.workspace === activeWorkspace,
  );

  let focusedViewId = parsed.payload.focusedViewId;
  const focusedDescriptor = focusedViewId
    ? visibleDescriptors.find((descriptor) => descriptor.viewId === focusedViewId)
    : undefined;

  if (focusedViewId && !focusedDescriptor) {
    droppedViewCount += 1;
    droppedPermissionCount += 1;
    invalidFieldCount += 1;
    focusedViewId = undefined;
    errors.push(
      `Dropped unauthorised or unknown focused view "${parsed.payload.focusedViewId}"`,
    );
  }

  let activeSidebarItemId = parsed.payload.activeSidebarItemId;
  if (
    activeSidebarItemId &&
    !sidebarItems.some((item) => item.id === activeSidebarItemId)
  ) {
    invalidFieldCount += 1;
    activeSidebarItemId = undefined;
    errors.push("Dropped invalid activeSidebarItemId");
  }

  if (!focusedViewId && focusedDescriptor) {
    focusedViewId = focusedDescriptor.viewId;
  }

  if (!focusedViewId) {
    focusedViewId = visibleDescriptors.find(
      (descriptor) => descriptor.workspace === activeWorkspace && descriptor.default,
    )?.viewId;
  }

  if (!focusedViewId) {
    focusedViewId = visibleDescriptors.find(
      (descriptor) => descriptor.workspace === activeWorkspace,
    )?.viewId;
  }

  const openViews =
    focusedViewId && focusedDescriptor
      ? [{ viewId: focusedViewId, workspace: focusedDescriptor.workspace }]
      : focusedViewId
        ? visibleDescriptors
            .filter((descriptor) => descriptor.viewId === focusedViewId)
            .map((descriptor) => ({
              viewId: descriptor.viewId,
              workspace: descriptor.workspace,
            }))
        : [];

  const status: SessionRestoreStatus =
    errors.length === 0
      ? "success"
      : errors.some((error) => error.includes("schema"))
        ? "invalid"
        : "partial";

  const selectionResult = sanitizeSelectionForRestore({
    selection: parsed.payload.selection,
    focusedViewId,
    permissionAdapter: context.permissionAdapter,
  });

  errors.push(...selectionResult.errors);
  invalidFieldCount += selectionResult.droppedInvalidCount;

  return {
    payload: {
      ...parsed.payload,
      activeWorkspace,
      focusedViewId,
      activeActivityBarItemId,
      activeSidebarItemId,
      openViews,
      selection: selectionResult.selection,
    },
    status: errors.length === 0 ? "success" : status === "success" ? "partial" : status,
    droppedViewCount,
    droppedPermissionCount,
    invalidFieldCount,
    errors,
  };
}
