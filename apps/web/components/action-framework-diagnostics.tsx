"use client";

import type { ActionRegistryHydrationDiagnostics } from "@apzhub/command-framework/server";

export interface ActionFrameworkDiagnosticsProps {
  readonly diagnostics: ActionRegistryHydrationDiagnostics;
  readonly userId?: string;
}

/** Developer diagnostics for Action Framework hydration (AF-020). */
export function ActionFrameworkDiagnostics({
  diagnostics,
  userId,
}: ActionFrameworkDiagnosticsProps) {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <aside
      hidden
      data-testid="action-framework-diagnostics"
      data-user-id={userId ?? "anonymous"}
      data-registered-count={diagnostics.registeredCount}
      data-filtered-count={diagnostics.filteredCount}
      data-platform-action-count={diagnostics.platformActionCount}
      data-capability-action-count={diagnostics.capabilityActionCount}
      data-toolbar-region-count={diagnostics.toolbarRegionCount}
      data-toolbar-item-count={diagnostics.toolbarItemCount}
      data-shortcut-count={diagnostics.registeredShortcutCount}
    />
  );
}
