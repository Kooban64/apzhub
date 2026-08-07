"use client";

/**
 * W011 S-19 — Policy Simulation confirm/cancel modal.
 */

import { Button } from "@apzhub/ui";

export function PolicySimulationModal({
  open,
  title,
  simulation,
  confirming,
  onConfirm,
  onCancel,
}: {
  readonly open: boolean;
  readonly title: string;
  readonly simulation: Record<string, unknown> | null;
  readonly confirming?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}) {
  if (!open || !simulation) return null;

  const conflicts =
    (simulation.conflicts as
      readonly { code?: string; message?: string }[] | undefined) ?? [];
  const samples = (simulation.sampleProjectIds as readonly string[] | undefined) ?? [];
  const changes =
    (simulation.governanceChanges as
      readonly { field?: string; from?: string; to?: string }[] | undefined) ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      data-testid="policy-simulation-modal"
      onClick={onCancel}
    >
      <div
        className="max-h-[80vh] w-full max-w-lg overflow-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Non-retroactive publish. Confirm only after reviewing impact.
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Portfolios</dt>
            <dd>{String(simulation.affectedPortfolioCount ?? 0)}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Initiatives</dt>
            <dd>{String(simulation.affectedInitiativeCount ?? 0)}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Programmes</dt>
            <dd>{String(simulation.affectedProgrammeCount ?? 0)}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Projects</dt>
            <dd>{String(simulation.affectedProjectCount ?? 0)}</dd>
          </div>
        </dl>
        {conflicts.length > 0 ? (
          <div className="mt-3">
            <p className="text-sm font-medium">Conflicts</p>
            <ul className="mt-1 list-disc pl-5 text-sm">
              {conflicts.map((c, i) => (
                <li key={`${c.code ?? "c"}-${i}`}>{c.message ?? c.code}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {changes.length > 0 ? (
          <div className="mt-3">
            <p className="text-sm font-medium">Governance changes</p>
            <ul className="mt-1 text-sm">
              {changes.map((c, i) => (
                <li key={`${c.field ?? "f"}-${i}`}>
                  {c.field}: {c.from} → {c.to}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {samples.length > 0 ? (
          <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
            Sample projects: {samples.slice(0, 5).join(", ")}
          </p>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={confirming}
            onClick={onConfirm}
            data-testid="policy-simulation-confirm"
          >
            Confirm publish
          </Button>
        </div>
      </div>
    </div>
  );
}
