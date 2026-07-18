"use client";

import type { ReactNode } from "react";

import type { WorkflowEngineWorkflowViewModel } from "@/lib/workflows/engine-types";

/**
 * Read-only engine definition viewer (APZWORKFLOW-009).
 * Engine HTTP returns metadata counts — not editable graph payloads.
 */
export function EngineDefinitionViewer({
  workflow,
}: {
  readonly workflow: WorkflowEngineWorkflowViewModel;
}) {
  return (
    <div
      className="flex flex-col gap-3"
      data-testid="engine-definition-viewer"
      aria-label="Workflow engine definition"
    >
      <p className="rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
        Read-only engine — definition metadata only
      </p>

      <Section title="Metadata">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <Meta label="ID" value={workflow.id} />
          <Meta label="Name" value={workflow.name} />
          <Meta label="Active" value={workflow.active ? "yes" : "no"} />
          <Meta label="Version hint" value={workflow.versionHint ?? "—"} />
          <Meta label="Engine" value={workflow.engine} />
          <Meta label="Updated" value={workflow.updatedAt ?? "—"} />
        </dl>
      </Section>

      <Section title="Nodes">
        <CountLine
          label="Node count"
          count={workflow.nodeCount}
          note="Node payloads are not exposed by the engine metadata API."
        />
      </Section>

      <Section title="Connections">
        <CountLine
          label="Connection count"
          count={workflow.connectionCount}
          note="Connection payloads are not exposed by the engine metadata API."
        />
      </Section>

      <Section title="Triggers" empty={workflow.nodeCount < 1}>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Trigger detail is not returned by the read-only engine client.
        </p>
      </Section>

      <Section title="Actions" empty={workflow.nodeCount < 1}>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Action detail is not returned by the read-only engine client.
        </p>
      </Section>

      <Section title="Conditions">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Condition detail is not returned by the read-only engine client.
        </p>
      </Section>

      <Section title="Variables">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Runtime variables are never exposed (metadata-only security boundary).
        </p>
      </Section>

      <Section title="Tags" empty={workflow.tagNames.length === 0}>
        <ul className="flex flex-wrap gap-2">
          {workflow.tagNames.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-foreground)]"
              data-testid={`engine-definition-tag-${tag}`}
            >
              {tag}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
  empty,
}: {
  readonly title: string;
  readonly children: ReactNode;
  readonly empty?: boolean;
}) {
  return (
    <section
      className="rounded-lg border border-[var(--color-border)] p-3"
      aria-label={title}
    >
      <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{title}</h3>
      {empty ? (
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">None</p>
      ) : (
        <div className="mt-2">{children}</div>
      )}
    </section>
  );
}

function Meta({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {label}
      </dt>
      <dd className="font-medium text-[var(--color-foreground)]">{value}</dd>
    </div>
  );
}

function CountLine({
  label,
  count,
  note,
}: {
  readonly label: string;
  readonly count: number;
  readonly note: string;
}) {
  return (
    <div className="text-sm">
      <p className="font-medium text-[var(--color-foreground)]">
        {label}: {count}
      </p>
      <p className="mt-1 text-[var(--color-muted-foreground)]">{note}</p>
    </div>
  );
}
