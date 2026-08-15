"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

import { QEP_CERTIFICATION_ROUTES } from "@/lib/qep/certification-routes";
import { QEP_QUALITY_JOURNEY_ROUTES } from "@/lib/qep/quality-journey-routes";
import {
  QEP_EVIDENCE_ROUTES,
  QEP_QI_ROUTES,
  QEP_SCM_ROUTES,
  parseQepQiRecommendationId,
} from "@/lib/qep/routes";
import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
  QepTable,
} from "./qep-ui";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json()) as { data?: T; error?: { message?: string } };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  return body.data as T;
}

export function QepQualityIntelligenceRouterView() {
  const pathname = usePathname() ?? "";
  const recommendationId = parseQepQiRecommendationId(pathname);

  if (pathname.includes("/providers")) {
    return <ProvidersView />;
  }
  if (pathname.includes("/signals")) {
    return <SignalsView />;
  }
  if (pathname.includes("/observations")) {
    return <ObservationsView />;
  }
  if (pathname.includes("/scores")) {
    return <ScoresView />;
  }
  if (pathname.includes("/history")) {
    return <HistoryView />;
  }
  if (pathname.includes("/confidence")) {
    return <ConfidenceView />;
  }
  if (recommendationId) {
    return <RecommendationDetailView recommendationId={recommendationId} />;
  }
  return <QiHomeView />;
}

type QiAdviceItem = {
  adviceId: string;
  kind: string;
  priority: string;
  summary: string;
  explanation: {
    reason: string;
    decisionPath: string[];
    artifacts: Array<{ kind: string; ref: string; label: string }>;
  };
  advisory: true;
};

function QiHomeView() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [changeEventId, setChangeEventId] = useState(
    searchParams?.get("changeEventId") ?? "",
  );

  const adviceQuery = useQuery({
    queryKey: ["qep-qi", "by-change", changeEventId.trim()],
    enabled: changeEventId.trim().length > 8,
    queryFn: () =>
      fetchJson<{
        changeEventId: string;
        advisory: true;
        impactSummary?: {
          riskLevel: string;
          requirementCount: number;
          suiteMatchCount: number;
          nodeCount: number;
          repositoryId?: string;
        };
        certificationSummary?: {
          evaluationId: string;
          readiness: string;
          score: number;
          humanDecision?: string;
        };
        advice: QiAdviceItem[];
      }>(
        `/api/v1/qep/quality-intelligence/by-change/${encodeURIComponent(changeEventId.trim())}`,
      ),
  });

  const recommendationsQuery = useQuery({
    queryKey: ["qep-qi", "recommendations"],
    queryFn: () =>
      fetchJson<{
        recommendations: Array<{
          recommendationId: string;
          type: string;
          priority: string;
          reason: string;
          status: string;
          providerId: string;
          confidence: { level: string; numeric: number };
        }>;
      }>("/api/v1/qep/quality-intelligence/recommendations"),
  });

  const seedAndAnalyze = useMutation({
    mutationFn: async () => {
      const correlationId = crypto.randomUUID();
      await fetchJson("/api/v1/qep/quality-intelligence/observations", {
        method: "POST",
        body: JSON.stringify({
          source: "evidence",
          kind: "evidence.gap",
          summary: "Missing evidence pack for release candidate",
          severity: "warning",
          correlationId,
        }),
      });
      await fetchJson("/api/v1/qep/quality-intelligence/observations", {
        method: "POST",
        body: JSON.stringify({
          source: "automation",
          kind: "automation.failure",
          summary: "Automation failures concentrated in critical path",
          severity: "critical",
          correlationId,
        }),
      });
      await fetchJson("/api/v1/qep/quality-intelligence/observations", {
        method: "POST",
        body: JSON.stringify({
          source: "scm",
          kind: "scm.churn",
          summary: "Elevated repository change activity",
          severity: "info",
          correlationId,
        }),
      });
      return fetchJson("/api/v1/qep/quality-intelligence/analyze", {
        method: "POST",
        body: JSON.stringify({ correlationId }),
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["qep-qi"] });
    },
  });

  const recommendations = recommendationsQuery.data?.recommendations ?? [];
  const advice = adviceQuery.data?.advice ?? [];

  return (
    <QepPageShell
      title="Quality Intelligence"
      description="Flagship F6 — engineering advice grounded in quality graph + evidence. Advisory only; never certifies and never auto-approves a release."
      actions={
        <Button
          type="button"
          variant="outline"
          onClick={() => seedAndAnalyze.mutate()}
          disabled={seedAndAnalyze.isPending}
          title="Dev/demo seed path — not the F6 change-grounded advisor"
        >
          {seedAndAnalyze.isPending ? "Analysing…" : "Seed demo observations"}
        </Button>
      }
    >
      <div
        data-testid="qep-qi-advisory-banner"
        role="status"
        className="rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/50 px-4 py-3 text-sm text-[var(--color-foreground)]"
      >
        Advisory only — Quality Intelligence never certifies and never auto-approves a
        release.
      </div>

      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <Link href={QEP_QI_ROUTES.recommendations}>Recommendations</Link>
        <Link href={QEP_QI_ROUTES.signals}>Signals</Link>
        <Link href={QEP_QI_ROUTES.observations}>Observations</Link>
        <Link href={QEP_QI_ROUTES.scores}>Scores</Link>
        <Link href={QEP_QI_ROUTES.confidence}>Confidence</Link>
        <Link href={QEP_QI_ROUTES.history}>History</Link>
        <Link href={QEP_QI_ROUTES.providers}>Providers</Link>
      </div>

      <QepPanel title="Advise this change (F6)">
        <label className="mb-2 block text-sm">
          changeEventId
          <input
            className="mt-1 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 font-mono text-xs"
            value={changeEventId}
            onChange={(event) => setChangeEventId(event.target.value)}
            placeholder="chg-github-…"
            data-testid="qep-qi-change-event-id"
          />
        </label>
        {adviceQuery.isFetching ? (
          <QepLoadingState label="Composing advice…" />
        ) : adviceQuery.isError ? (
          <QepErrorState message={(adviceQuery.error as Error).message} />
        ) : adviceQuery.data ? (
          <div className="space-y-3" data-testid="qep-qi-advice-bundle">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Impact risk {adviceQuery.data.impactSummary?.riskLevel ?? "—"} · cert{" "}
              {adviceQuery.data.certificationSummary
                ? `${adviceQuery.data.certificationSummary.readiness} ${adviceQuery.data.certificationSummary.score}%`
                : "none"}
              {adviceQuery.data.certificationSummary?.humanDecision
                ? ` · human ${adviceQuery.data.certificationSummary.humanDecision}`
                : ""}
              {adviceQuery.data.certificationSummary?.evaluationId ? (
                <>
                  {" "}
                  ·{" "}
                  <Link
                    href={QEP_CERTIFICATION_ROUTES.rcEvaluation(
                      adviceQuery.data.certificationSummary.evaluationId,
                    )}
                  >
                    Open RC
                  </Link>
                </>
              ) : null}
              {adviceQuery.data.impactSummary?.repositoryId ? (
                <>
                  {" "}
                  ·{" "}
                  <Link
                    href={QEP_SCM_ROUTES.designAssist(
                      adviceQuery.data.impactSummary.repositoryId,
                      adviceQuery.data.changeEventId,
                    )}
                    data-testid="qep-qi-propose-design-link"
                  >
                    Propose test design
                  </Link>
                </>
              ) : null}
              <>
                {" "}
                ·{" "}
                <Link
                  href={QEP_QUALITY_JOURNEY_ROUTES.byChange(
                    adviceQuery.data.changeEventId,
                  )}
                  data-testid="qep-qi-journey-link"
                >
                  Open journey
                </Link>
              </>
              <span className="ml-1">· advisory only</span>
            </p>
            {advice.length === 0 ? (
              <QepEmptyState title="No advisory items — change looks clean for current gates." />
            ) : (
              <ul className="space-y-3">
                {advice.map((item) => (
                  <li
                    key={item.adviceId}
                    className="rounded-md border border-[var(--color-border)] p-3 text-sm"
                    data-testid={`qep-qi-advice-${item.kind}`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <QepStatusBadge status={item.kind} />
                      <QepStatusBadge status={item.priority} />
                      <span className="font-medium">{item.summary}</span>
                    </div>
                    <p className="mt-1 text-[var(--color-muted-foreground)]">
                      {item.explanation.reason}
                    </p>
                    <p className="mt-1 font-mono text-xs text-[var(--color-muted-foreground)]">
                      {item.explanation.decisionPath.join(" → ")}
                    </p>
                    {item.explanation.artifacts.length > 0 ? (
                      <ul className="mt-2 list-disc pl-5 text-xs">
                        {item.explanation.artifacts.slice(0, 8).map((artifact) => (
                          <li key={`${artifact.kind}:${artifact.ref}`}>
                            {artifact.ref.startsWith("evidence://") ? (
                              <Link
                                href={QEP_EVIDENCE_ROUTES.detail(
                                  artifact.ref.replace("evidence://", ""),
                                )}
                              >
                                {artifact.label}
                              </Link>
                            ) : artifact.ref.startsWith("design-assist://") &&
                              adviceQuery.data?.impactSummary?.repositoryId ? (
                              <Link
                                href={QEP_SCM_ROUTES.designAssist(
                                  adviceQuery.data.impactSummary.repositoryId,
                                  adviceQuery.data.changeEventId,
                                )}
                              >
                                {artifact.label}
                              </Link>
                            ) : (
                              <span>
                                {artifact.kind}: {artifact.label}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Enter a changeEventId (or open from RC) to get gap / risk / regression /
            blocker advice with artifact links.
          </p>
        )}
      </QepPanel>

      <QepPanel title="Provider recommendations (engine store)">
        {recommendationsQuery.isLoading ? (
          <QepLoadingState label="Loading recommendations…" />
        ) : recommendationsQuery.isError ? (
          <QepErrorState message={(recommendationsQuery.error as Error).message} />
        ) : recommendations.length === 0 ? (
          <QepEmptyState title="No engine recommendations yet — optional demo seed above." />
        ) : (
          <QepTable
            caption="Recommendations"
            columns={["Type", "Priority", "Provider", "Confidence", "Status", "Reason"]}
            rows={recommendations.map((item) => ({
              id: item.recommendationId,
              href: QEP_QI_ROUTES.recommendation(item.recommendationId),
              cells: [
                item.type,
                item.priority,
                item.providerId,
                `${item.confidence.level} (${item.confidence.numeric})`,
                <QepStatusBadge key="st" status={item.status} />,
                item.reason,
              ],
            }))}
          />
        )}
      </QepPanel>
    </QepPageShell>
  );
}

function ProvidersView() {
  const query = useQuery({
    queryKey: ["qep-qi", "providers"],
    queryFn: () =>
      fetchJson<{
        providers: Array<{
          providerId: string;
          name: string;
          kind: string;
          status: string;
          capabilities: string[];
        }>;
      }>("/api/v1/qep/quality-intelligence/providers"),
  });

  if (query.isLoading) return <QepLoadingState label="Loading providers…" />;
  if (query.isError) {
    return <QepErrorState message={(query.error as Error).message} />;
  }

  return (
    <QepPageShell
      title="Intelligence providers"
      description="Active foundation providers and future AI placeholders"
    >
      <div className="mb-4 text-sm">
        <Link href={QEP_QI_ROUTES.home}>← Quality Intelligence</Link>
      </div>
      <QepPanel title="Provider registry">
        <QepTable
          caption="Providers"
          columns={["Provider", "Kind", "Status", "Capabilities"]}
          rows={(query.data?.providers ?? []).map((provider) => ({
            id: provider.providerId,
            cells: [
              provider.name,
              provider.kind,
              <QepStatusBadge key="st" status={provider.status} />,
              provider.capabilities.join(", "),
            ],
          }))}
        />
      </QepPanel>
    </QepPageShell>
  );
}

function SignalsView() {
  const query = useQuery({
    queryKey: ["qep-qi", "signals"],
    queryFn: () =>
      fetchJson<{
        signals: Array<{
          signalId: string;
          kind: string;
          value: number;
          trend?: string;
          summary: string;
        }>;
      }>("/api/v1/qep/quality-intelligence/signals"),
  });

  if (query.isLoading) return <QepLoadingState label="Loading signals…" />;
  if (query.isError) {
    return <QepErrorState message={(query.error as Error).message} />;
  }

  const signals = query.data?.signals ?? [];

  return (
    <QepPageShell
      title="Quality signals"
      description="Derived from immutable observations"
    >
      <div className="mb-4 text-sm">
        <Link href={QEP_QI_ROUTES.home}>← Quality Intelligence</Link>
      </div>
      <QepPanel title="Signals">
        {signals.length === 0 ? (
          <QepEmptyState title="No signals yet." />
        ) : (
          <QepTable
            caption="Signals"
            columns={["Kind", "Value", "Trend", "Summary"]}
            rows={signals.map((signal) => ({
              id: signal.signalId,
              cells: [
                signal.kind,
                String(signal.value),
                signal.trend ?? "—",
                signal.summary,
              ],
            }))}
          />
        )}
      </QepPanel>
    </QepPageShell>
  );
}

function ObservationsView() {
  const query = useQuery({
    queryKey: ["qep-qi", "observations"],
    queryFn: () =>
      fetchJson<{
        observations: Array<{
          observationId: string;
          source: string;
          kind: string;
          summary: string;
          severity?: string;
          recordedAt: string;
        }>;
      }>("/api/v1/qep/quality-intelligence/observations"),
  });

  if (query.isLoading) return <QepLoadingState label="Loading observations…" />;
  if (query.isError) {
    return <QepErrorState message={(query.error as Error).message} />;
  }

  const observations = query.data?.observations ?? [];

  return (
    <QepPageShell title="Observations" description="Immutable quality facts">
      <div className="mb-4 text-sm">
        <Link href={QEP_QI_ROUTES.home}>← Quality Intelligence</Link>
      </div>
      <QepPanel title="Observation log">
        {observations.length === 0 ? (
          <QepEmptyState title="No observations recorded." />
        ) : (
          <QepTable
            caption="Observations"
            columns={["When", "Source", "Kind", "Severity", "Summary"]}
            rows={observations.map((observation) => ({
              id: observation.observationId,
              cells: [
                observation.recordedAt,
                observation.source,
                observation.kind,
                observation.severity ?? "—",
                observation.summary,
              ],
            }))}
          />
        )}
      </QepPanel>
    </QepPageShell>
  );
}

function ScoresView() {
  const query = useQuery({
    queryKey: ["qep-qi", "scores"],
    queryFn: () =>
      fetchJson<{
        scores: Array<{
          scoreId: string;
          dimension: string;
          value: number;
          calculatedAt: string;
          providerIds: string[];
        }>;
      }>("/api/v1/qep/quality-intelligence/scores"),
  });

  if (query.isLoading) return <QepLoadingState label="Loading scores…" />;
  if (query.isError) {
    return <QepErrorState message={(query.error as Error).message} />;
  }

  const scores = query.data?.scores ?? [];

  return (
    <QepPageShell
      title="Quality scores"
      description="Derived scores — not manually editable"
    >
      <div className="mb-4 text-sm">
        <Link href={QEP_QI_ROUTES.home}>← Quality Intelligence</Link>
      </div>
      <QepPanel title="Scores">
        {scores.length === 0 ? (
          <QepEmptyState title="No scores yet — run analysis." />
        ) : (
          <QepTable
            caption="Scores"
            columns={["Dimension", "Value", "Providers", "Calculated"]}
            rows={scores.map((score) => ({
              id: score.scoreId,
              cells: [
                score.dimension,
                String(score.value),
                score.providerIds.join(", ") || "—",
                score.calculatedAt,
              ],
            }))}
          />
        )}
      </QepPanel>
    </QepPageShell>
  );
}

function HistoryView() {
  const query = useQuery({
    queryKey: ["qep-qi", "history"],
    queryFn: () =>
      fetchJson<{
        history: Array<{
          recommendationId: string;
          type: string;
          status: string;
          providerId: string;
          confidenceLevel: string;
          confidenceNumeric: number;
          proposedAt: string;
          updatedAt: string;
          actedBy?: string;
          reason: string;
        }>;
      }>("/api/v1/qep/quality-intelligence/history"),
  });

  if (query.isLoading) return <QepLoadingState label="Loading history…" />;
  if (query.isError) {
    return <QepErrorState message={(query.error as Error).message} />;
  }

  const history = query.data?.history ?? [];

  return (
    <QepPageShell
      title="Recommendation history"
      description="Lifecycle snapshots for quality recommendations"
    >
      <div className="mb-4 text-sm">
        <Link href={QEP_QI_ROUTES.home}>← Quality Intelligence</Link>
      </div>
      <QepPanel title="History">
        {history.length === 0 ? (
          <QepEmptyState title="No recommendation history yet." />
        ) : (
          <QepTable
            caption="History"
            columns={["Updated", "Type", "Status", "Provider", "Confidence", "Actor"]}
            rows={history.map((entry) => ({
              id: entry.recommendationId,
              href: QEP_QI_ROUTES.recommendation(entry.recommendationId),
              cells: [
                entry.updatedAt,
                entry.type,
                <QepStatusBadge key="st" status={entry.status} />,
                entry.providerId,
                `${entry.confidenceLevel} (${entry.confidenceNumeric})`,
                entry.actedBy ?? "—",
              ],
            }))}
          />
        )}
      </QepPanel>
    </QepPageShell>
  );
}

function ConfidenceView() {
  const query = useQuery({
    queryKey: ["qep-qi", "confidence"],
    queryFn: () =>
      fetchJson<{
        confidence: Array<{
          recommendationId: string;
          providerId: string;
          confidence: { level: string; numeric: number };
        }>;
      }>("/api/v1/qep/quality-intelligence/confidence"),
  });

  if (query.isLoading) return <QepLoadingState label="Loading confidence…" />;
  if (query.isError) {
    return <QepErrorState message={(query.error as Error).message} />;
  }

  const rows = query.data?.confidence ?? [];

  return (
    <QepPageShell
      title="Confidence"
      description="Provider-neutral confidence assessments — not hard-coded AI scores"
    >
      <div className="mb-4 text-sm">
        <Link href={QEP_QI_ROUTES.home}>← Quality Intelligence</Link>
      </div>
      <QepPanel title="Confidence assessments">
        {rows.length === 0 ? (
          <QepEmptyState title="No confidence assessments yet." />
        ) : (
          <QepTable
            caption="Confidence"
            columns={["Recommendation", "Provider", "Level", "Numeric"]}
            rows={rows.map((row) => ({
              id: row.recommendationId,
              href: QEP_QI_ROUTES.recommendation(row.recommendationId),
              cells: [
                row.recommendationId.slice(0, 8),
                row.providerId,
                row.confidence.level,
                String(row.confidence.numeric),
              ],
            }))}
          />
        )}
      </QepPanel>
    </QepPageShell>
  );
}

function RecommendationDetailView({ recommendationId }: { recommendationId: string }) {
  const queryClient = useQueryClient();
  const detailQuery = useQuery({
    queryKey: ["qep-qi", "recommendation", recommendationId],
    queryFn: () =>
      fetchJson<{
        recommendation: {
          recommendationId: string;
          type: string;
          priority: string;
          reason: string;
          status: string;
          providerId: string;
          confidence: { level: string; numeric: number };
          evidenceRefs: string[];
          observationIds: string[];
        };
        explanation?: {
          explanationId: string;
          reason: string;
          decisionPath: string[];
          inputs: Record<string, string | number | boolean>;
          providerId: string;
          confidence: { level: string; numeric: number };
        };
      }>(`/api/v1/qep/quality-intelligence/recommendations/${recommendationId}`),
  });

  const actionMutation = useMutation({
    mutationFn: (action: "accept" | "reject") =>
      fetchJson(
        `/api/v1/qep/quality-intelligence/recommendations/${recommendationId}`,
        {
          method: "POST",
          body: JSON.stringify({ action, correlationId: crypto.randomUUID() }),
        },
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["qep-qi"] });
    },
  });

  if (detailQuery.isLoading) {
    return <QepLoadingState label="Loading recommendation…" />;
  }
  if (detailQuery.isError || !detailQuery.data) {
    return (
      <QepErrorState
        message={(detailQuery.error as Error | undefined)?.message ?? "Not found"}
      />
    );
  }

  const { recommendation, explanation } = detailQuery.data;

  return (
    <QepPageShell
      title={recommendation.type}
      description={`${recommendation.providerId} · ${recommendation.status}`}
      actions={
        recommendation.status === "proposed" ? (
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => actionMutation.mutate("accept")}
              disabled={actionMutation.isPending}
            >
              Accept
            </Button>
            <Button
              type="button"
              onClick={() => actionMutation.mutate("reject")}
              disabled={actionMutation.isPending}
            >
              Reject
            </Button>
          </div>
        ) : undefined
      }
    >
      <div className="mb-4 text-sm">
        <Link href={QEP_QI_ROUTES.home}>← Quality Intelligence</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <QepPanel title="Recommendation">
          <p className="text-sm">{recommendation.reason}</p>
          <p className="mt-2 text-sm">
            Priority: {recommendation.priority} · Confidence:{" "}
            {recommendation.confidence.level} ({recommendation.confidence.numeric})
          </p>
          <QepStatusBadge status={recommendation.status} />
        </QepPanel>
        <QepPanel title="Explainability">
          {explanation ? (
            <>
              <p className="text-sm">{explanation.reason}</p>
              <ol className="mt-2 list-decimal pl-5 text-sm">
                {explanation.decisionPath.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <p className="mt-2 text-xs">
                Provider: {explanation.providerId} · Confidence:{" "}
                {explanation.confidence.level}
              </p>
            </>
          ) : (
            <QepEmptyState title="Explanation missing (should not happen)." />
          )}
        </QepPanel>
        <QepPanel title="Evidence / observations">
          <ul className="list-disc pl-5 text-sm">
            {recommendation.evidenceRefs.map((ref) => (
              <li key={ref}>{ref}</li>
            ))}
            {recommendation.observationIds.map((id) => (
              <li key={id}>observation:{id.slice(0, 8)}</li>
            ))}
          </ul>
        </QepPanel>
      </div>
    </QepPageShell>
  );
}
