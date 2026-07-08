"use client";

import { getInvoiceWorkflowDiagnostics } from "../../lib/billing";

export function InvoiceContextPanel() {
  const summary = getInvoiceWorkflowDiagnostics().getSummary();

  return (
    <aside className="space-y-4" data-testid="invoice-context-panel">
      <section className="rounded-lg border border-[var(--color-border)] p-4">
        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
          Workflow diagnostics
        </h3>
        <dl className="mt-3 grid gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--color-muted-foreground)]">Commands</dt>
            <dd>{summary.commandsExecuted}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--color-muted-foreground)]">Events</dt>
            <dd>{summary.eventsRaised}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--color-muted-foreground)]">Successful</dt>
            <dd>{summary.successfulRuns}</dd>
          </div>
        </dl>
      </section>
    </aside>
  );
}
