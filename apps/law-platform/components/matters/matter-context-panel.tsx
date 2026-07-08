"use client";

import { LawInformationCard, LawStatisticsCard, LawStatusCard } from "../ux";
import {
  getClientDisplayName,
  getLeadAttorneyLabel,
  getMatterStatusLabel,
  getMatterTypeLabel,
  getPracticeAreaLabel,
  type Matter,
} from "../../lib/matters";

export interface MatterContextPanelProps {
  readonly matter?: Matter;
}

/** Context panel — matter summary with placeholder activity and timeline (LAW-003-01). */
export function MatterContextPanel({ matter }: MatterContextPanelProps) {
  if (!matter) {
    return (
      <aside
        className="flex w-80 shrink-0 flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        data-testid="matter-context-panel-empty"
      >
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Select a matter to preview summary, activity, and timeline placeholders.
        </p>
      </aside>
    );
  }

  return (
    <aside
      className="flex w-80 shrink-0 flex-col gap-4 border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4"
      data-testid="matter-context-panel"
    >
      <LawStatisticsCard label="Matter reference" value={matter.matterReference} />
      <LawStatusCard
        label="Status"
        status={getMatterStatusLabel(matter.matterStatus)}
        tone={matter.matterStatus === "open" ? "success" : "neutral"}
      />
      <LawInformationCard title="Matter summary">
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Title</dt>
            <dd className="font-medium text-[var(--color-foreground)]">
              {matter.title}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Client</dt>
            <dd className="text-[var(--color-foreground)]">
              {getClientDisplayName(matter.clientId)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Matter type</dt>
            <dd className="text-[var(--color-foreground)]">
              {getMatterTypeLabel(matter.matterTypeId)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Practice area</dt>
            <dd className="text-[var(--color-foreground)]">
              {getPracticeAreaLabel(matter.practiceAreaId)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Priority</dt>
            <dd className="capitalize text-[var(--color-foreground)]">
              {matter.priority}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Lead attorney</dt>
            <dd className="text-[var(--color-foreground)]">
              {getLeadAttorneyLabel(matter.leadAttorneyId)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Tags</dt>
            <dd className="text-[var(--color-foreground)]">
              {matter.tags.length > 0 ? matter.tags.join(", ") : "None"}
            </dd>
          </div>
        </dl>
      </LawInformationCard>
      <LawInformationCard title="Activity (placeholder)">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Matter opened, created, and edited activities will appear here when wired to
          the Activity framework.
        </p>
      </LawInformationCard>
      <LawInformationCard title="Timeline (placeholder)">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Timeline entries for this matter will appear here in a future story.
        </p>
      </LawInformationCard>
    </aside>
  );
}
