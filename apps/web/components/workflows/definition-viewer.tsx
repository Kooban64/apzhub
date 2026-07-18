"use client";

import type { ReactNode } from "react";

import type {
  WorkflowDefinitionConnectionViewModel,
  WorkflowDefinitionGraphViewModel,
  WorkflowVersionViewModel,
} from "@/lib/workflows/workflow-types";

export type WorkflowDefinitionSource = {
  readonly graph?: WorkflowDefinitionGraphViewModel;
  readonly variables?: readonly Readonly<Record<string, unknown>>[];
  readonly parameters?: readonly Readonly<Record<string, unknown>>[];
  readonly triggers?: readonly Readonly<Record<string, unknown>>[];
  readonly actions?: readonly Readonly<Record<string, unknown>>[];
  readonly conditions?: readonly Readonly<Record<string, unknown>>[];
  readonly connections?: readonly WorkflowDefinitionConnectionViewModel[];
};

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

function ItemList({
  items,
  labelKey = "label",
}: {
  readonly items: readonly Readonly<Record<string, unknown>>[];
  readonly labelKey?: string;
}) {
  return (
    <ul className="flex flex-col gap-1 text-sm">
      {items.map((item, index) => {
        const id = String(item.id ?? index);
        const kind = item.kind !== undefined ? String(item.kind) : undefined;
        const key = item.key !== undefined ? String(item.key) : undefined;
        const label =
          item[labelKey] !== undefined ? String(item[labelKey]) : (key ?? kind ?? id);
        return (
          <li
            key={id}
            className="rounded border border-[var(--color-border)] bg-[var(--color-muted)]/10 px-2 py-1"
            data-testid={`definition-item-${id}`}
          >
            <span className="font-medium text-[var(--color-foreground)]">{label}</span>
            {kind ? (
              <span className="ml-2 text-[var(--color-muted-foreground)]">{kind}</span>
            ) : null}
            {key && key !== label ? (
              <span className="ml-2 text-[var(--color-muted-foreground)]">{key}</span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function DefinitionViewer({
  definition,
  title = "Definition Viewer",
}: {
  readonly definition: WorkflowDefinitionSource | WorkflowVersionViewModel | null;
  readonly title?: string;
}) {
  if (!definition) {
    return (
      <div
        className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-6 text-center"
        data-testid="definition-viewer-empty"
      >
        <p className="text-sm text-[var(--color-muted-foreground)]">
          No definition metadata available.
        </p>
      </div>
    );
  }

  const triggers = definition.triggers ?? [];
  const actions = definition.actions ?? [];
  const conditions = definition.conditions ?? [];
  const variables = definition.variables ?? [];
  const parameters = definition.parameters ?? [];
  const connections = definition.connections ?? definition.graph?.connections ?? [];
  const graphNodes = definition.graph?.nodes ?? [];

  return (
    <div
      className="flex flex-col gap-3"
      data-testid="definition-viewer"
      aria-label={title}
    >
      <h2 className="text-base font-semibold text-[var(--color-foreground)]">
        {title}
      </h2>
      <div className="grid gap-3 md:grid-cols-2">
        <Section title="Triggers" empty={triggers.length === 0}>
          <ItemList items={triggers} />
        </Section>
        <Section title="Actions" empty={actions.length === 0}>
          <ItemList items={actions} />
        </Section>
        <Section title="Conditions" empty={conditions.length === 0}>
          <ItemList items={conditions} />
        </Section>
        <Section title="Variables" empty={variables.length === 0}>
          <ItemList items={variables} />
        </Section>
        <Section title="Parameters" empty={parameters.length === 0}>
          <ItemList items={parameters} />
        </Section>
        <Section title="Connections" empty={connections.length === 0}>
          <ul className="flex flex-col gap-1 text-sm">
            {connections.map((c, index) => (
              <li
                key={c.id ?? `${c.sourceNodeId}-${c.targetNodeId}-${index}`}
                className="rounded border border-[var(--color-border)] px-2 py-1"
              >
                {c.sourceNodeId} → {c.targetNodeId}
                {c.label ? ` (${c.label})` : ""}
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Graph nodes" empty={graphNodes.length === 0}>
          <ItemList
            items={graphNodes.map((n) => ({
              id: n.id,
              kind: n.kind,
              label: n.label ?? n.id,
            }))}
          />
        </Section>
      </div>
    </div>
  );
}
