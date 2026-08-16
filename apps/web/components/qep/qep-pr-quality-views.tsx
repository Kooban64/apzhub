"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { QEP_EARLY_CHECK_ROUTES } from "@/lib/qep/early-check-routes";
import { QEP_QUALITY_JOURNEY_ROUTES } from "@/lib/qep/quality-journey-routes";
import {
  parseQepPrQualityChangeId,
  QEP_PR_QUALITY_ROUTES,
} from "@/lib/qep/pr-quality-routes";
import { SOURCE_ROUTES } from "@/lib/source/routes";

import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
} from "./qep-ui";

type ChangeRow = {
  changeEventId: string;
  kind: string;
  title?: string;
  summary: string;
  branch?: string;
  prNumber?: number;
  externalKey?: string;
  occurredAt: string;
  repositoryId?: string;
  authorLogin?: string;
};

type ImpactBundle = {
  impact: {
    changeEventId: string;
    riskLevel: string;
    summary: string;
    inferredRequirementIds: string[];
    inferredDefectIds: string[];
    matchedSuiteIds: string[];
    nodes: Array<{ nodeId: string; name: string; assetType: string; reason: string }>;
  };
};

type JourneyBundle = {
  journey: {
    changeEventId: string;
    headline: string;
    nextStepId: string;
    impactSummary: {
      riskLevel: string;
      requirementCount: number;
      suiteMatchCount: number;
    };
    designSummary: { draftCount: number; domainGapCount: number };
    evidenceSummary: { domainCount: number; domains: string[] };
    certificationSummary?: {
      evaluationId: string;
      readiness: string;
      score: number;
      humanDecision?: string;
    };
    domainTiles: Array<{
      domainId: string;
      label: string;
      status: string;
      summary: string;
    }>;
    steps: Array<{
      stepId: string;
      title: string;
      status: string;
      href: string;
      actionLabel: string;
      summary: string;
    }>;
  };
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const body = (await response.json()) as {
    data?: T;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  return body.data as T;
}

function isPullLike(change: ChangeRow): boolean {
  return (
    change.kind === "pull_request" ||
    typeof change.prNumber === "number" ||
    change.externalKey?.startsWith("pr:") === true
  );
}

/** Narrow list for PR Quality — prefer pull requests; fall back to all changes. */
function selectPrCandidates(changes: readonly ChangeRow[]): ChangeRow[] {
  const pulls = changes.filter(isPullLike);
  return pulls.length > 0 ? [...pulls] : [...changes];
}

export function QepPrQualityRouterView() {
  const pathname = usePathname() ?? "";
  const changeEventId = parseQepPrQualityChangeId(pathname);
  if (changeEventId) {
    return <PrQualityDetailView changeEventId={changeEventId} />;
  }
  return <PrQualityListView />;
}

function PrQualityListView() {
  const changesQuery = useQuery({
    queryKey: ["qep-pr-quality", "changes"],
    queryFn: () =>
      fetchJson<{ changes: ChangeRow[] }>("/api/v1/qep/scm/changes?limit=80"),
  });

  if (changesQuery.isLoading) {
    return <QepLoadingState label="Loading PR quality candidates…" />;
  }
  if (changesQuery.isError) {
    return <QepErrorState message={(changesQuery.error as Error).message} />;
  }

  const rows = selectPrCandidates(changesQuery.data?.changes ?? []);

  return (
    <QepPageShell
      title="PR Quality"
      description="Signature quality view for a change — risk, impact, verification matrix, and APZQEP assessment. Source browse stays in Shared Source."
      breadcrumbs={["QEP", "PR Quality"]}
      actions={
        <Link
          href={SOURCE_ROUTES.home}
          className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
        >
          Open Source
        </Link>
      }
    >
      <QepPanel title="Changes">
        {rows.length === 0 ? (
          <QepEmptyState title="No change events yet — sync a repository to assess PR quality." />
        ) : (
          <ul
            className="divide-y divide-[var(--color-border)]"
            data-testid="qep-pr-quality-list"
          >
            {rows.map((change) => (
              <li
                key={change.changeEventId}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <Link
                    href={QEP_PR_QUALITY_ROUTES.byChange(change.changeEventId)}
                    className="font-medium hover:underline"
                  >
                    {change.prNumber != null
                      ? `Change #${change.prNumber}`
                      : change.title || change.summary}
                  </Link>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    {change.kind}
                    {change.branch ? ` · ${change.branch}` : ""} · {change.occurredAt}
                    {change.authorLogin ? ` · ${change.authorLogin}` : ""}
                  </p>
                </div>
                <div className="flex gap-2 text-xs">
                  <Link
                    href={QEP_PR_QUALITY_ROUTES.byChange(change.changeEventId)}
                    className="underline"
                  >
                    Assess
                  </Link>
                  <Link
                    href={SOURCE_ROUTES.change(change.changeEventId)}
                    className="text-[var(--color-muted-foreground)] underline"
                  >
                    Source
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </QepPanel>
    </QepPageShell>
  );
}

function PrQualityDetailView({ changeEventId }: { readonly changeEventId: string }) {
  const impactQuery = useQuery({
    queryKey: ["qep-pr-quality", "impact", changeEventId],
    queryFn: () =>
      fetchJson<ImpactBundle>(
        `/api/v1/qep/scm/changes/${encodeURIComponent(changeEventId)}/impact`,
      ),
  });
  const journeyQuery = useQuery({
    queryKey: ["qep-pr-quality", "journey", changeEventId],
    queryFn: () =>
      fetchJson<JourneyBundle>(
        `/api/v1/qep/quality-journey/by-change/${encodeURIComponent(changeEventId)}`,
      ),
  });

  const impact = impactQuery.data?.impact;
  const journey = journeyQuery.data?.journey;
  const loading = impactQuery.isLoading || journeyQuery.isLoading;
  const error =
    (impactQuery.error as Error | null)?.message ||
    (journeyQuery.error as Error | null)?.message;

  return (
    <QepPageShell
      title="PR Quality View"
      description={
        journey?.headline ??
        "Risk · quality impact · verification matrix · APZQEP assessment"
      }
      breadcrumbs={["QEP", "PR Quality", changeEventId]}
      actions={
        <>
          <Link
            href={QEP_PR_QUALITY_ROUTES.home}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
          >
            All changes
          </Link>
          <Link
            href={SOURCE_ROUTES.change(changeEventId)}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
          >
            Source
          </Link>
        </>
      }
    >
      {loading ? <QepLoadingState label="Loading assessment…" /> : null}
      {error ? <QepErrorState message={error} /> : null}

      <div
        className="grid gap-4 lg:grid-cols-[1fr_320px]"
        data-testid="qep-pr-quality-detail"
      >
        <div className="flex flex-col gap-4">
          <QepPanel title="Risk & quality impact">
            {impact ? (
              <>
                <p className="mb-2 text-sm">
                  <QepStatusBadge status={impact.riskLevel} /> {impact.summary}
                </p>
                <dl className="grid gap-2 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">
                      Requirements
                    </dt>
                    <dd>{impact.inferredRequirementIds.length}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">
                      Suites matched
                    </dt>
                    <dd>{impact.matchedSuiteIds.length}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--color-muted-foreground)]">
                      Defects inferred
                    </dt>
                    <dd>{impact.inferredDefectIds.length}</dd>
                  </div>
                </dl>
                {impact.nodes.length > 0 ? (
                  <ul className="mt-3 max-h-48 space-y-1 overflow-auto text-xs">
                    {impact.nodes.slice(0, 24).map((node) => (
                      <li key={node.nodeId}>
                        <span className="font-medium">{node.name}</span>
                        <span className="text-[var(--color-muted-foreground)]">
                          {" "}
                          · {node.assetType} · {node.reason}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </>
            ) : !loading ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Impact unavailable for this change.
              </p>
            ) : null}
          </QepPanel>

          <QepPanel title="Verification matrix">
            {journey?.domainTiles?.length ? (
              <ul className="grid gap-2 sm:grid-cols-2">
                {journey.domainTiles.map((tile) => (
                  <li
                    key={tile.domainId}
                    className="rounded border border-[var(--color-border)] p-3 text-sm"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="font-medium">{tile.label}</span>
                      <QepStatusBadge status={tile.status} />
                    </div>
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      {tile.summary}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                No certification domain tiles yet — run Release Control when evidence is
                attached.
              </p>
            )}
            {journey?.evidenceSummary ? (
              <p className="mt-3 text-xs text-[var(--color-muted-foreground)]">
                Evidence domains: {journey.evidenceSummary.domains.join(", ") || "none"}{" "}
                ({journey.evidenceSummary.domainCount})
              </p>
            ) : null}
          </QepPanel>

          <QepPanel title="APZQEP assessment path">
            {journey ? (
              <ol className="space-y-2">
                {journey.steps.map((step) => (
                  <li
                    key={step.stepId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--color-border)] px-3 py-2 text-sm"
                  >
                    <div>
                      <span className="font-medium">{step.title}</span>
                      <p className="text-xs text-[var(--color-muted-foreground)]">
                        {step.summary}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <QepStatusBadge status={step.status} />
                      <Link href={step.href} className="text-xs underline">
                        {step.actionLabel}
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>
            ) : null}
          </QepPanel>
        </div>

        <div className="flex flex-col gap-4">
          <QepPanel title="Summary">
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Next step</dt>
                <dd className="font-mono text-xs">{journey?.nextStepId ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Certification</dt>
                <dd>
                  {journey?.certificationSummary
                    ? `${journey.certificationSummary.readiness} · score ${journey.certificationSummary.score}`
                    : "Not evaluated"}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Design drafts</dt>
                <dd>{journey?.designSummary.draftCount ?? "—"}</dd>
              </div>
            </dl>
          </QepPanel>
          <QepPanel title="Deep links">
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href={QEP_QUALITY_JOURNEY_ROUTES.byChange(changeEventId)}
                  className="underline"
                >
                  Quality Journey
                </Link>
              </li>
              <li>
                <Link
                  href={QEP_EARLY_CHECK_ROUTES.byChange(changeEventId)}
                  className="underline"
                >
                  Early Check
                </Link>
              </li>
              <li>
                <Link href={SOURCE_ROUTES.change(changeEventId)} className="underline">
                  Shared Source change
                </Link>
              </li>
              <li>
                <Link href="/apzpen/code" className="underline">
                  Security overlay
                </Link>
              </li>
            </ul>
          </QepPanel>
        </div>
      </div>
    </QepPageShell>
  );
}
