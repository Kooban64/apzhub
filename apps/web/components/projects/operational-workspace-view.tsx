"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import { formatProjectsDate } from "@/lib/projects/format";
import {
  canManageProjects,
  type ProjectsPermissionSource,
} from "@/lib/projects/permissions";
import {
  applyProjectApproval,
  getWorkspaceChanges,
  getWorkspaceOverview,
  getWorkspacePortfolio,
  getWorkspaceQueue,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import {
  projectCreatePath,
  projectDetailPath,
  projectsListPath,
} from "@/lib/projects/routes";
import {
  readWorkspacePreferences,
  writeWorkspacePreferences,
  type WorkspaceDensity,
} from "@/lib/projects/workspace-preferences";
import type {
  QueueGroupId,
  QueueItemKind,
  WorkspaceQueueItem,
} from "@/lib/projects/workspace-types";

import { EnterpriseContextPanel } from "./enterprise-context-panel";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  ProjectsWorkspaceFrame,
} from "./projects-ui";

type Density = WorkspaceDensity;

function useIsMobileQueueLayout(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return mobile;
}

function healthClass(label: string): string {
  if (label === "Critical") return "text-[var(--color-destructive)]";
  if (label === "Watch")
    return "text-[var(--color-warning,var(--color-muted-foreground))]";
  return "text-[var(--color-foreground)]";
}

function isCompleteWorkspaceOverview(value: unknown): value is {
  readonly asOf: string;
  readonly pressureStatement: string;
  readonly health: { healthy: number; watch: number; critical: number };
  readonly confidence: { mean: number; lowCount: number };
  readonly attention: { decision: number; attention: number; waiting: number };
  readonly delivery: { commitmentsDue7d: number; milestonesDue7d: number };
  readonly control: {
    criticalRisks: number;
    watchRisks: number;
    openDecisions: number;
  };
  readonly trend?: {
    slippedMilestonesDelta: number;
    agedWaitsDelta: number;
    confidenceDelta: number;
  };
} {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const health = v.health as Record<string, unknown> | null | undefined;
  const confidence = v.confidence as Record<string, unknown> | null | undefined;
  const attention = v.attention as Record<string, unknown> | null | undefined;
  const delivery = v.delivery as Record<string, unknown> | null | undefined;
  const control = v.control as Record<string, unknown> | null | undefined;
  return (
    typeof v.asOf === "string" &&
    typeof v.pressureStatement === "string" &&
    !!health &&
    typeof health.critical === "number" &&
    typeof health.watch === "number" &&
    typeof health.healthy === "number" &&
    !!confidence &&
    typeof confidence.mean === "number" &&
    typeof confidence.lowCount === "number" &&
    !!attention &&
    typeof attention.decision === "number" &&
    typeof attention.attention === "number" &&
    typeof attention.waiting === "number" &&
    !!delivery &&
    typeof delivery.commitmentsDue7d === "number" &&
    typeof delivery.milestonesDue7d === "number" &&
    !!control &&
    typeof control.criticalRisks === "number" &&
    typeof control.watchRisks === "number" &&
    typeof control.openDecisions === "number"
  );
}

function MetricBand({
  asOf,
  pressureStatement,
  health,
  confidence,
  attention,
  delivery,
  control,
  trend,
}: {
  readonly asOf: string;
  readonly pressureStatement: string;
  readonly health: { healthy: number; watch: number; critical: number };
  readonly confidence: { mean: number; lowCount: number };
  readonly attention: { decision: number; attention: number; waiting: number };
  readonly delivery: { commitmentsDue7d: number; milestonesDue7d: number };
  readonly control: {
    criticalRisks: number;
    watchRisks: number;
    openDecisions: number;
  };
  readonly trend?: {
    slippedMilestonesDelta: number;
    agedWaitsDelta: number;
    confidenceDelta: number;
  };
}) {
  const slipped = trend?.slippedMilestonesDelta ?? 0;
  const agedWaits = trend?.agedWaitsDelta ?? 0;
  const confidenceDelta = trend?.confidenceDelta ?? 0;

  return (
    <section
      aria-label="Operational Overview"
      className="space-y-3 border-b border-[var(--color-border)] pb-4"
      data-testid="operational-overview-band"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
          Operational Overview
        </h2>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          As of {formatProjectsDate(asOf)}
        </p>
      </div>
      <p className="text-sm text-[var(--color-foreground)]">{pressureStatement}</p>
      <dl className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
        <div>
          <dt className="text-xs text-[var(--color-muted-foreground)]">Health</dt>
          <dd>
            Critical {health.critical} · Watch {health.watch} · Healthy {health.healthy}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--color-muted-foreground)]">Confidence</dt>
          <dd>
            Portfolio {confidence.mean} · Low confidence: {confidence.lowCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--color-muted-foreground)]">Attention</dt>
          <dd>
            Decision {attention.decision} · Attention {attention.attention} · Waiting{" "}
            {attention.waiting}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--color-muted-foreground)]">
            Delivery (7d)
          </dt>
          <dd>
            Milestones due: {delivery.milestonesDue7d} · Commitments due:{" "}
            {delivery.commitmentsDue7d}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--color-muted-foreground)]">Control</dt>
          <dd>
            Critical risks {control.criticalRisks} · Watch risks {control.watchRisks} ·
            Decisions {control.openDecisions}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--color-muted-foreground)]">Trend</dt>
          <dd>
            Slip rate {slipped >= 0 ? "+" : ""}
            {slipped} vs prior week · Aged waits {agedWaits >= 0 ? "+" : ""}
            {agedWaits} · Confidence {confidenceDelta > 0 ? "+" : ""}
            {confidenceDelta}
          </dd>
        </div>
      </dl>
    </section>
  );
}

function QueueSection({
  title,
  groupId,
  items,
  emptyHint,
  collapsed,
  onToggle,
  onOpen,
  onApprove,
  onReject,
  actingId,
}: {
  readonly title: string;
  readonly groupId: QueueGroupId;
  readonly items: readonly WorkspaceQueueItem[];
  readonly emptyHint: string;
  readonly collapsed: boolean;
  readonly onToggle: () => void;
  readonly onOpen: (item: WorkspaceQueueItem) => void;
  readonly onApprove?: (item: WorkspaceQueueItem) => void;
  readonly onReject?: (item: WorkspaceQueueItem) => void;
  readonly actingId?: string | null;
}) {
  return (
    <section
      aria-labelledby={`queue-${groupId}`}
      className="space-y-2"
      data-testid={`operational-queue-${groupId}`}
    >
      <div className="flex items-center justify-between gap-2">
        <h3
          id={`queue-${groupId}`}
          className="text-sm font-semibold text-[var(--color-foreground)]"
        >
          {title}{" "}
          <span className="font-normal text-[var(--color-muted-foreground)]">
            ({items.length})
          </span>
        </h3>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onToggle}
          aria-expanded={!collapsed}
          data-testid={`queue-collapse-${groupId}`}
        >
          {collapsed ? "Expand" : "Collapse"}
        </Button>
      </div>
      {collapsed ? null : items.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          None — {emptyHint}
        </p>
      ) : (
        <ul className="divide-y divide-[var(--color-border)] border border-[var(--color-border)]">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm"
            >
              <button
                type="button"
                className="min-w-0 flex-1 text-left hover:bg-[var(--color-muted)]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() => onOpen(item)}
                data-testid={`queue-row-${item.id}`}
              >
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    {item.impact}
                  </span>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {item.kind}
                  </span>
                  {item.aged ? (
                    <span className="text-xs font-medium text-[var(--color-destructive)]">
                      Aged
                    </span>
                  ) : null}
                  <span className="font-medium text-[var(--color-foreground)]">
                    {item.statement}
                  </span>
                </span>
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  {item.projectName}
                  {item.dueAt ? ` · ${formatProjectsDate(item.dueAt)}` : ""}
                  {item.ageDays !== undefined ? ` · ${item.ageDays}d` : ""}
                </span>
              </button>
              {item.inlineAct === "approve_reject" && item.kind === "Approval" ? (
                <span className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    size="sm"
                    disabled={actingId === item.id}
                    onClick={() => onApprove?.(item)}
                    data-testid={`queue-approve-${item.id}`}
                  >
                    Approve
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={actingId === item.id}
                    onClick={() => onReject?.(item)}
                    data-testid={`queue-reject-${item.id}`}
                  >
                    Reject
                  </Button>
                </span>
              ) : item.inlineAct === "approve_reject" ? (
                <span className="flex shrink-0 gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onOpen(item)}
                    data-testid={`queue-open-${item.id}`}
                  >
                    Open
                  </Button>
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function OperationalWorkspaceView({
  permissions,
}: {
  readonly permissions?: ProjectsPermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isMobile = useIsMobileQueueLayout();
  const [prefsHydrated, setPrefsHydrated] = useState(false);
  const [sort, setSort] = useState("attention");
  const [density, setDensity] = useState<Density>("comfortable");
  const [healthFilter, setHealthFilter] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState("");
  const [agedWaitOnly, setAgedWaitOnly] = useState(false);
  const [queueKind, setQueueKind] = useState<"" | QueueItemKind>("");
  const [queueSearch, setQueueSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<QueueGroupId, boolean>>({
    decision: false,
    attention: false,
    waiting: false,
  });
  const [mobileTab, setMobileTab] = useState<"queue" | "portfolio" | "changes">(
    "queue",
  );
  const [quickOpen, setQuickOpen] = useState(false);
  const [contextProjectId, setContextProjectId] = useState<string | undefined>();
  const [contextProjectName, setContextProjectName] = useState<string | undefined>();
  const [actingId, setActingId] = useState<string | null>(null);
  const canCreate = canManageProjects(permissions);

  useEffect(() => {
    const prefs = readWorkspacePreferences();
    setSort(prefs.portfolioSort);
    setDensity(prefs.density);
    setHealthFilter(prefs.healthFilter);
    setConfidenceFilter(prefs.confidenceFilter);
    setAgedWaitOnly(prefs.agedWaitOnly);
    setQueueKind((prefs.queueKind as "" | QueueItemKind) || "");
    setCollapsed({
      decision: prefs.collapsedDecision,
      attention: prefs.collapsedAttention,
      waiting: prefs.collapsedWaiting,
    });
    setPrefsHydrated(true);
  }, []);

  useEffect(() => {
    if (!prefsHydrated) return;
    writeWorkspacePreferences({
      density,
      portfolioSort: sort,
      healthFilter,
      confidenceFilter,
      agedWaitOnly,
      queueKind,
      collapsedDecision: collapsed.decision,
      collapsedAttention: collapsed.attention,
      collapsedWaiting: collapsed.waiting,
    });
  }, [
    prefsHydrated,
    density,
    sort,
    healthFilter,
    confidenceFilter,
    agedWaitOnly,
    queueKind,
    collapsed,
  ]);

  useEffect(() => {
    if (!quickOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setQuickOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [quickOpen]);

  const approvalMutation = useMutation({
    mutationFn: (input: {
      item: WorkspaceQueueItem;
      outcome: "approved" | "rejected";
    }) => {
      if (!input.item.bindingId) {
        throw new Error("approval_binding_required");
      }
      return applyProjectApproval(input.item.projectId, input.item.bindingId, {
        outcome: input.outcome,
      });
    },
    onMutate: (input) => setActingId(input.item.id),
    onSettled: async () => {
      setActingId(null);
      await queryClient.invalidateQueries({
        queryKey: projectsQueryKeys.workspaceQueue(),
      });
    },
  });

  const portfolioFilters = `${healthFilter}|${confidenceFilter}|${agedWaitOnly ? "1" : "0"}`;

  const overview = useQuery({
    queryKey: projectsQueryKeys.workspaceOverview(),
    queryFn: ({ signal }) => getWorkspaceOverview({ signal }),
  });
  const queue = useQuery({
    queryKey: projectsQueryKeys.workspaceQueue(),
    queryFn: ({ signal }) => getWorkspaceQueue({ signal }),
  });
  const portfolio = useQuery({
    queryKey: projectsQueryKeys.workspacePortfolio(sort, portfolioFilters),
    queryFn: ({ signal }) =>
      getWorkspacePortfolio(sort, {
        signal,
        health: healthFilter || undefined,
        confidence: confidenceFilter || undefined,
        agedWait: agedWaitOnly || undefined,
      }),
  });
  const changes = useQuery({
    queryKey: projectsQueryKeys.workspaceChanges(),
    queryFn: ({ signal }) => getWorkspaceChanges({ signal }),
  });

  const sortOptions = useMemo(
    () => [
      { value: "attention", label: "Attention" },
      { value: "health", label: "Health" },
      { value: "confidence", label: "Confidence" },
      { value: "name", label: "Name" },
      { value: "recent", label: "Recently changed" },
    ],
    [],
  );

  function filterQueue(
    items: readonly WorkspaceQueueItem[],
  ): readonly WorkspaceQueueItem[] {
    return items.filter((item) => {
      if (queueKind && item.kind !== queueKind) return false;
      if (!queueSearch.trim()) return true;
      const q = queueSearch.trim().toLowerCase();
      return (
        item.statement.toLowerCase().includes(q) ||
        item.projectName.toLowerCase().includes(q)
      );
    });
  }

  return (
    <PageShell
      title="APZ Projects"
      documentTitle="Operational Workspace"
      description="Operational state, queue, and delivery portfolio."
      breadcrumbs={["APZ Projects", "Operational Workspace"]}
      actions={
        <>
          <div className="relative">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setQuickOpen((v) => !v)}
              data-testid="projects-quick-action"
              aria-expanded={quickOpen}
              aria-haspopup="menu"
            >
              Quick Action
            </Button>
            {quickOpen ? (
              <div
                role="menu"
                data-testid="projects-quick-action-menu"
                className="absolute right-0 z-20 mt-1 min-w-[12rem] border border-[var(--color-border)] bg-[var(--color-background)] p-1 shadow-md"
              >
                {canCreate ? (
                  <button
                    type="button"
                    role="menuitem"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-muted)]/40"
                    onClick={() => {
                      setQuickOpen(false);
                      router.push(projectCreatePath());
                    }}
                  >
                    Project
                  </button>
                ) : null}
                <button
                  type="button"
                  role="menuitem"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-muted)]/40"
                  onClick={() => {
                    setQuickOpen(false);
                    router.push(projectsListPath());
                  }}
                >
                  Open project directory
                </button>
              </div>
            ) : null}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(projectsListPath())}
            data-testid="operational-workspace-all"
          >
            All projects
          </Button>
        </>
      }
    >
      <ProjectsWorkspaceFrame
        context={
          contextProjectId ? (
            <EnterpriseContextPanel
              focusType="project"
              focusId={contextProjectId}
              focusName={contextProjectName}
            />
          ) : (
            <section aria-label="Enterprise Context" className="space-y-2">
              <h2 className="text-sm font-semibold">Enterprise Context</h2>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Workflow · Support · Governance · Documents · Knowledge
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Focus a portfolio strip to compose Context from owning products. Systems
                of Record stay attributed — Projects does not duplicate commitments,
                milestones, or risks here.
              </p>
            </section>
          )
        }
      >
        <div className={isMobile ? "pb-16" : undefined}>
          {!isMobile || mobileTab === "queue" ? (
            <>
              {!isMobile && overview.isLoading ? (
                <LoadingState label="Loading operational overview…" />
              ) : null}
              {!isMobile && overview.isError ? (
                <ErrorState
                  message={
                    isProjectsApiError(overview.error)
                      ? overview.error.message
                      : "Unable to load operational overview."
                  }
                  onRetry={() => void overview.refetch()}
                />
              ) : null}
              {!isMobile &&
              overview.data &&
              isCompleteWorkspaceOverview(overview.data) ? (
                <MetricBand {...overview.data} />
              ) : null}
              {!isMobile &&
              overview.data &&
              !overview.isLoading &&
              !overview.isError &&
              !isCompleteWorkspaceOverview(overview.data) ? (
                <ErrorState message="Operational overview data is incomplete." />
              ) : null}

              <section
                aria-label="Operational Queue"
                className="space-y-4"
                data-testid="operational-queue"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-base font-semibold text-[var(--color-foreground)]">
                    Operational Queue
                  </h2>
                  {queue.data?.approvalsUnavailable ? (
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      Approvals degrade when Workflow is unavailable — Attention and
                      Waiting remain available.
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <label className="flex items-center gap-2">
                    <span className="text-[var(--color-muted-foreground)]">Kind</span>
                    <select
                      className="border border-[var(--color-border)] bg-transparent px-2 py-1"
                      value={queueKind}
                      onChange={(e) =>
                        setQueueKind(e.target.value as "" | QueueItemKind)
                      }
                      data-testid="queue-filter-kind"
                    >
                      <option value="">All</option>
                      {[
                        "Decision",
                        "Approval",
                        "Commitment",
                        "Risk",
                        "Blocked",
                        "Waiting",
                        "Milestone",
                        "Action",
                      ].map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex min-w-[12rem] flex-1 items-center gap-2">
                    <span className="text-[var(--color-muted-foreground)]">Search</span>
                    <input
                      type="search"
                      className="w-full border border-[var(--color-border)] bg-transparent px-2 py-1"
                      value={queueSearch}
                      onChange={(e) => setQueueSearch(e.target.value)}
                      placeholder="Statement or project"
                      data-testid="queue-search"
                    />
                  </label>
                </div>
                {queue.isLoading ? <LoadingState label="Loading queue…" /> : null}
                {queue.isError ? (
                  <ErrorState
                    message={
                      isProjectsApiError(queue.error)
                        ? queue.error.message
                        : "Unable to load operational queue."
                    }
                    onRetry={() => void queue.refetch()}
                  />
                ) : null}
                {queue.data ? (
                  <>
                    <QueueSection
                      title="Requires My Decision"
                      groupId="decision"
                      items={filterQueue(queue.data.decision)}
                      emptyHint="no decisions require you"
                      collapsed={collapsed.decision}
                      onToggle={() =>
                        setCollapsed((c) => ({ ...c, decision: !c.decision }))
                      }
                      onOpen={(item) => router.push(item.targetPath)}
                      onApprove={(item) =>
                        approvalMutation.mutate({ item, outcome: "approved" })
                      }
                      onReject={(item) =>
                        approvalMutation.mutate({ item, outcome: "rejected" })
                      }
                      actingId={actingId}
                    />
                    <QueueSection
                      title="Requires My Attention"
                      groupId="attention"
                      items={filterQueue(queue.data.attention)}
                      emptyHint="nothing requires your attention"
                      collapsed={collapsed.attention}
                      onToggle={() =>
                        setCollapsed((c) => ({ ...c, attention: !c.attention }))
                      }
                      onOpen={(item) => router.push(item.targetPath)}
                      actingId={actingId}
                    />
                    <QueueSection
                      title="Waiting On Others"
                      groupId="waiting"
                      items={filterQueue(queue.data.waitingOnOthers)}
                      emptyHint="no active waits you are chasing"
                      collapsed={collapsed.waiting}
                      onToggle={() =>
                        setCollapsed((c) => ({ ...c, waiting: !c.waiting }))
                      }
                      onOpen={(item) => router.push(item.targetPath)}
                      actingId={actingId}
                    />
                  </>
                ) : null}
              </section>
            </>
          ) : null}

          {!isMobile || mobileTab === "portfolio" ? (
            <section
              aria-label="Delivery Portfolio"
              className="space-y-3"
              data-testid="delivery-portfolio"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold text-[var(--color-foreground)]">
                  Delivery Portfolio
                </h2>
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <label className="flex items-center gap-2">
                    <span className="text-[var(--color-muted-foreground)]">Sort</span>
                    <select
                      className="border border-[var(--color-border)] bg-transparent px-2 py-1"
                      value={sort}
                      onChange={(event) => setSort(event.target.value)}
                      data-testid="portfolio-sort"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="text-[var(--color-muted-foreground)]">Health</span>
                    <select
                      className="border border-[var(--color-border)] bg-transparent px-2 py-1"
                      value={healthFilter}
                      onChange={(e) => setHealthFilter(e.target.value)}
                      data-testid="portfolio-filter-health"
                    >
                      <option value="">All</option>
                      <option value="Critical">Critical</option>
                      <option value="Watch">Watch</option>
                      <option value="Healthy">Healthy</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="text-[var(--color-muted-foreground)]">
                      Confidence
                    </span>
                    <select
                      className="border border-[var(--color-border)] bg-transparent px-2 py-1"
                      value={confidenceFilter}
                      onChange={(e) => setConfidenceFilter(e.target.value)}
                      data-testid="portfolio-filter-confidence"
                    >
                      <option value="">All</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </label>
                  <label className="flex items-center gap-2 text-[var(--color-muted-foreground)]">
                    <input
                      type="checkbox"
                      checked={agedWaitOnly}
                      onChange={(e) => setAgedWaitOnly(e.target.checked)}
                      data-testid="portfolio-filter-aged-wait"
                    />
                    Aged wait
                  </label>
                  <label className="flex items-center gap-2">
                    <span className="text-[var(--color-muted-foreground)]">
                      Density
                    </span>
                    <select
                      className="border border-[var(--color-border)] bg-transparent px-2 py-1"
                      value={density}
                      onChange={(e) => setDensity(e.target.value as Density)}
                      data-testid="portfolio-density"
                    >
                      <option value="comfortable">Comfortable</option>
                      <option value="compact">Compact</option>
                      <option value="dense">Dense</option>
                    </select>
                  </label>
                </div>
              </div>
              {portfolio.isLoading ? <LoadingState label="Loading portfolio…" /> : null}
              {portfolio.isError ? (
                <ErrorState
                  message={
                    isProjectsApiError(portfolio.error)
                      ? portfolio.error.message
                      : "Unable to load portfolio."
                  }
                  onRetry={() => void portfolio.refetch()}
                />
              ) : null}
              {portfolio.data && portfolio.data.items.length === 0 ? (
                <EmptyState
                  title="No active projects"
                  description="Create a project to begin operational delivery, or adjust filters in All projects."
                  action={
                    canCreate ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => router.push(projectCreatePath())}
                      >
                        Create project
                      </Button>
                    ) : undefined
                  }
                />
              ) : null}
              {portfolio.data && portfolio.data.items.length > 0 ? (
                <ul className="divide-y divide-[var(--color-border)] border border-[var(--color-border)]">
                  {portfolio.data.items.map((strip) => (
                    <li key={strip.projectId}>
                      <button
                        type="button"
                        className={`flex w-full flex-col gap-1 text-left hover:bg-[var(--color-muted)]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                          density === "dense" ? "px-2 py-2" : "px-3 py-3"
                        }`}
                        onClick={() => {
                          setContextProjectId(strip.projectId);
                          setContextProjectName(strip.name);
                          router.push(projectDetailPath(strip.projectId));
                        }}
                        onFocus={() => {
                          setContextProjectId(strip.projectId);
                          setContextProjectName(strip.name);
                        }}
                        data-testid={`portfolio-strip-${strip.projectId}`}
                      >
                        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="font-medium text-[var(--color-foreground)]">
                            {strip.name}
                          </span>
                          <span className="text-xs text-[var(--color-muted-foreground)]">
                            {strip.identifier}
                          </span>
                          <span
                            className={`text-xs font-medium ${healthClass(strip.health)}`}
                          >
                            Health {strip.health}
                          </span>
                          <span className="text-xs text-[var(--color-foreground)]">
                            Confidence {strip.confidenceScore} ({strip.confidenceBand})
                          </span>
                          <span className="inline-flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
                            Progress {strip.progressPercent}%
                            <span
                              aria-hidden
                              className="h-1 w-16 overflow-hidden bg-[var(--color-muted)]"
                            >
                              <span
                                className="block h-full bg-[var(--color-foreground)]"
                                style={{ width: `${strip.progressPercent}%` }}
                              />
                            </span>
                          </span>
                        </span>
                        {density === "comfortable" ? (
                          <span className="text-sm text-[var(--color-foreground)]">
                            {strip.pulse}
                          </span>
                        ) : null}
                        {density !== "dense" ? (
                          <span className="flex flex-wrap gap-x-3 text-xs text-[var(--color-muted-foreground)]">
                            {strip.nextCommitment ? (
                              <span>
                                Next: {strip.nextCommitment.title}
                                {strip.nextCommitment.dueAt
                                  ? ` · ${formatProjectsDate(strip.nextCommitment.dueAt)}`
                                  : ""}
                              </span>
                            ) : (
                              <span>No upcoming commitment</span>
                            )}
                            {(strip.pressure.risks > 0 ||
                              strip.pressure.blocked > 0 ||
                              strip.pressure.decisions > 0 ||
                              strip.pressure.waiting > 0) && (
                              <span>
                                Pressure
                                {strip.pressure.risks > 0
                                  ? ` · Risks ${strip.pressure.risks}`
                                  : ""}
                                {strip.pressure.blocked > 0
                                  ? ` · Blocked ${strip.pressure.blocked}`
                                  : ""}
                                {strip.pressure.decisions > 0
                                  ? ` · Decisions ${strip.pressure.decisions}`
                                  : ""}
                                {strip.pressure.waiting > 0
                                  ? ` · Waiting ${strip.pressure.waiting}`
                                  : ""}
                              </span>
                            )}
                            {strip.waitingSummary ? (
                              <span>Waiting: {strip.waitingSummary}</span>
                            ) : null}
                            {strip.lastChangeAt ? (
                              <span>
                                Changed {formatProjectsDate(strip.lastChangeAt)}
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--color-muted-foreground)]">
                            {[
                              strip.pressure.risks > 0
                                ? `R${strip.pressure.risks}`
                                : null,
                              strip.pressure.decisions > 0
                                ? `D${strip.pressure.decisions}`
                                : null,
                              strip.pressure.waiting > 0
                                ? `W${strip.pressure.waiting}`
                                : null,
                              strip.pressure.blocked > 0
                                ? `B${strip.pressure.blocked}`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" · ") || "No pressure"}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}

          {!isMobile || mobileTab === "changes" ? (
            <section
              aria-label="Operational Changes"
              className="space-y-3"
              data-testid="operational-changes"
            >
              <h2 className="text-base font-semibold text-[var(--color-foreground)]">
                Operational Changes
              </h2>
              {changes.isLoading ? <LoadingState label="Loading changes…" /> : null}
              {changes.isError ? (
                <ErrorState
                  message={
                    isProjectsApiError(changes.error)
                      ? changes.error.message
                      : "Unable to load operational changes."
                  }
                  onRetry={() => void changes.refetch()}
                />
              ) : null}
              {changes.data && changes.data.items.length === 0 ? (
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  No meaningful operational changes in the current portfolio window.
                </p>
              ) : null}
              {changes.data && changes.data.items.length > 0 ? (
                <ul className="space-y-2">
                  {changes.data.items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="w-full border border-[var(--color-border)] px-3 py-2 text-left text-sm hover:bg-[var(--color-muted)]/30"
                        onClick={() => {
                          if (item.targetPath) router.push(item.targetPath);
                        }}
                        data-testid={`change-${item.id}`}
                      >
                        <p className="font-medium text-[var(--color-foreground)]">
                          {item.headline}
                        </p>
                        <p className="text-[var(--color-muted-foreground)]">
                          {item.whyCare}
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                          {item.projectName ? `${item.projectName} · ` : ""}
                          {formatProjectsDate(item.at)}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}

          {isMobile ? (
            <nav
              aria-label="Mobile operational navigation"
              className="fixed inset-x-0 bottom-0 z-20 flex gap-1 border-t border-[var(--color-border)] bg-[var(--color-background)] p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
              data-testid="mobile-ops-nav"
            >
              {(
                [
                  ["queue", "Queue"],
                  ["portfolio", "Portfolio"],
                  ["changes", "Changes"],
                ] as const
              ).map(([id, label]) => (
                <Button
                  key={id}
                  type="button"
                  size="sm"
                  variant={mobileTab === id ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setMobileTab(id)}
                  data-testid={`mobile-ops-tab-${id}`}
                >
                  {label}
                </Button>
              ))}
            </nav>
          ) : null}
        </div>
      </ProjectsWorkspaceFrame>
    </PageShell>
  );
}
