"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { QEP_QI_ROUTES, parseQepQiRecommendationId } from "@/lib/qep/routes";
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

function QiHomeView() {
  const queryClient = useQueryClient();

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

  if (recommendationsQuery.isLoading) {
    return <QepLoadingState label="Loading quality intelligence…" />;
  }
  if (recommendationsQuery.isError) {
    return <QepErrorState message={(recommendationsQuery.error as Error).message} />;
  }

  const recommendations = recommendationsQuery.data?.recommendations ?? [];

  return (
    <QepPageShell
      title="Enterprise Quality Intelligence"
      description="Provider-neutral intelligence platform. Rules, statistical, historical and offline AI providers — no external AI APIs."
      actions={
        <Button
          type="button"
          onClick={() => seedAndAnalyze.mutate()}
          disabled={seedAndAnalyze.isPending}
        >
          {seedAndAnalyze.isPending ? "Analysing…" : "Seed observations & analyse"}
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap gap-3 text-sm">
        <Link href={QEP_QI_ROUTES.recommendations}>Recommendations</Link>
        <Link href={QEP_QI_ROUTES.signals}>Signals</Link>
        <Link href={QEP_QI_ROUTES.observations}>Observations</Link>
        <Link href={QEP_QI_ROUTES.scores}>Scores</Link>
        <Link href={QEP_QI_ROUTES.confidence}>Confidence</Link>
        <Link href={QEP_QI_ROUTES.history}>History</Link>
        <Link href={QEP_QI_ROUTES.providers}>Providers</Link>
      </div>

      <QepPanel title="Recommendations">
        {recommendations.length === 0 ? (
          <QepEmptyState title="No recommendations yet — seed observations and run analysis." />
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
