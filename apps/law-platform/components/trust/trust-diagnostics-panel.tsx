"use client";

import { useMemo } from "react";

import { LawInformationCard, lawUxTokens } from "../ux";
import { useTrustWorkflow } from "../../lib/trust/trust-workflow-context";

export interface TrustDiagnosticsPanelProps {
  readonly compact?: boolean;
}

/** Session diagnostics across trust engine layers (LAW-015-09). */
export function TrustDiagnosticsPanel({ compact = false }: TrustDiagnosticsPanelProps) {
  const workflow = useTrustWorkflow();
  const diagnostics = useMemo(() => workflow.getDiagnosticsSnapshot(), [workflow]);
  const reportingSummary = useMemo(() => {
    const bundle = workflow.getBundle();
    return bundle.reportingService.getEventBus().listEvents().length;
  }, [workflow]);

  return (
    <div data-testid="trust-diagnostics-panel">
      <LawInformationCard title={compact ? "Diagnostics" : "Trust engine diagnostics"}>
        <div
          className={`grid gap-3 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-4"}`}
        >
          {(
            [
              ["Ledger runs", diagnostics.ledgerRuns],
              ["Workflow runs", diagnostics.workflowRuns],
              ["Allocation runs", diagnostics.allocationRuns],
              ["Reconciliation runs", diagnostics.reconciliationRuns],
              ["Interest runs", diagnostics.interestRuns],
              ["Transfer runs", diagnostics.transferRuns],
              ["Reporting runs", diagnostics.reportingRuns],
              ["Report events", reportingSummary],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className={`${lawUxTokens.surface} rounded-md border px-3 py-2`}
            >
              <p className="text-xs text-[var(--color-muted-foreground)]">{label}</p>
              <p className="text-lg font-semibold text-[var(--color-foreground)]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </LawInformationCard>
    </div>
  );
}
