"use client";

import { LawInformationCard, LawStatisticsCard, LawStatusCard } from "../ux";
import type { Client } from "../../lib/clients";

export interface ClientContextPanelProps {
  readonly client?: Client;
}

/** Context panel — client summary with placeholder activity and timeline (LAW-002-01). */
export function ClientContextPanel({ client }: ClientContextPanelProps) {
  if (!client) {
    return (
      <aside
        className="flex w-80 shrink-0 flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4"
        data-testid="client-context-panel-empty"
      >
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Select a client to preview summary, activity, and timeline placeholders.
        </p>
      </aside>
    );
  }

  return (
    <aside
      className="flex w-80 shrink-0 flex-col gap-4 border-l border-[var(--color-border)] bg-[var(--color-surface)] p-4"
      data-testid="client-context-panel"
    >
      <LawStatisticsCard label="Client reference" value={client.clientReference} />
      <LawStatusCard
        label="Status"
        status={client.status}
        tone={client.status === "active" ? "success" : "neutral"}
      />
      <LawInformationCard title="Client summary">
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Display name</dt>
            <dd className="font-medium text-[var(--color-foreground)]">
              {client.displayName}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Type</dt>
            <dd className="capitalize text-[var(--color-foreground)]">
              {client.clientType}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Tags</dt>
            <dd className="text-[var(--color-foreground)]">
              {client.tags.length > 0 ? client.tags.join(", ") : "None"}
            </dd>
          </div>
        </dl>
      </LawInformationCard>
      <LawInformationCard title="Activity (placeholder)">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Client opened, created, and edited activities will appear here when wired to
          the Activity framework.
        </p>
      </LawInformationCard>
      <LawInformationCard title="Timeline (placeholder)">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Timeline entries for this client will appear here in a future story.
        </p>
      </LawInformationCard>
    </aside>
  );
}
