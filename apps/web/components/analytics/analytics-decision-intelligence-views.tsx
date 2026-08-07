"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  createDecisionKpi,
  createDecisionTimelineEntry,
  generateDecisionPack,
  listDecisionKpis,
  listDecisionPacks,
  listDecisionQuestions,
  listDecisionTimeline,
  listDecisionTrends,
  updateDecisionKpi,
  type DecisionAudienceRole,
  type DecisionTrendDomain,
} from "@/lib/analytics/decision-intelligence-api";
import { isAnalyticsApiError } from "@/lib/analytics/errors";
import {
  canManageDecisionIntelligence,
  type AnalyticsPermissionSource,
} from "@/lib/analytics/permissions";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  ANALYTICS_PRODUCT_NAME,
} from "./analytics-ui";

const ROLES: readonly { readonly id: DecisionAudienceRole; readonly label: string }[] =
  [
    { id: "executive", label: "Executive" },
    { id: "manager", label: "Manager" },
    { id: "project_manager", label: "Project Manager" },
    { id: "support_manager", label: "Support Manager" },
    { id: "team_member", label: "Team Member" },
  ];

const keys = {
  questions: (role?: string) =>
    ["analytics", "decision-questions", role ?? "all"] as const,
  packs: ["analytics", "decision-packs"] as const,
  trends: ["analytics", "decision-trends"] as const,
  kpis: ["analytics", "decision-kpis"] as const,
  timeline: ["analytics", "decision-timeline"] as const,
};

export function AnalyticsDecisionCatalogueView({
  permissions,
}: {
  readonly permissions?: AnalyticsPermissionSource;
}) {
  const [role, setRole] = useState<DecisionAudienceRole | "all">("executive");
  const queryClient = useQueryClient();
  const canManage = canManageDecisionIntelligence(permissions);

  const query = useQuery({
    queryKey: keys.questions(role),
    queryFn: ({ signal }) =>
      listDecisionQuestions(role === "all" ? undefined : role, { signal }),
  });

  const packMutation = useMutation({
    mutationFn: (questionId: string) =>
      generateDecisionPack({
        questionId,
        audienceRole: role === "all" ? "executive" : role,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: keys.packs });
    },
  });

  return (
    <PageShell
      title="Executive question catalogue"
      description="Business questions by role — each links to evidence and recommended operational actions."
      breadcrumbs={[ANALYTICS_PRODUCT_NAME, "Questions"]}
    >
      <div className="mb-4 flex flex-wrap gap-2" data-testid="analytics-role-filter">
        <Button
          type="button"
          size="sm"
          variant={role === "all" ? "default" : "outline"}
          onClick={() => setRole("all")}
        >
          All roles
        </Button>
        {ROLES.map((entry) => (
          <Button
            key={entry.id}
            type="button"
            size="sm"
            variant={role === entry.id ? "default" : "outline"}
            onClick={() => setRole(entry.id)}
            data-testid={`analytics-role-${entry.id}`}
          >
            {entry.label}
          </Button>
        ))}
      </div>

      {query.isLoading ? <LoadingState label="Loading questions…" /> : null}
      {query.isError ? (
        <ErrorState
          message={
            isAnalyticsApiError(query.error)
              ? query.error.message
              : "Unable to load questions."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.isSuccess ? (
        <ul className="flex flex-col gap-3" data-testid="analytics-decision-catalogue">
          {query.data.map((question) => (
            <li
              key={question.id}
              className="rounded-lg border border-[var(--color-border)] p-4"
              data-testid={`analytics-question-${question.id}`}
            >
              <div className="font-medium">{question.question}</div>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                {question.whyItMatters}
              </p>
              <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                Evidence: {question.evidenceSummary}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {question.recommendedActions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
              {canManage ? (
                <Button
                  type="button"
                  size="sm"
                  className="mt-3"
                  disabled={packMutation.isPending}
                  onClick={() => packMutation.mutate(question.id)}
                  data-testid={`analytics-generate-pack-${question.id}`}
                >
                  Generate decision pack
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </PageShell>
  );
}

export function AnalyticsDecisionPacksView() {
  const query = useQuery({
    queryKey: keys.packs,
    queryFn: ({ signal }) => listDecisionPacks({ signal }),
  });

  return (
    <PageShell
      title="Decision packs"
      description="Concise packs: question, indicators, evidence, trend summary, and rule-based actions."
      breadcrumbs={[ANALYTICS_PRODUCT_NAME, "Decision packs"]}
    >
      {query.isLoading ? <LoadingState label="Loading decision packs…" /> : null}
      {query.isError ? (
        <ErrorState
          message={
            isAnalyticsApiError(query.error)
              ? query.error.message
              : "Unable to load decision packs."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess ? (
        query.data.length === 0 ? (
          <EmptyState
            title="No decision packs yet"
            description="Generate a pack from the question catalogue."
          />
        ) : (
          <ul className="flex flex-col gap-3" data-testid="analytics-decision-packs">
            {query.data.map((pack) => (
              <li
                key={pack.id}
                className="rounded-lg border border-[var(--color-border)] p-4"
              >
                <div className="font-medium">{pack.question}</div>
                <p className="mt-1 text-xs uppercase text-[var(--color-muted-foreground)]">
                  {pack.audienceRole.replace("_", " ")}
                </p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {pack.indicators.map((indicator) => (
                    <div
                      key={`${pack.id}-${indicator.label}`}
                      className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
                    >
                      <div className="text-xs text-[var(--color-muted-foreground)]">
                        {indicator.label}
                      </div>
                      <div className="font-medium">{indicator.value}</div>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm">{pack.trendSummary}</p>
                <h3 className="mt-3 text-sm font-semibold">Recommended actions</h3>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                  {pack.recommendedActions.map((action) => (
                    <li key={action}>{action}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                  Evidence: {pack.supportingEvidence.join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </PageShell>
  );
}

export function AnalyticsTrendsView() {
  const query = useQuery({
    queryKey: keys.trends,
    queryFn: ({ signal }) => listDecisionTrends(undefined, { signal }),
  });

  return (
    <PageShell
      title="Trend analysis"
      description="Changes over time for project delivery, support, workflow throughput, and operational quality."
      breadcrumbs={[ANALYTICS_PRODUCT_NAME, "Trends"]}
    >
      {query.isLoading ? <LoadingState label="Loading trends…" /> : null}
      {query.isError ? (
        <ErrorState
          message={
            isAnalyticsApiError(query.error)
              ? query.error.message
              : "Unable to load trends."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess ? (
        <div className="grid gap-4 lg:grid-cols-2" data-testid="analytics-trends">
          {query.data.map((series) => (
            <section
              key={series.domain}
              className="rounded-lg border border-[var(--color-border)] p-4"
              data-testid={`analytics-trend-${series.domain}`}
            >
              <h2 className="text-sm font-semibold">{series.title}</h2>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                {series.changeSummary}
              </p>
              <ol className="mt-3 space-y-1 text-sm">
                {series.points.map((point) => (
                  <li key={point.id}>
                    {point.value} {point.unit}
                    <span className="text-[var(--color-muted-foreground)]">
                      {" "}
                      · period ending {new Date(point.periodEnd).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      ) : null}
    </PageShell>
  );
}

export function AnalyticsKpisView({
  permissions,
}: {
  readonly permissions?: AnalyticsPermissionSource;
}) {
  const queryClient = useQueryClient();
  const canManage = canManageDecisionIntelligence(permissions);
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("85");
  const [current, setCurrent] = useState("80");
  const [domain, setDomain] = useState<DecisionTrendDomain>("project_delivery");

  const query = useQuery({
    queryKey: keys.kpis,
    queryFn: ({ signal }) => listDecisionKpis({ signal }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createDecisionKpi({
        name: name.trim(),
        description: description.trim(),
        owner: owner.trim(),
        targetValue: Number(target),
        currentValue: Number(current),
        unit: "percent",
        domain,
      }),
    onSuccess: async () => {
      setName("");
      setDescription("");
      setOwner("");
      await queryClient.invalidateQueries({ queryKey: keys.kpis });
    },
  });

  const refreshMutation = useMutation({
    mutationFn: (kpiId: string) =>
      updateDecisionKpi(kpiId, { currentValue: Number(current) || undefined }),
    onSuccess: async () => queryClient.invalidateQueries({ queryKey: keys.kpis }),
  });

  return (
    <PageShell
      title="KPI management"
      description="Define KPIs, assign owners, set targets, and track performance history."
      breadcrumbs={[ANALYTICS_PRODUCT_NAME, "KPIs"]}
    >
      {canManage ? (
        <form
          className="mb-4 grid gap-2 rounded-lg border border-[var(--color-border)] p-4 md:grid-cols-2"
          data-testid="analytics-kpi-create"
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim() && owner.trim() && description.trim()) {
              createMutation.mutate();
            }
          }}
        >
          <Input
            label="KPI name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Owner"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Domain</span>
            <select
              className="h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
              value={domain}
              onChange={(e) => setDomain(e.target.value as DecisionTrendDomain)}
            >
              <option value="project_delivery">Project delivery</option>
              <option value="support_performance">Support performance</option>
              <option value="workflow_throughput">Workflow throughput</option>
              <option value="operational_quality">Operational quality</option>
            </select>
          </label>
          <Input
            label="Target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <Input
            label="Current"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
          />
          <div className="md:col-span-2">
            <Button type="submit" size="sm" disabled={createMutation.isPending}>
              Create KPI
            </Button>
          </div>
        </form>
      ) : null}

      {query.isLoading ? <LoadingState label="Loading KPIs…" /> : null}
      {query.isSuccess ? (
        query.data.length === 0 ? (
          <EmptyState title="No KPIs defined" />
        ) : (
          <ul className="flex flex-col gap-3" data-testid="analytics-kpi-list">
            {query.data.map((kpi) => (
              <li
                key={kpi.id}
                className="rounded-lg border border-[var(--color-border)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-medium">{kpi.name}</div>
                  <span className="text-xs uppercase">
                    {kpi.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  {kpi.description}
                </p>
                <p className="mt-2 text-sm">
                  Owner {kpi.owner} · Current {kpi.currentValue}
                  {kpi.unit} / Target {kpi.targetValue}
                  {kpi.unit}
                </p>
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                  History points: {kpi.history.length}
                </p>
                {canManage ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    disabled={refreshMutation.isPending}
                    onClick={() => refreshMutation.mutate(kpi.id)}
                  >
                    Record current value
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )
      ) : null}
    </PageShell>
  );
}

export function AnalyticsDecisionTimelineView({
  permissions,
}: {
  readonly permissions?: AnalyticsPermissionSource;
}) {
  const queryClient = useQueryClient();
  const canManage = canManageDecisionIntelligence(permissions);
  const [title, setTitle] = useState("");
  const [decision, setDecision] = useState("");
  const [rationale, setRationale] = useState("");
  const [decidedBy, setDecidedBy] = useState("");
  const [evidence, setEvidence] = useState("");

  const query = useQuery({
    queryKey: keys.timeline,
    queryFn: ({ signal }) => listDecisionTimeline({ signal }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createDecisionTimelineEntry({
        title: title.trim(),
        decision: decision.trim(),
        rationale: rationale.trim(),
        decidedBy: decidedBy.trim(),
        evidenceRefs: evidence
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        relatedProduct: "APZ Analytics",
      }),
    onSuccess: async () => {
      setTitle("");
      setDecision("");
      setRationale("");
      setDecidedBy("");
      setEvidence("");
      await queryClient.invalidateQueries({ queryKey: keys.timeline });
    },
  });

  return (
    <PageShell
      title="Decision timeline"
      description="Significant operational decisions with supporting evidence. Ownership remains with the originating System of Record."
      breadcrumbs={[ANALYTICS_PRODUCT_NAME, "Timeline"]}
    >
      {canManage ? (
        <form
          className="mb-4 grid gap-2 rounded-lg border border-[var(--color-border)] p-4 md:grid-cols-2"
          data-testid="analytics-timeline-create"
          onSubmit={(event) => {
            event.preventDefault();
            if (
              title.trim() &&
              decision.trim() &&
              rationale.trim() &&
              decidedBy.trim()
            ) {
              createMutation.mutate();
            }
          }}
        >
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            label="Decided by"
            value={decidedBy}
            onChange={(e) => setDecidedBy(e.target.value)}
          />
          <Input
            label="Decision"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
          />
          <Input
            label="Rationale"
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
          />
          <Input
            label="Evidence refs (comma-separated)"
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
          />
          <div className="flex items-end">
            <Button type="submit" size="sm" disabled={createMutation.isPending}>
              Record decision
            </Button>
          </div>
        </form>
      ) : null}

      {query.isLoading ? <LoadingState label="Loading timeline…" /> : null}
      {query.isSuccess ? (
        query.data.length === 0 ? (
          <EmptyState title="No decisions recorded" />
        ) : (
          <ol className="flex flex-col gap-3" data-testid="analytics-decision-timeline">
            {query.data.map((entry) => (
              <li
                key={entry.id}
                className="rounded-lg border border-[var(--color-border)] p-4"
              >
                <div className="font-medium">{entry.title}</div>
                <p className="mt-1 text-sm">{entry.decision}</p>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  {entry.rationale}
                </p>
                <p className="mt-2 text-xs text-[var(--color-muted-foreground)]">
                  {entry.decidedBy} · {new Date(entry.decidedAt).toLocaleString()}
                  {entry.evidenceRefs.length > 0
                    ? ` · Evidence: ${entry.evidenceRefs.join("; ")}`
                    : ""}
                </p>
              </li>
            ))}
          </ol>
        )
      ) : null}
    </PageShell>
  );
}
