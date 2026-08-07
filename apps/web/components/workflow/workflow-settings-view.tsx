"use client";

import { PageShell, WORKFLOW_PRODUCT_NAME } from "./workflow-ui";

/**
 * Product preferences only — no engine consoles (N-03).
 */
export function WorkflowSettingsView() {
  return (
    <PageShell
      title="Settings"
      description="APZ Workflow product preferences. Operational tools stay separate."
      breadcrumbs={[WORKFLOW_PRODUCT_NAME, "Settings"]}
    >
      <div
        className="rounded-lg border border-[var(--color-border)] p-4 text-sm text-[var(--color-muted-foreground)]"
        data-testid="workflow-settings"
      >
        <p>
          Workspace preferences for APZ Workflow will appear here. Automation and
          operator configuration remain below the product boundary and are not exposed
          as product settings.
        </p>
      </div>
    </PageShell>
  );
}
