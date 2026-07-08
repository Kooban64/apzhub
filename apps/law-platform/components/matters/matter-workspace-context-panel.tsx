"use client";

import { LawInformationCard, LawStatisticsCard, LawStatusCard } from "../ux";
import type { MatterWorkspaceSnapshot } from "../../lib/matters/matter-workspace-composition";
import { getMatterWorkflowDiagnostics } from "../../lib/matters/matter-workflow-diagnostics";

export interface MatterWorkspaceContextPanelProps {
  readonly snapshot?: MatterWorkspaceSnapshot;
}

/** Matter workspace context panel — diagnostics and related entities (LAW-009-01). */
export function MatterWorkspaceContextPanel({
  snapshot,
}: MatterWorkspaceContextPanelProps) {
  const diagnostics = getMatterWorkflowDiagnostics().getSummary();

  if (!snapshot) {
    return (
      <aside
        className="flex w-80 shrink-0 flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        data-testid="matter-workspace-context-panel-empty"
      >
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Matter workspace context will appear when a matter is loaded.
        </p>
      </aside>
    );
  }

  return (
    <aside
      className="flex w-80 shrink-0 flex-col gap-4 border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4"
      data-testid="matter-workspace-context-panel"
    >
      <LawStatisticsCard
        label="Matter reference"
        value={snapshot.matter.matterReference}
      />
      <LawStatusCard label="Status" status={snapshot.matter.status} tone="success" />
      <LawInformationCard title="Related entities">
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Documents</dt>
            <dd>{snapshot.relatedEntityCounts.documents}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Tasks</dt>
            <dd>{snapshot.relatedEntityCounts.tasks}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Time entries</dt>
            <dd>{snapshot.relatedEntityCounts.timeEntries}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Calendar events</dt>
            <dd>{snapshot.relatedEntityCounts.calendarEvents}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Invoices</dt>
            <dd>{snapshot.relatedEntityCounts.invoices}</dd>
          </div>
        </dl>
      </LawInformationCard>
      <LawInformationCard title="Workspace diagnostics">
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Workflow runs</dt>
            <dd>{diagnostics.totalRuns}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Events raised</dt>
            <dd>{diagnostics.eventsRaised}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Last refreshed</dt>
            <dd>{new Date(snapshot.refreshedAt).toLocaleString()}</dd>
          </div>
        </dl>
      </LawInformationCard>
      <LawInformationCard title="Recent activity summary">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Activity timeline entries are sourced from the Activity Framework shell panel
          and in-page summary below — no duplicate timeline store.
        </p>
      </LawInformationCard>
    </aside>
  );
}
