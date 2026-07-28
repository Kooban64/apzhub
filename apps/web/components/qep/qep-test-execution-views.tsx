"use client";

import type {
  EvidenceReferenceDto,
  ExecutionActionDescriptor,
  ExecutionObservationDto,
  ExecutionStepDto,
  TestExecutionDto,
} from "@apzhub/qep-test-execution";
import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  EXECUTION_ACTION_SLUGS,
  associateExecutionEvidence,
  createExecution,
  getExecution,
  getExecutionHistory,
  listAssignedExecutions,
  listExecutions,
  listReviewQueueExecutions,
  performExecutionAction,
  recordExecutionObservation,
  recordExecutionStepResult,
  resolveExecutionActionSlug,
  type CreateQepTestExecutionInput,
  type PerformQepExecutionActionInput,
  type QepTestExecutionListParams,
} from "@/lib/qep/qep-test-execution-api";
import { qepQueryKeys } from "@/lib/qep/query-keys";
import {
  QEP_TEST_EXECUTION_ROUTES,
  isQepTestExecutionAssignedRoute,
  isQepTestExecutionExplorerRoute,
  isQepTestExecutionNewRoute,
  isQepTestExecutionReviewRoute,
  parseQepTestExecutionDetailMode,
  parseQepTestExecutionRouteId,
} from "@/lib/qep/routes";

import {
  QepEmptyState,
  QepErrorState,
  QepFilterBar,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
  QepTable,
} from "./qep-ui";

const PAGE_SIZE = 25;
const DEFAULT_ACTOR = "workbench-user";

const STATUS_FILTER_OPTIONS = [
  "draft",
  "ready",
  "assigned",
  "in_progress",
  "paused",
  "blocked",
  "completed",
  "submitted_for_review",
  "accepted",
  "rejected",
  "cancelled",
  "superseded",
] as const;

const STEP_OUTCOME_OPTIONS = [
  "passed",
  "failed",
  "blocked",
  "skipped",
  "not_applicable",
  "inconclusive",
  "not_executed",
  "cancelled",
] as const;

const SEVERITY_OPTIONS = ["info", "warning", "critical"] as const;

/**
 * `availableActions` DTO action names driven by the lifecycle command bar
 * (`/actions/{slug}`) — ADR-driven, see qep-test-execution-api.ts. Actions
 * outside this set (`recordStepResult`, `associateEvidence`,
 * `recordObservation`) gate dedicated panels instead of action-bar buttons —
 * OES-ENG-090A PART-04 §3.3: never reconstruct actions from status enums.
 */
const LIFECYCLE_ACTIONS = new Set(Object.keys(EXECUTION_ACTION_SLUGS));

/**
 * Action bar entries — filtered strictly from server-provided
 * `availableActions`. Never derived from status. Exported for the
 * ENG-100E available-actions contract test.
 */
export function getExecutionActionBarDescriptors(
  availableActions: readonly ExecutionActionDescriptor[],
): readonly ExecutionActionDescriptor[] {
  return availableActions.filter((descriptor) =>
    LIFECYCLE_ACTIONS.has(descriptor.action),
  );
}

export function hasExecutionAction(
  availableActions: readonly ExecutionActionDescriptor[],
  action: string,
): boolean {
  return availableActions.some((descriptor) => descriptor.action === action);
}

function reasonFieldForStepOutcome(
  outcome: string,
): "skipReason" | "blockReason" | "notApplicableReason" | null {
  if (outcome === "skipped") return "skipReason";
  if (outcome === "blocked") return "blockReason";
  if (outcome === "not_applicable") return "notApplicableReason";
  return null;
}

function formatDate(value?: string): string {
  return value ? value : "—";
}

function useExecutionList(params: QepTestExecutionListParams) {
  return useQuery({
    queryKey: qepQueryKeys.executions.list(params),
    queryFn: ({ signal }) => listExecutions(params, { signal }),
  });
}

function useAssignedExecutionList(params: QepTestExecutionListParams) {
  return useQuery({
    queryKey: qepQueryKeys.executions.assigned(params),
    queryFn: ({ signal }) => listAssignedExecutions(params, { signal }),
  });
}

function useReviewQueueExecutionList(params: QepTestExecutionListParams) {
  return useQuery({
    queryKey: qepQueryKeys.executions.reviewQueue(params),
    queryFn: ({ signal }) => listReviewQueueExecutions(params, { signal }),
  });
}

function ExecutionExplorerTable({
  items,
  emptyLabel,
}: {
  readonly items: readonly TestExecutionDto[];
  readonly emptyLabel: string;
}) {
  if (items.length === 0) {
    return <QepEmptyState title={emptyLabel} />;
  }
  return (
    <QepTable
      caption="Test Executions"
      columns={[
        "Number",
        "Status",
        "Mode",
        "Outcome",
        "Owner",
        "Executor",
        "Reviewer",
        "Updated",
      ]}
      rows={items.map((row) => ({
        id: row.id,
        href: QEP_TEST_EXECUTION_ROUTES.detail(row.id),
        cells: [
          <Link
            key={`${row.id}-num`}
            className="font-medium text-[var(--color-primary)] underline"
            href={QEP_TEST_EXECUTION_ROUTES.detail(row.id)}
            data-testid={`qep-execution-row-${row.id}`}
          >
            {row.executionNumber}
          </Link>,
          <QepStatusBadge key={`${row.id}-status`} status={row.status} />,
          row.mode,
          row.outcome ?? "—",
          row.assignment.ownerId,
          row.assignment.executorId ?? "—",
          row.assignment.reviewerId ?? "—",
          formatDate(row.updatedAt),
        ],
      }))}
    />
  );
}

function StatusFilterSelect({
  status,
  setStatus,
}: {
  readonly status: string;
  readonly setStatus: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      Status
      <select
        className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        aria-label="Filter by status"
        data-testid="qep-execution-status-filter"
      >
        <option value="">All</option>
        {STATUS_FILTER_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </label>
  );
}

function Pager({
  offset,
  limit,
  count,
  onPrevious,
  onNext,
}: {
  readonly offset: number;
  readonly limit: number;
  readonly count: number;
  readonly onPrevious: () => void;
  readonly onNext: () => void;
}) {
  return (
    <div
      className="flex items-center justify-end gap-2 text-sm"
      data-testid="qep-execution-pager"
    >
      <span className="text-[var(--color-muted-foreground)]">
        Showing {count === 0 ? 0 : offset + 1}–{offset + count}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={offset === 0}
        onClick={onPrevious}
      >
        Previous
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={count < limit}
        onClick={onNext}
      >
        Next
      </Button>
    </div>
  );
}

function ExplorerView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [offset, setOffset] = useState(0);

  const applied: QepTestExecutionListParams = {
    status: (status || undefined) as QepTestExecutionListParams["status"],
    limit: PAGE_SIZE,
    offset,
  };
  const list = useExecutionList(applied);

  const apply = (nextStatus: string) => {
    setStatus(nextStatus);
    setOffset(0);
    const sp = new URLSearchParams();
    if (nextStatus) sp.set("status", nextStatus);
    const qs = sp.toString();
    router.replace(
      qs
        ? `${QEP_TEST_EXECUTION_ROUTES.explorer}?${qs}`
        : QEP_TEST_EXECUTION_ROUTES.explorer,
    );
  };

  return (
    <QepPageShell
      title="Explorer"
      description="Inventory of Test Executions."
      breadcrumbs={["QEP", "Test Execution", "Explorer"]}
      actions={
        <Link
          className="inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-foreground)]"
          href={QEP_TEST_EXECUTION_ROUTES.new}
        >
          New Execution
        </Link>
      }
    >
      <QepFilterBar>
        <StatusFilterSelect status={status} setStatus={apply} />
      </QepFilterBar>
      {list.isLoading ? <QepLoadingState label="Loading test executions…" /> : null}
      {list.isError ? (
        <QepErrorState
          message={(list.error as Error).message}
          onRetry={() => void list.refetch()}
        />
      ) : null}
      {list.data ? (
        <>
          <ExecutionExplorerTable
            items={list.data.items}
            emptyLabel="No Test Executions match the current filters"
          />
          <Pager
            offset={offset}
            limit={PAGE_SIZE}
            count={list.data.items.length}
            onPrevious={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            onNext={() => setOffset((o) => o + PAGE_SIZE)}
          />
        </>
      ) : null}
    </QepPageShell>
  );
}

function AssignedView() {
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);
  const applied: QepTestExecutionListParams = {
    status: (status || undefined) as QepTestExecutionListParams["status"],
    limit: PAGE_SIZE,
    offset,
  };
  const list = useAssignedExecutionList(applied);

  const onStatusChange = (next: string) => {
    setStatus(next);
    setOffset(0);
  };

  return (
    <QepPageShell
      title="Assigned"
      description="Test Executions assigned to me — ready, in progress, paused, blocked."
      breadcrumbs={["QEP", "Test Execution", "Assigned"]}
    >
      <QepFilterBar>
        <StatusFilterSelect status={status} setStatus={onStatusChange} />
      </QepFilterBar>
      {list.isLoading ? <QepLoadingState label="Loading assigned work…" /> : null}
      {list.isError ? (
        <QepErrorState
          message={(list.error as Error).message}
          onRetry={() => void list.refetch()}
        />
      ) : null}
      {list.data ? (
        <>
          <ExecutionExplorerTable
            items={list.data.items}
            emptyLabel="Nothing assigned to you right now"
          />
          <Pager
            offset={offset}
            limit={PAGE_SIZE}
            count={list.data.items.length}
            onPrevious={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            onNext={() => setOffset((o) => o + PAGE_SIZE)}
          />
        </>
      ) : null}
    </QepPageShell>
  );
}

function ReviewView() {
  const [offset, setOffset] = useState(0);
  const applied: QepTestExecutionListParams = { limit: PAGE_SIZE, offset };
  const list = useReviewQueueExecutionList(applied);

  return (
    <QepPageShell
      title="Review"
      description="Test Executions submitted for review."
      breadcrumbs={["QEP", "Test Execution", "Review"]}
    >
      {list.isLoading ? <QepLoadingState label="Loading review queue…" /> : null}
      {list.isError ? (
        <QepErrorState
          message={(list.error as Error).message}
          onRetry={() => void list.refetch()}
        />
      ) : null}
      {list.data ? (
        <>
          <ExecutionExplorerTable
            items={list.data.items}
            emptyLabel="Nothing awaiting review"
          />
          <Pager
            offset={offset}
            limit={PAGE_SIZE}
            count={list.data.items.length}
            onPrevious={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            onNext={() => setOffset((o) => o + PAGE_SIZE)}
          />
        </>
      ) : null}
    </QepPageShell>
  );
}

function HomeView() {
  const inProgress = useExecutionList({
    status: "in_progress",
    limit: PAGE_SIZE,
    offset: 0,
  });
  const blocked = useExecutionList({ status: "blocked", limit: PAGE_SIZE, offset: 0 });
  const assigned = useAssignedExecutionList({ limit: PAGE_SIZE, offset: 0 });
  const review = useReviewQueueExecutionList({ limit: PAGE_SIZE, offset: 0 });

  const cards = [
    {
      label: "Assigned to me",
      total: assigned.data?.total ?? 0,
      href: QEP_TEST_EXECUTION_ROUTES.assigned,
      loading: assigned.isLoading,
    },
    {
      label: "In progress",
      total: inProgress.data?.total ?? 0,
      href: `${QEP_TEST_EXECUTION_ROUTES.explorer}?status=in_progress`,
      loading: inProgress.isLoading,
    },
    {
      label: "Blocked",
      total: blocked.data?.total ?? 0,
      href: `${QEP_TEST_EXECUTION_ROUTES.explorer}?status=blocked`,
      loading: blocked.isLoading,
    },
    {
      label: "Submitted for review",
      total: review.data?.total ?? 0,
      href: QEP_TEST_EXECUTION_ROUTES.review,
      loading: review.isLoading,
    },
  ];

  return (
    <QepPageShell
      title="Test Execution"
      description="Attention and counts for Test Execution orchestration."
      breadcrumbs={["QEP", "Test Execution"]}
      actions={
        <Link
          className="inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-foreground)]"
          href={QEP_TEST_EXECUTION_ROUTES.new}
        >
          New Execution
        </Link>
      }
    >
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        data-testid="qep-execution-dashboard"
      >
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-[var(--color-border)] p-4 hover:bg-[var(--color-muted)]"
          >
            <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-semibold">
              {card.loading ? "…" : card.total}
            </p>
          </Link>
        ))}
      </div>
      <QepPanel title="Submitted for review">
        {review.isLoading ? <QepLoadingState label="Loading…" /> : null}
        {review.data ? (
          <ExecutionExplorerTable
            items={review.data.items}
            emptyLabel="Nothing awaiting review"
          />
        ) : null}
      </QepPanel>
    </QepPageShell>
  );
}

function CreateExecutionView() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [projectId, setProjectId] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [planId, setPlanId] = useState("");
  const [planVersionLabel, setPlanVersionLabel] = useState("");

  const create = useMutation({
    mutationFn: () => {
      const input: CreateQepTestExecutionInput = {
        projectId,
        workspaceId,
        ownerId: DEFAULT_ACTOR,
        sourceRefs: {
          planRef: {
            capability: "plan",
            id: planId,
            versionLabel: planVersionLabel,
          },
        },
      };
      return createExecution(input);
    },
    onSuccess: (dto) => {
      router.push(QEP_TEST_EXECUTION_ROUTES.detail(dto.id));
    },
    onError: (err) => {
      setError((err as Error).message);
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate();
  };

  return (
    <QepPageShell title="New Execution" breadcrumbs={["QEP", "Test Execution", "New"]}>
      <form
        className="grid max-w-2xl gap-3"
        onSubmit={onSubmit}
        data-testid="qep-execution-create"
      >
        <label className="flex flex-col gap-1 text-sm">
          Project ID
          <Input
            required
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            aria-label="Project ID"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Workspace ID
          <Input
            required
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            aria-label="Workspace ID"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Plan ID
          <Input
            required
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            aria-label="Plan ID"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Plan version label
          <Input
            required
            value={planVersionLabel}
            onChange={(e) => setPlanVersionLabel(e.target.value)}
            aria-label="Plan version label"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={create.isPending}>
          Create draft
        </Button>
      </form>
    </QepPageShell>
  );
}

function ActionDialog({
  title,
  open,
  onClose,
  children,
}: {
  readonly title: string;
  readonly open: boolean;
  readonly onClose: () => void;
  readonly children: ReactNode;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current =
      typeof document !== "undefined"
        ? (document.activeElement as HTMLElement | null)
        : null;
    const panel = panelRef.current;
    const focusable = () =>
      panel
        ? Array.from(
            panel.querySelectorAll<HTMLElement>(
              'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          )
        : [];
    const first = focusable()[0];
    first?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const items = focusable();
      if (items.length === 0) return;
      const firstEl = items[0]!;
      const lastEl = items[items.length - 1]!;
      if (event.shiftKey && document.activeElement === firstEl) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      data-testid="qep-execution-action-dialog-backdrop"
    >
      <div
        ref={panelRef}
        className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="qep-execution-action-dialog"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 id={titleId} className="text-lg font-semibold">
            {title}
          </h2>
          <Button type="button" variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * Action bar bound solely to `availableActions` — never status-derived
 * (OES-ENG-090A PART-04 §3.3).
 */
function ExecutionActionBar({ dto }: { readonly dto: TestExecutionDto }) {
  const queryClient = useQueryClient();
  const [dialogAction, setDialogAction] = useState<ExecutionActionDescriptor | null>(
    null,
  );
  const [reason, setReason] = useState("");
  const [executorId, setExecutorId] = useState("");
  const [reviewerId, setReviewerId] = useState("");
  const [agentIdentity, setAgentIdentity] = useState("");
  const [allowReassignInProgress, setAllowReassignInProgress] = useState(false);
  const [outcomeOverride, setOutcomeOverride] = useState("");
  const [successorExecutionId, setSuccessorExecutionId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: qepQueryKeys.executions.detail(dto.id),
    });
    await queryClient.invalidateQueries({ queryKey: qepQueryKeys.executions.all() });
  };

  const run = useMutation({
    mutationFn: async (descriptor: ExecutionActionDescriptor) => {
      setError(null);
      const slug = resolveExecutionActionSlug(descriptor.action);
      const body: PerformQepExecutionActionInput = {
        expectedRevision: dto.revision,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
        ...(descriptor.action === "assignExecutor"
          ? {
              ...(executorId.trim() ? { executorId: executorId.trim() } : {}),
              ...(reviewerId.trim() ? { reviewerId: reviewerId.trim() } : {}),
              ...(agentIdentity.trim() ? { agentIdentity: agentIdentity.trim() } : {}),
              ...(allowReassignInProgress ? { allowReassignInProgress: true } : {}),
            }
          : {}),
        ...(descriptor.action === "acceptExecution" && outcomeOverride.trim()
          ? { outcomeOverride: outcomeOverride.trim() }
          : {}),
        ...(descriptor.action === "supersedeExecution"
          ? { successorExecutionId: successorExecutionId.trim() }
          : {}),
      };
      return performExecutionAction(dto.id, slug, body);
    },
    onSuccess: async () => {
      await invalidate();
      setDialogAction(null);
      setReason("");
      setExecutorId("");
      setReviewerId("");
      setAgentIdentity("");
      setAllowReassignInProgress(false);
      setOutcomeOverride("");
      setSuccessorExecutionId("");
    },
    onError: (err) => setError((err as Error).message),
  });

  const actionBar = getExecutionActionBarDescriptors(dto.availableActions);

  const needsDialog = (descriptor: ExecutionActionDescriptor) =>
    descriptor.requiresConfirmation ||
    descriptor.reasonRequired ||
    descriptor.action === "assignExecutor" ||
    descriptor.action === "acceptExecution" ||
    descriptor.action === "supersedeExecution";

  const openDialog = (descriptor: ExecutionActionDescriptor) => {
    setError(null);
    setReason("");
    setExecutorId(dto.assignment.executorId ?? "");
    setReviewerId(dto.assignment.reviewerId ?? "");
    setAgentIdentity(dto.assignment.agentIdentity ?? "");
    setAllowReassignInProgress(false);
    setOutcomeOverride("");
    setSuccessorExecutionId("");
    setDialogAction(descriptor);
  };

  const confirmDisabled =
    (Boolean(dialogAction?.reasonRequired) && !reason.trim()) ||
    (dialogAction?.action === "supersedeExecution" && !successorExecutionId.trim());

  if (actionBar.length === 0) {
    return (
      <p
        className="text-sm text-[var(--color-muted-foreground)]"
        data-testid="qep-execution-actions-empty"
      >
        No actions available.
      </p>
    );
  }

  return (
    <div
      className="flex flex-wrap items-start gap-2"
      data-testid="qep-execution-actions"
    >
      {actionBar.map((descriptor) => (
        <Button
          key={descriptor.action}
          type="button"
          variant={descriptor.dangerous ? "outline" : "default"}
          onClick={() =>
            needsDialog(descriptor) ? openDialog(descriptor) : run.mutate(descriptor)
          }
        >
          {descriptor.label}
        </Button>
      ))}
      {error && !dialogAction ? (
        <p className="w-full text-sm text-red-600">{error}</p>
      ) : null}

      <ActionDialog
        title={dialogAction?.label ?? ""}
        open={Boolean(dialogAction)}
        onClose={() => setDialogAction(null)}
      >
        {dialogAction ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {dialogAction.label} this Test Execution?
            </p>
            {dialogAction.action === "assignExecutor" ? (
              <>
                <label className="flex flex-col gap-1 text-sm">
                  Executor ID
                  <Input
                    value={executorId}
                    onChange={(e) => setExecutorId(e.target.value)}
                    aria-label="Executor ID"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Reviewer ID
                  <Input
                    value={reviewerId}
                    onChange={(e) => setReviewerId(e.target.value)}
                    aria-label="Reviewer ID"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  Agent identity
                  <Input
                    value={agentIdentity}
                    onChange={(e) => setAgentIdentity(e.target.value)}
                    aria-label="Agent identity"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={allowReassignInProgress}
                    onChange={(e) => setAllowReassignInProgress(e.target.checked)}
                    aria-label="Allow reassign in progress"
                  />
                  Allow reassign while in progress
                </label>
              </>
            ) : null}
            {dialogAction.action === "acceptExecution" ? (
              <label className="flex flex-col gap-1 text-sm">
                Outcome override (optional)
                <Input
                  value={outcomeOverride}
                  onChange={(e) => setOutcomeOverride(e.target.value)}
                  aria-label="Outcome override"
                />
              </label>
            ) : null}
            {dialogAction.action === "supersedeExecution" ? (
              <label className="flex flex-col gap-1 text-sm">
                Successor execution ID (required)
                <Input
                  required
                  value={successorExecutionId}
                  onChange={(e) => setSuccessorExecutionId(e.target.value)}
                  aria-label="Successor execution ID"
                />
              </label>
            ) : null}
            {dialogAction.reasonRequired ||
            dialogAction.action === "cancelExecution" ? (
              <label className="flex flex-col gap-1 text-sm">
                Reason {dialogAction.reasonRequired ? "(required)" : "(optional)"}
                <textarea
                  className="min-h-[4rem] rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  aria-label="Reason"
                  required={dialogAction.reasonRequired}
                />
              </label>
            ) : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                data-testid={`qep-execution-confirm-${dialogAction.action}`}
                disabled={confirmDisabled || run.isPending}
                onClick={() => run.mutate(dialogAction)}
              >
                Confirm
              </Button>
            </div>
          </div>
        ) : null}
      </ActionDialog>
    </div>
  );
}

function StepsPanel({ dto }: { readonly dto: TestExecutionDto }) {
  const queryClient = useQueryClient();
  const canRecord = hasExecutionAction(dto.availableActions, "recordStepResult");
  const [selectedOrder, setSelectedOrder] = useState<number | null>(
    dto.steps[0]?.order ?? null,
  );
  const [outcome, setOutcome] = useState<string>(STEP_OUTCOME_OPTIONS[0]);
  const [actualResult, setActualResult] = useState("");
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const record = useMutation({
    mutationFn: async () => {
      setError(null);
      if (selectedOrder === null) throw new Error("Select a step");
      const reasonField = reasonFieldForStepOutcome(outcome);
      return recordExecutionStepResult(dto.id, selectedOrder, {
        expectedRevision: dto.revision,
        outcome,
        actualResult: actualResult.trim() || undefined,
        comment: comment.trim() || undefined,
        ...(reasonField ? { [reasonField]: reason.trim() } : {}),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: qepQueryKeys.executions.detail(dto.id),
      });
      setActualResult("");
      setReason("");
      setComment("");
    },
    onError: (err) => setError((err as Error).message),
  });

  const reasonField = reasonFieldForStepOutcome(outcome);

  return (
    <QepPanel title="Steps">
      {dto.steps.length === 0 ? (
        <QepEmptyState title="No steps sealed on this execution" />
      ) : (
        <QepTable
          caption="Execution steps"
          columns={[
            "#",
            "Instruction",
            "Expected result",
            "Outcome",
            "Actual result",
            "Attempts",
          ]}
          rows={dto.steps.map((step: ExecutionStepDto) => ({
            id: String(step.order),
            cells: [
              step.order,
              step.instruction,
              step.expectedResult,
              step.outcome ? (
                <QepStatusBadge key={`o-${step.order}`} status={step.outcome} />
              ) : (
                "—"
              ),
              step.actualResult ?? "—",
              step.attemptCount,
            ],
          }))}
        />
      )}
      {canRecord ? (
        <form
          className="mt-4 grid max-w-lg gap-3"
          data-testid="qep-execution-record-step-form"
          onSubmit={(e) => {
            e.preventDefault();
            record.mutate();
          }}
        >
          <label className="flex flex-col gap-1 text-sm">
            Step
            <select
              className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={selectedOrder ?? ""}
              onChange={(e) => setSelectedOrder(Number(e.target.value))}
              aria-label="Step order"
            >
              {dto.steps.map((step: ExecutionStepDto) => (
                <option key={step.order} value={step.order}>
                  #{step.order} — {step.instruction}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Outcome
            <select
              className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              aria-label="Step outcome"
            >
              {STEP_OUTCOME_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Actual result
            <Input
              value={actualResult}
              onChange={(e) => setActualResult(e.target.value)}
              aria-label="Actual result"
            />
          </label>
          {reasonField ? (
            <label className="flex flex-col gap-1 text-sm">
              Reason (required for {outcome})
              <Input
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                aria-label="Step outcome reason"
              />
            </label>
          ) : null}
          <label className="flex flex-col gap-1 text-sm">
            Comment
            <Input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              aria-label="Step comment"
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={record.isPending}>
            Record result
          </Button>
        </form>
      ) : null}
    </QepPanel>
  );
}

function EvidencePanel({ dto }: { readonly dto: TestExecutionDto }) {
  const queryClient = useQueryClient();
  const canAssociate = hasExecutionAction(dto.availableActions, "associateEvidence");
  const [uri, setUri] = useState("");
  const [integrityHash, setIntegrityHash] = useState("");
  const [error, setError] = useState<string | null>(null);

  const associate = useMutation({
    mutationFn: async () => {
      setError(null);
      return associateExecutionEvidence(dto.id, {
        expectedRevision: dto.revision,
        uri: uri.trim(),
        integrityHash: integrityHash.trim() || undefined,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: qepQueryKeys.executions.detail(dto.id),
      });
      setUri("");
      setIntegrityHash("");
    },
    onError: (err) => setError((err as Error).message),
  });

  return (
    <QepPanel title="Evidence">
      {dto.evidenceReferences.length === 0 ? (
        <QepEmptyState title="No evidence associated yet" />
      ) : (
        <ul
          className="flex flex-col gap-1 text-sm"
          data-testid="qep-execution-evidence-list"
        >
          {dto.evidenceReferences.map((evidence: EvidenceReferenceDto) => (
            <li
              key={evidence.id}
              className="rounded border border-[var(--color-border)] p-2"
            >
              <a
                className="text-[var(--color-primary)] underline"
                href={evidence.uri}
                target="_blank"
                rel="noreferrer"
              >
                {evidence.uri}
              </a>
              <span className="ml-2 text-xs text-[var(--color-muted-foreground)]">
                {evidence.stepOrder !== undefined
                  ? `Step #${evidence.stepOrder} · `
                  : ""}
                {formatDate(evidence.associatedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {canAssociate ? (
        <form
          className="mt-4 grid max-w-lg gap-3"
          data-testid="qep-execution-associate-evidence-form"
          onSubmit={(e) => {
            e.preventDefault();
            associate.mutate();
          }}
        >
          <label className="flex flex-col gap-1 text-sm">
            Evidence URI
            <Input
              required
              value={uri}
              onChange={(e) => setUri(e.target.value)}
              aria-label="Evidence URI"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Integrity hash (optional)
            <Input
              value={integrityHash}
              onChange={(e) => setIntegrityHash(e.target.value)}
              aria-label="Integrity hash"
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={associate.isPending}>
            Associate evidence
          </Button>
        </form>
      ) : null}
    </QepPanel>
  );
}

function ObservationsPanel({ dto }: { readonly dto: TestExecutionDto }) {
  const queryClient = useQueryClient();
  const canRecord = hasExecutionAction(dto.availableActions, "recordObservation");
  const [body, setBody] = useState("");
  const [severityHint, setSeverityHint] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const record = useMutation({
    mutationFn: async () => {
      setError(null);
      return recordExecutionObservation(dto.id, {
        expectedRevision: dto.revision,
        body: body.trim(),
        severityHint: (severityHint || undefined) as
          "info" | "warning" | "critical" | undefined,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: qepQueryKeys.executions.detail(dto.id),
      });
      setBody("");
      setSeverityHint("");
    },
    onError: (err) => setError((err as Error).message),
  });

  return (
    <QepPanel title="Observations">
      {dto.observations.length === 0 ? (
        <QepEmptyState title="No observations recorded yet" />
      ) : (
        <ul
          className="flex flex-col gap-1 text-sm"
          data-testid="qep-execution-observations-list"
        >
          {dto.observations.map((observation: ExecutionObservationDto) => (
            <li
              key={observation.id}
              className="rounded border border-[var(--color-border)] p-2"
            >
              <p>{observation.body}</p>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                {observation.severityHint ? `${observation.severityHint} · ` : ""}
                {observation.actorId} · {formatDate(observation.recordedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
      {canRecord ? (
        <form
          className="mt-4 grid max-w-lg gap-3"
          data-testid="qep-execution-record-observation-form"
          onSubmit={(e) => {
            e.preventDefault();
            record.mutate();
          }}
        >
          <label className="flex flex-col gap-1 text-sm">
            Observation
            <textarea
              required
              className="min-h-[4rem] rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              aria-label="Observation body"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Severity hint (optional)
            <select
              className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
              value={severityHint}
              onChange={(e) => setSeverityHint(e.target.value)}
              aria-label="Severity hint"
            >
              <option value="">None</option>
              {SEVERITY_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit" disabled={record.isPending}>
            Record observation
          </Button>
        </form>
      ) : null}
    </QepPanel>
  );
}

function SourceRefsPanel({ dto }: { readonly dto: TestExecutionDto }) {
  return (
    <QepPanel title="Source">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-[var(--color-muted-foreground)]">Plan</dt>
        <dd>{dto.planRef ? `${dto.planRef.id} @ ${dto.planRef.versionLabel}` : "—"}</dd>
        <dt className="text-[var(--color-muted-foreground)]">Specification</dt>
        <dd>{dto.specRef ? `${dto.specRef.id} @ ${dto.specRef.versionLabel}` : "—"}</dd>
        <dt className="text-[var(--color-muted-foreground)]">Mode</dt>
        <dd>{dto.mode}</dd>
        <dt className="text-[var(--color-muted-foreground)]">Outcome</dt>
        <dd>{dto.outcome ?? "—"}</dd>
      </dl>
    </QepPanel>
  );
}

function AssignmentPanel({ dto }: { readonly dto: TestExecutionDto }) {
  return (
    <QepPanel title="Assignment">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-[var(--color-muted-foreground)]">Owner</dt>
        <dd>{dto.assignment.ownerId}</dd>
        <dt className="text-[var(--color-muted-foreground)]">Executor</dt>
        <dd>{dto.assignment.executorId ?? "—"}</dd>
        <dt className="text-[var(--color-muted-foreground)]">Reviewer</dt>
        <dd>{dto.assignment.reviewerId ?? "—"}</dd>
        <dt className="text-[var(--color-muted-foreground)]">Agent identity</dt>
        <dd>{dto.assignment.agentIdentity ?? "—"}</dd>
      </dl>
    </QepPanel>
  );
}

function ReviewPanel({ dto }: { readonly dto: TestExecutionDto }) {
  if (!dto.review) return null;
  return (
    <QepPanel title="Review decision">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-[var(--color-muted-foreground)]">Reviewer</dt>
        <dd>{dto.review.reviewerId}</dd>
        <dt className="text-[var(--color-muted-foreground)]">Decision</dt>
        <dd>
          <QepStatusBadge status={dto.review.decision} />
        </dd>
        <dt className="text-[var(--color-muted-foreground)]">Decided at</dt>
        <dd>{formatDate(dto.review.decidedAt)}</dd>
        <dt className="text-[var(--color-muted-foreground)]">Reason</dt>
        <dd>{dto.review.reason ?? "—"}</dd>
      </dl>
    </QepPanel>
  );
}

function HistoryView({
  id,
  dto,
}: {
  readonly id: string;
  readonly dto: TestExecutionDto;
}) {
  const history = useQuery({
    queryKey: qepQueryKeys.executions.history(id),
    queryFn: ({ signal }) => getExecutionHistory(id, { signal }),
  });

  return (
    <QepPageShell
      title={`${dto.executionNumber} — History`}
      breadcrumbs={["QEP", "Test Execution", dto.executionNumber, "History"]}
      actions={
        <Link
          className="text-sm text-[var(--color-primary)] underline"
          href={QEP_TEST_EXECUTION_ROUTES.detail(id)}
        >
          Back to Execution
        </Link>
      }
    >
      {history.isLoading ? <QepLoadingState label="Loading history…" /> : null}
      {history.isError ? (
        <QepErrorState
          message={(history.error as Error).message}
          onRetry={() => void history.refetch()}
        />
      ) : null}
      {history.data ? (
        history.data.entries.length === 0 ? (
          <QepEmptyState title="No history entries yet" />
        ) : (
          <QepTable
            caption="Execution history"
            columns={["#", "At", "Actor", "Action", "Summary", "From", "To"]}
            rows={history.data.entries.map((entry) => ({
              id: String(entry.sequence),
              cells: [
                entry.sequence,
                formatDate(entry.at),
                entry.actorId,
                entry.action,
                entry.summary,
                entry.fromStatus ?? "—",
                entry.toStatus ?? "—",
              ],
            }))}
          />
        )
      ) : null}
    </QepPageShell>
  );
}

function ExecutionDetailView({
  id,
  mode,
}: {
  readonly id: string;
  readonly mode: ReturnType<typeof parseQepTestExecutionDetailMode>;
}) {
  const detail = useQuery({
    queryKey: qepQueryKeys.executions.detail(id),
    queryFn: ({ signal }) => getExecution(id, { signal }),
  });

  if (detail.isLoading) {
    return (
      <QepPageShell title="Test Execution" breadcrumbs={["QEP", "Test Execution"]}>
        <QepLoadingState label="Loading execution…" />
      </QepPageShell>
    );
  }
  if (detail.isError) {
    const err = detail.error as Error & { status?: number };
    return (
      <QepPageShell title="Test Execution" breadcrumbs={["QEP", "Test Execution"]}>
        <QepErrorState
          message={
            err.status === 403
              ? "You do not have permission to view this Test Execution."
              : err.status === 404
                ? "Test Execution not found."
                : err.message
          }
          onRetry={() => void detail.refetch()}
        />
      </QepPageShell>
    );
  }
  const dto = detail.data!;

  if (mode === "history") {
    return <HistoryView id={id} dto={dto} />;
  }

  return (
    <QepPageShell
      title={`${dto.executionNumber}`}
      description="Test Execution workspace"
      breadcrumbs={["QEP", "Test Execution", dto.executionNumber]}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <QepStatusBadge status={dto.status} />
          <Link
            className="text-sm text-[var(--color-primary)] underline"
            href={QEP_TEST_EXECUTION_ROUTES.history(id)}
          >
            History
          </Link>
        </div>
      }
    >
      <ExecutionActionBar dto={dto} />
      <div className="grid gap-4 lg:grid-cols-2">
        <SourceRefsPanel dto={dto} />
        <AssignmentPanel dto={dto} />
      </div>
      <StepsPanel dto={dto} />
      <div className="grid gap-4 lg:grid-cols-2">
        <EvidencePanel dto={dto} />
        <ObservationsPanel dto={dto} />
      </div>
      <ReviewPanel dto={dto} />
    </QepPageShell>
  );
}

/**
 * APZQEP-ENG-100E — Test Execution Workbench router.
 */
export function QepTestExecutionRouterView({
  pathname,
}: {
  readonly pathname: string;
}) {
  const id = parseQepTestExecutionRouteId(pathname);
  const mode = parseQepTestExecutionDetailMode(pathname);

  if (id) {
    return <ExecutionDetailView id={id} mode={mode} />;
  }
  if (isQepTestExecutionNewRoute(pathname)) {
    return <CreateExecutionView />;
  }
  if (isQepTestExecutionExplorerRoute(pathname)) {
    return <ExplorerView />;
  }
  if (isQepTestExecutionAssignedRoute(pathname)) {
    return <AssignedView />;
  }
  if (isQepTestExecutionReviewRoute(pathname)) {
    return <ReviewView />;
  }

  return <HomeView />;
}
