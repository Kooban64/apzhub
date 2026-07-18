"use client";

import { useMemo } from "react";

import type { WorkflowVersionViewModel } from "@/lib/workflows/workflow-types";

export type VersionDiffResult = {
  readonly addedNodes: readonly string[];
  readonly removedNodes: readonly string[];
  readonly changedParameters: readonly string[];
  readonly addedParameters: readonly string[];
  readonly removedParameters: readonly string[];
  readonly addedVariables: readonly string[];
  readonly removedVariables: readonly string[];
  readonly lifecycleDifferences: readonly string[];
  readonly validationDifferences: readonly string[];
  readonly metadataDifferences: readonly string[];
};

function paramKey(item: Readonly<Record<string, unknown>>): string {
  return String(item.key ?? item.id ?? JSON.stringify(item));
}

function paramSnapshot(item: Readonly<Record<string, unknown>>): string {
  return JSON.stringify(item);
}

export function compareWorkflowVersions(
  left: WorkflowVersionViewModel | null | undefined,
  right: WorkflowVersionViewModel | null | undefined,
): VersionDiffResult {
  const leftNodes = new Set((left?.graph?.nodes ?? []).map((n) => n.id));
  const rightNodes = new Set((right?.graph?.nodes ?? []).map((n) => n.id));

  const leftParamMap = new Map(
    (left?.parameters ?? []).map((p) => [paramKey(p), paramSnapshot(p)]),
  );
  const rightParamMap = new Map(
    (right?.parameters ?? []).map((p) => [paramKey(p), paramSnapshot(p)]),
  );
  const leftParams = new Set(leftParamMap.keys());
  const rightParams = new Set(rightParamMap.keys());

  const leftVars = new Set((left?.variables ?? []).map(paramKey));
  const rightVars = new Set((right?.variables ?? []).map(paramKey));

  const changedParameters = [...leftParams]
    .filter((key) => rightParams.has(key))
    .filter((key) => leftParamMap.get(key) !== rightParamMap.get(key));

  const lifecycleDifferences: string[] = [];
  if (left && right && left.lifecycle !== right.lifecycle) {
    lifecycleDifferences.push(`${left.lifecycle} → ${right.lifecycle}`);
  }
  if (left && right && left.status !== right.status) {
    lifecycleDifferences.push(`status: ${left.status} → ${right.status}`);
  }

  const validationDifferences: string[] = [];
  if (left && right && left.status !== right.status) {
    validationDifferences.push(`publication status: ${left.status} → ${right.status}`);
  }

  const metadataDifferences: string[] = [];
  if (left && right) {
    if (left.changeSummary !== right.changeSummary) {
      metadataDifferences.push("changeSummary");
    }
    if (left.createdBy !== right.createdBy) {
      metadataDifferences.push("createdBy");
    }
    if (left.versionNumber !== right.versionNumber) {
      metadataDifferences.push(
        `versionNumber: ${left.versionNumber} → ${right.versionNumber}`,
      );
    }
  }

  return {
    addedNodes: [...rightNodes].filter((id) => !leftNodes.has(id)),
    removedNodes: [...leftNodes].filter((id) => !rightNodes.has(id)),
    changedParameters,
    addedParameters: [...rightParams].filter((k) => !leftParams.has(k)),
    removedParameters: [...leftParams].filter((k) => !rightParams.has(k)),
    addedVariables: [...rightVars].filter((k) => !leftVars.has(k)),
    removedVariables: [...leftVars].filter((k) => !rightVars.has(k)),
    lifecycleDifferences,
    validationDifferences,
    metadataDifferences,
  };
}

function DiffList({
  title,
  added,
  removed,
  changed,
}: {
  readonly title: string;
  readonly added?: readonly string[];
  readonly removed?: readonly string[];
  readonly changed?: readonly string[];
}) {
  return (
    <section
      className="rounded-lg border border-[var(--color-border)] p-3"
      aria-label={title}
    >
      <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{title}</h3>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {added !== undefined ? (
          <div>
            <p className="text-xs font-medium uppercase text-[var(--color-muted-foreground)]">
              Added
            </p>
            {added.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">None</p>
            ) : (
              <ul className="mt-1 text-sm text-[var(--color-foreground)]">
                {added.map((item) => (
                  <li key={`add-${item}`} data-testid={`diff-added-${item}`}>
                    + {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
        {removed !== undefined ? (
          <div>
            <p className="text-xs font-medium uppercase text-[var(--color-muted-foreground)]">
              Removed
            </p>
            {removed.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">None</p>
            ) : (
              <ul className="mt-1 text-sm text-[var(--color-foreground)]">
                {removed.map((item) => (
                  <li key={`rm-${item}`} data-testid={`diff-removed-${item}`}>
                    − {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
        {changed !== undefined ? (
          <div className="sm:col-span-2">
            <p className="text-xs font-medium uppercase text-[var(--color-muted-foreground)]">
              Changed
            </p>
            {changed.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">None</p>
            ) : (
              <ul className="mt-1 text-sm text-[var(--color-foreground)]">
                {changed.map((item) => (
                  <li key={`chg-${item}`} data-testid={`diff-changed-${item}`}>
                    ~ {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SimpleDiffList({
  title,
  items,
  testIdPrefix,
}: {
  readonly title: string;
  readonly items: readonly string[];
  readonly testIdPrefix: string;
}) {
  return (
    <section
      className="rounded-lg border border-[var(--color-border)] p-3"
      aria-label={title}
    >
      <h3 className="text-sm font-semibold text-[var(--color-foreground)]">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">None</p>
      ) : (
        <ul className="mt-2 text-sm text-[var(--color-foreground)]">
          {items.map((item) => (
            <li key={`${testIdPrefix}-${item}`} data-testid={`${testIdPrefix}-${item}`}>
              {item}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function VersionCompare({
  left,
  right,
}: {
  readonly left: WorkflowVersionViewModel | null | undefined;
  readonly right: WorkflowVersionViewModel | null | undefined;
}) {
  const diff = useMemo(() => compareWorkflowVersions(left, right), [left, right]);

  if (!left || !right) {
    return (
      <div
        className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-6 text-center"
        data-testid="version-compare-empty"
      >
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Select two versions to compare definition metadata.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-3"
      data-testid="version-compare"
      aria-label="Version comparison"
    >
      <h2 className="text-base font-semibold text-[var(--color-foreground)]">
        Compare v{left.versionNumber} → v{right.versionNumber}
      </h2>
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Read-only node and parameter diff — no merge, rollback, or edit.
      </p>
      <DiffList title="Nodes" added={diff.addedNodes} removed={diff.removedNodes} />
      <DiffList
        title="Parameters"
        added={diff.addedParameters}
        removed={diff.removedParameters}
        changed={diff.changedParameters}
      />
      <DiffList
        title="Variables"
        added={diff.addedVariables}
        removed={diff.removedVariables}
      />
      <SimpleDiffList
        title="Lifecycle differences"
        items={diff.lifecycleDifferences}
        testIdPrefix="diff-lifecycle"
      />
      <SimpleDiffList
        title="Validation differences"
        items={diff.validationDifferences}
        testIdPrefix="diff-validation"
      />
      <SimpleDiffList
        title="Metadata differences"
        items={diff.metadataDifferences}
        testIdPrefix="diff-metadata"
      />
    </div>
  );
}
