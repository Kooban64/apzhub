"use client";

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { fetchContextLearningSummary } from "@/lib/context/learning-api";

function Metric({
  label,
  value,
  testId,
}: {
  readonly label: string;
  readonly value: string;
  readonly testId: string;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] p-3"
      data-testid={testId}
    >
      <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-[var(--color-foreground)]">
        {value}
      </p>
    </div>
  );
}

/** Internal Product Board learning view — no executive dashboard. */
export function ContextLearningSummaryView() {
  const router = useRouter();
  const query = useQuery({
    queryKey: ["context-learning-summary"],
    queryFn: ({ signal }) => fetchContextLearningSummary({ signal }),
  });

  const summary = query.data;

  return (
    <div className="flex flex-col gap-6 p-1" data-testid="context-learning-summary">
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
          Product Learning
        </p>
        <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">
          Enterprise Context
        </h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Pilot evidence for Product Board investment decisions. Interaction events only
          — no document or project contents.
        </p>
      </header>

      {query.isLoading ? (
        <p role="status" data-testid="context-learning-loading">
          Loading learning summary…
        </p>
      ) : null}

      {query.isError ? (
        <p
          className="text-sm text-[var(--color-destructive)]"
          data-testid="context-learning-error"
        >
          Unable to load learning summary.
        </p>
      ) : null}

      {summary ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Metric
              label="Most-used section"
              value={summary.mostUsedSection ?? "—"}
              testId="learning-most-used"
            />
            <Metric
              label="Least-used section"
              value={summary.leastUsedSection ?? "—"}
              testId="learning-least-used"
            />
            <Metric
              label="Average context load"
              value={
                summary.averageLoadMs !== null ? `${summary.averageLoadMs} ms` : "—"
              }
              testId="learning-avg-load"
            />
            <Metric
              label="Helpful"
              value={String(summary.helpful)}
              testId="learning-helpful"
            />
            <Metric
              label="Not helpful"
              value={String(summary.notHelpful)}
              testId="learning-not-helpful"
            />
            <Metric
              label="Helpful ratio"
              value={
                summary.helpfulRatio !== null
                  ? `${Math.round(summary.helpfulRatio * 100)}%`
                  : "—"
              }
              testId="learning-helpful-ratio"
            />
            <Metric
              label="Panel opened"
              value={String(summary.panelOpened)}
              testId="learning-panel-opened"
            />
            <Metric
              label="Avg time visible"
              value={
                summary.averageVisibleMs !== null
                  ? `${summary.averageVisibleMs} ms`
                  : "—"
              }
              testId="learning-avg-visible"
            />
            <Metric
              label="Missing provider responses"
              value={String(summary.missingProviderResponses)}
              testId="learning-missing-providers"
            />
          </div>

          <section data-testid="learning-section-views">
            <h2 className="text-sm font-semibold">Section views</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {Object.entries(summary.sectionViews).map(([section, count]) => (
                <li key={section}>
                  {section}: {count}
                </li>
              ))}
            </ul>
          </section>

          <section data-testid="learning-link-follow">
            <h2 className="text-sm font-semibold">Context link follow-through</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {Object.keys(summary.linkFollowThrough).length === 0 ? (
                <li className="text-[var(--color-muted-foreground)]">No follows yet</li>
              ) : (
                Object.entries(summary.linkFollowThrough).map(([product, count]) => (
                  <li key={product}>
                    {product}: {count}
                  </li>
                ))
              )}
            </ul>
          </section>

          <div className="flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-4">
            <Button
              type="button"
              size="sm"
              data-testid="learning-create-friction"
              onClick={() =>
                router.push(
                  "/workspace/administration/friction-register?view=create&source=context_learning",
                )
              }
            >
              Record friction from Context Learning
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push("/workspace/administration/friction-register")}
            >
              Open Friction Register
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
