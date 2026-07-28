"use client";

import type {
  CreateQepTestPlanInput,
  QepTestPlanAction,
  QepTestPlanDto,
  QepTestPlanHistorySummaryDto,
} from "@apzhub/qep-contracts";
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
  addPlanItem,
  approvePlan,
  archivePlan,
  cancelPlan,
  clonePlan,
  completePlan,
  createPlan,
  getPlan,
  getPlanHistory,
  listPlanVersions,
  listPlans,
  markPlanReady,
  rejectPlan,
  removePlanItem,
  returnPlanToDraft,
  startPlanExecution,
  submitPlanForReview,
  supersedePlan,
  transferPlanOwnership,
  updatePlanAssignment,
  updatePlanContent,
  updatePlanMetadata,
  updatePlanSchedule,
  type QepTestPlanListParams,
} from "@/lib/qep/qep-test-plan-api";
import { qepQueryKeys } from "@/lib/qep/query-keys";
import {
  QEP_TEST_PLAN_ROUTES,
  QEP_TEST_SPECIFICATION_ROUTES,
  isQepTestPlansExplorerRoute,
  isQepTestPlansNewRoute,
  isQepTestPlansReviewRoute,
  isQepTestPlansSearchRoute,
  parseQepTestPlanDetailMode,
  parseQepTestPlanRouteId,
} from "@/lib/qep/routes";
import { emitQepWorkbenchTelemetry } from "@/lib/qep/telemetry";

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

const PAGE_SIZE = 50;
const DEFAULT_ACTOR = "workbench-user";

const STATUS_OPTIONS = [
  "draft",
  "review",
  "approved",
  "rejected",
  "ready",
  "in_execution",
  "completed",
  "archived",
  "cancelled",
  "superseded",
] as const;

const ACTION_LABELS: Record<QepTestPlanAction, string> = {
  updateContent: "Edit draft",
  updateMetadata: "Update metadata",
  transferOwnership: "Transfer ownership",
  updateAssignment: "Update assignment",
  updateSchedule: "Update schedule",
  addItem: "Add item",
  updateItem: "Update item",
  removeItem: "Remove item",
  reorderItems: "Reorder items",
  submitForReview: "Submit for review",
  approve: "Approve",
  reject: "Reject",
  returnToDraft: "Return to draft",
  markReady: "Mark ready",
  startExecution: "Start execution",
  complete: "Complete",
  archive: "Archive",
  cancel: "Cancel",
  supersede: "Supersede",
  clone: "Clone",
};

const ITEM_LEVEL_ACTIONS: readonly QepTestPlanAction[] = [
  "addItem",
  "updateItem",
  "removeItem",
  "reorderItems",
];

const SIMPLE_CONFIRM_ACTIONS: readonly QepTestPlanAction[] = [
  "submitForReview",
  "returnToDraft",
  "markReady",
  "startExecution",
  "complete",
  "archive",
  "cancel",
];

function hasAction(dto: QepTestPlanDto, action: QepTestPlanAction): boolean {
  return dto.availableActions.includes(action);
}

function formatDate(value?: string): string {
  return value ? value : "—";
}

function GovernedUnavailable({ capability }: { readonly capability: string }) {
  return (
    <p
      className="rounded-md border border-dashed border-[var(--color-border)] p-3 text-sm text-[var(--color-muted-foreground)]"
      role="status"
      data-testid="qep-plan-unavailable"
    >
      {capability} is not available in this platform baseline.
    </p>
  );
}

function usePlanList(params: QepTestPlanListParams) {
  return useQuery({
    queryKey: qepQueryKeys.plans.list(params),
    queryFn: ({ signal }) => listPlans(params, { signal }),
  });
}

function ExplorerTable({
  items,
  emptyLabel,
}: {
  readonly items: readonly QepTestPlanDto[];
  readonly emptyLabel: string;
}) {
  if (items.length === 0) {
    return <QepEmptyState title={emptyLabel} />;
  }
  return (
    <QepTable
      caption="Test Plans"
      columns={["Number", "Title", "Status", "Version", "Type", "Priority", "Owner", "Updated"]}
      rows={items.map((row) => ({
        id: row.id,
        href: QEP_TEST_PLAN_ROUTES.detail(row.id),
        cells: [
          <Link
            key={`${row.id}-num`}
            className="font-medium text-[var(--color-primary)] underline"
            href={QEP_TEST_PLAN_ROUTES.detail(row.id)}
            data-testid={`qep-plan-row-${row.id}`}
          >
            {row.number}
          </Link>,
          row.title,
          <QepStatusBadge key={`${row.id}-status`} status={row.status} />,
          row.versionLabel,
          row.planType,
          row.priority,
          row.ownerId,
          formatDate(row.updatedAt),
        ],
      }))}
    />
  );
}

function FilterControls({
  status,
  setStatus,
  query,
  setQuery,
  planType,
  setPlanType,
  onApply,
}: {
  readonly status: string;
  readonly setStatus: (v: string) => void;
  readonly query: string;
  readonly setQuery: (v: string) => void;
  readonly planType: string;
  readonly setPlanType: (v: string) => void;
  readonly onApply: () => void;
}) {
  return (
    <QepFilterBar>
      <label className="flex flex-col gap-1 text-xs">
        Status
        <select
          className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          aria-label="Filter by status"
          data-testid="qep-plan-status-filter"
        >
          <option value="">All</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs">
        Plan type
        <Input
          value={planType}
          onChange={(e) => setPlanType(e.target.value)}
          placeholder="e.g. regression"
          aria-label="Filter by plan type"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs">
        Query
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search text"
          aria-label="Text query"
        />
      </label>
      <Button type="button" onClick={onApply}>
        Apply
      </Button>
    </QepFilterBar>
  );
}

function PlanExplorerView({
  initialStatus,
  title,
  description,
}: {
  readonly initialStatus?: string;
  readonly title: string;
  readonly description: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus ?? searchParams.get("status") ?? "");
  const [planType, setPlanType] = useState(searchParams.get("planType") ?? "");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [applied, setApplied] = useState<QepTestPlanListParams>({
    status: initialStatus ?? searchParams.get("status") ?? undefined,
    planType: searchParams.get("planType") ?? undefined,
    query: searchParams.get("q") ?? undefined,
    limit: PAGE_SIZE,
    offset: 0,
  });

  useEffect(() => {
    if (initialStatus) setStatus(initialStatus);
  }, [initialStatus]);

  const list = usePlanList(applied);

  const apply = () => {
    const next: QepTestPlanListParams = {
      status: status || undefined,
      planType: planType || undefined,
      query: query || undefined,
      limit: PAGE_SIZE,
      offset: 0,
    };
    setApplied(next);
    const sp = new URLSearchParams();
    if (next.status) sp.set("status", next.status);
    if (next.planType) sp.set("planType", next.planType);
    if (next.query) sp.set("q", next.query);
    const qs = sp.toString();
    const base = initialStatus ? QEP_TEST_PLAN_ROUTES.review : QEP_TEST_PLAN_ROUTES.explorer;
    router.replace(qs ? `${base}?${qs}` : base);
  };

  return (
    <QepPageShell
      title={title}
      description={description}
      breadcrumbs={["QEP", "Test Plans", title]}
      actions={
        <Link
          className="inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-foreground)]"
          href={QEP_TEST_PLAN_ROUTES.new}
        >
          New Plan
        </Link>
      }
    >
      <FilterControls
        status={status}
        setStatus={setStatus}
        query={query}
        setQuery={setQuery}
        planType={planType}
        setPlanType={setPlanType}
        onApply={apply}
      />
      {list.isLoading ? <QepLoadingState label="Loading plans…" /> : null}
      {list.isError ? (
        <QepErrorState
          message={(list.error as Error).message}
          onRetry={() => void list.refetch()}
        />
      ) : null}
      {list.data ? (
        <ExplorerTable
          items={list.data.items}
          emptyLabel={
            initialStatus ? "No Plans awaiting review" : "No Plans match the current filters"
          }
        />
      ) : null}
    </QepPageShell>
  );
}

function DashboardView() {
  const draft = usePlanList({ status: "draft", limit: 5, offset: 0 });
  const review = usePlanList({ status: "review", limit: 5, offset: 0 });
  const approved = usePlanList({ status: "approved", limit: 5, offset: 0 });

  const cards = [
    {
      label: "Draft",
      total: draft.data?.total ?? 0,
      href: `${QEP_TEST_PLAN_ROUTES.explorer}?status=draft`,
      loading: draft.isLoading,
    },
    {
      label: "In review",
      total: review.data?.total ?? 0,
      href: QEP_TEST_PLAN_ROUTES.review,
      loading: review.isLoading,
    },
    {
      label: "Approved",
      total: approved.data?.total ?? 0,
      href: `${QEP_TEST_PLAN_ROUTES.explorer}?status=approved`,
      loading: approved.isLoading,
    },
  ];

  return (
    <QepPageShell
      title="Test Plans"
      description="Attention and counts for Test Plan orchestration."
      breadcrumbs={["QEP", "Test Plans", "Dashboard"]}
      actions={
        <Link
          className="inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-foreground)]"
          href={QEP_TEST_PLAN_ROUTES.new}
        >
          New Plan
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3" data-testid="qep-plan-dashboard">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-[var(--color-border)] p-4 hover:bg-[var(--color-muted)]"
          >
            <p className="text-xs uppercase text-[var(--color-muted-foreground)]">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold">{card.loading ? "…" : card.total}</p>
          </Link>
        ))}
      </div>
      <QepPanel title="Recently in review">
        {review.isLoading ? <QepLoadingState label="Loading…" /> : null}
        {review.data ? (
          <ExplorerTable items={review.data.items} emptyLabel="Nothing awaiting review" />
        ) : null}
      </QepPanel>
    </QepPageShell>
  );
}

function SearchView() {
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState("");
  const list = usePlanList(
    applied ? { query: applied, limit: PAGE_SIZE, offset: 0 } : { limit: 0, offset: 0 },
  );

  return (
    <QepPageShell
      title="Search Plans"
      description="Capability-scoped search over Test Plans."
      breadcrumbs={["QEP", "Test Plans", "Search"]}
    >
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setApplied(q.trim());
        }}
      >
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, number, tags…"
          aria-label="Search plans"
          className="min-w-[16rem] flex-1"
        />
        <Button type="submit">Search</Button>
      </form>
      {!applied ? (
        <QepEmptyState title="Enter a query to search Plans" />
      ) : list.isLoading ? (
        <QepLoadingState label="Searching…" />
      ) : list.isError ? (
        <QepErrorState message={(list.error as Error).message} />
      ) : (
        <ExplorerTable items={list.data?.items ?? []} emptyLabel="No results" />
      )}
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
      typeof document !== "undefined" ? (document.activeElement as HTMLElement | null) : null;
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
      data-testid="qep-plan-action-dialog-backdrop"
    >
      <div
        ref={panelRef}
        className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="qep-plan-action-dialog"
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

type SupersedeResultShape = {
  readonly successor?: QepTestPlanDto;
  readonly source?: QepTestPlanDto;
  readonly predecessor?: QepTestPlanDto;
  readonly id?: string;
  readonly successorPlanId?: string;
};

function PlanActions({ dto }: { readonly dto: QepTestPlanDto }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<QepTestPlanAction | null>(null);
  const [approveComment, setApproveComment] = useState("");
  const [rejectComment, setRejectComment] = useState("");
  const [supersedeSuccessorNumber, setSupersedeSuccessorNumber] = useState("");
  const [cloneNumber, setCloneNumber] = useState("");
  const [cloneTitle, setCloneTitle] = useState("");
  const [metadataKey, setMetadataKey] = useState("");
  const [metadataValue, setMetadataValue] = useState("");
  const [ownerId, setOwnerId] = useState(dto.ownerId);
  const [assignmentLeadId, setAssignmentLeadId] = useState(dto.assignment.leadId ?? "");
  const [assignmentAssigneeIds, setAssignmentAssigneeIds] = useState(
    dto.assignment.assigneeIds.join(", "),
  );
  const [schedulePlannedStart, setSchedulePlannedStart] = useState(
    dto.schedule.plannedStart ?? "",
  );
  const [schedulePlannedEnd, setSchedulePlannedEnd] = useState(dto.schedule.plannedEnd ?? "");
  const [scheduleMilestoneRef, setScheduleMilestoneRef] = useState(
    dto.schedule.milestoneRef ?? "",
  );
  const [scheduleTimezone, setScheduleTimezone] = useState(dto.schedule.timezone ?? "");
  const [error, setError] = useState<string | null>(null);

  const invalidate = async (id: string) => {
    await queryClient.invalidateQueries({ queryKey: qepQueryKeys.plans.detail(id) });
    await queryClient.invalidateQueries({ queryKey: qepQueryKeys.plans.all() });
  };

  const run = useMutation({
    mutationFn: async (action: QepTestPlanAction) => {
      setError(null);
      const started = performance.now();
      try {
        let navigateTo: string | undefined;
        switch (action) {
          case "updateContent":
            router.push(QEP_TEST_PLAN_ROUTES.edit(dto.id));
            return undefined;
          case "submitForReview":
            await submitPlanForReview(dto.id, { expectedRevision: dto.revision });
            break;
          case "approve":
            await approvePlan(dto.id, {
              comment: approveComment || undefined,
              expectedRevision: dto.revision,
            });
            break;
          case "reject":
            await rejectPlan(dto.id, {
              comment: rejectComment,
              expectedRevision: dto.revision,
            });
            break;
          case "returnToDraft":
            await returnPlanToDraft(dto.id, { expectedRevision: dto.revision });
            break;
          case "markReady":
            await markPlanReady(dto.id, { expectedRevision: dto.revision });
            break;
          case "startExecution":
            await startPlanExecution(dto.id, { expectedRevision: dto.revision });
            break;
          case "complete":
            await completePlan(dto.id, { expectedRevision: dto.revision });
            break;
          case "archive":
            await archivePlan(dto.id, { expectedRevision: dto.revision });
            break;
          case "cancel":
            await cancelPlan(dto.id, { expectedRevision: dto.revision });
            break;
          case "supersede": {
            const result = (await supersedePlan(dto.id, {
              successorNumber: supersedeSuccessorNumber || undefined,
              expectedRevision: dto.revision,
            })) as unknown as SupersedeResultShape;
            navigateTo =
              result.successor?.id ??
              result.source?.successorPlanId ??
              result.predecessor?.successorPlanId ??
              result.successorPlanId ??
              result.id;
            break;
          }
          case "clone": {
            const cloned = await clonePlan(dto.id, {
              number: cloneNumber || undefined,
              title: cloneTitle || undefined,
            });
            navigateTo = cloned.id;
            break;
          }
          case "updateMetadata":
            await updatePlanMetadata(dto.id, {
              metadata: metadataKey.trim() ? { [metadataKey.trim()]: metadataValue } : {},
              expectedRevision: dto.revision,
            });
            break;
          case "transferOwnership":
            await transferPlanOwnership(dto.id, {
              ownerId,
              expectedRevision: dto.revision,
            });
            break;
          case "updateAssignment":
            await updatePlanAssignment(dto.id, {
              leadId: assignmentLeadId.trim() ? assignmentLeadId.trim() : null,
              assigneeIds: assignmentAssigneeIds
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean),
              expectedRevision: dto.revision,
            });
            break;
          case "updateSchedule":
            await updatePlanSchedule(dto.id, {
              plannedStart: schedulePlannedStart.trim() ? schedulePlannedStart.trim() : null,
              plannedEnd: schedulePlannedEnd.trim() ? schedulePlannedEnd.trim() : null,
              milestoneRef: scheduleMilestoneRef.trim() ? scheduleMilestoneRef.trim() : null,
              timezone: scheduleTimezone.trim() ? scheduleTimezone.trim() : null,
              expectedRevision: dto.revision,
            });
            break;
          default:
            throw new Error(`Action ${action} is not supported in this dialog`);
        }
        emitQepWorkbenchTelemetry({
          event: "plan.lifecycle",
          outcome: "success",
          durationMs: performance.now() - started,
        });
        return navigateTo;
      } catch (err) {
        emitQepWorkbenchTelemetry({
          event: "plan.lifecycle",
          outcome: "error",
          durationMs: performance.now() - started,
        });
        throw err;
      }
    },
    onSuccess: async (navigateTo) => {
      await invalidate(dto.id);
      setDialog(null);
      if (navigateTo) {
        router.push(QEP_TEST_PLAN_ROUTES.detail(navigateTo));
      }
    },
    onError: (err) => setError((err as Error).message),
  });

  const primaryActions = dto.availableActions.filter((a) => !ITEM_LEVEL_ACTIONS.includes(a));

  return (
    <div className="flex flex-wrap gap-2" data-testid="qep-plan-actions">
      {primaryActions.map((action) => (
        <Button
          key={action}
          type="button"
          onClick={() => {
            if (action === "updateContent") {
              router.push(QEP_TEST_PLAN_ROUTES.edit(dto.id));
              return;
            }
            setDialog(action);
          }}
        >
          {ACTION_LABELS[action]}
        </Button>
      ))}

      <ActionDialog
        title={dialog && SIMPLE_CONFIRM_ACTIONS.includes(dialog) ? ACTION_LABELS[dialog] : ""}
        open={Boolean(dialog && SIMPLE_CONFIRM_ACTIONS.includes(dialog))}
        onClose={() => setDialog(null)}
      >
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {dialog ? ACTION_LABELS[dialog] : ""} this Test Plan?
        </p>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="button"
            data-testid={dialog ? `qep-plan-confirm-${dialog}` : undefined}
            onClick={() => dialog && run.mutate(dialog)}
          >
            {dialog === "submitForReview" ? "Submit" : "Confirm"}
          </Button>
        </div>
      </ActionDialog>

      <ActionDialog title="Approve" open={dialog === "approve"} onClose={() => setDialog(null)}>
        <label className="flex flex-col gap-1 text-sm">
          Comment (optional)
          <Input
            value={approveComment}
            onChange={(e) => setApproveComment(e.target.value)}
            aria-label="Approval comment"
          />
        </label>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="button"
            data-testid="qep-plan-confirm-approve"
            onClick={() => run.mutate("approve")}
          >
            Confirm approve
          </Button>
        </div>
      </ActionDialog>

      <ActionDialog title="Reject" open={dialog === "reject"} onClose={() => setDialog(null)}>
        <label className="flex flex-col gap-1 text-sm">
          Rationale (required)
          <Input
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            aria-label="Rejection rationale"
            required
          />
        </label>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="button"
            data-testid="qep-plan-confirm-reject"
            disabled={!rejectComment.trim()}
            onClick={() => run.mutate("reject")}
          >
            Confirm reject
          </Button>
        </div>
      </ActionDialog>

      <ActionDialog
        title="Supersede"
        open={dialog === "supersede"}
        onClose={() => setDialog(null)}
      >
        <label className="flex flex-col gap-1 text-sm">
          Successor number (optional)
          <Input
            value={supersedeSuccessorNumber}
            onChange={(e) => setSupersedeSuccessorNumber(e.target.value)}
            aria-label="Successor number"
          />
        </label>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="button"
            data-testid="qep-plan-confirm-supersede"
            onClick={() => run.mutate("supersede")}
          >
            Confirm supersede
          </Button>
        </div>
      </ActionDialog>

      <ActionDialog title="Clone" open={dialog === "clone"} onClose={() => setDialog(null)}>
        <label className="flex flex-col gap-1 text-sm">
          New number (optional)
          <Input
            value={cloneNumber}
            onChange={(e) => setCloneNumber(e.target.value)}
            aria-label="Clone number"
          />
        </label>
        <label className="mt-2 flex flex-col gap-1 text-sm">
          New title (optional)
          <Input
            value={cloneTitle}
            onChange={(e) => setCloneTitle(e.target.value)}
            aria-label="Clone title"
          />
        </label>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="button"
            data-testid="qep-plan-confirm-clone"
            onClick={() => run.mutate("clone")}
          >
            Confirm clone
          </Button>
        </div>
      </ActionDialog>

      <ActionDialog
        title="Update metadata"
        open={dialog === "updateMetadata"}
        onClose={() => setDialog(null)}
      >
        <label className="flex flex-col gap-1 text-sm">
          Key
          <Input
            value={metadataKey}
            onChange={(e) => setMetadataKey(e.target.value)}
            aria-label="Metadata key"
          />
        </label>
        <label className="mt-2 flex flex-col gap-1 text-sm">
          Value
          <Input
            value={metadataValue}
            onChange={(e) => setMetadataValue(e.target.value)}
            aria-label="Metadata value"
          />
        </label>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="button"
            data-testid="qep-plan-confirm-updateMetadata"
            onClick={() => run.mutate("updateMetadata")}
          >
            Confirm update
          </Button>
        </div>
      </ActionDialog>

      <ActionDialog
        title="Transfer ownership"
        open={dialog === "transferOwnership"}
        onClose={() => setDialog(null)}
      >
        <label className="flex flex-col gap-1 text-sm">
          New owner id
          <Input
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            aria-label="New owner id"
          />
        </label>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="button"
            data-testid="qep-plan-confirm-transferOwnership"
            disabled={!ownerId.trim()}
            onClick={() => run.mutate("transferOwnership")}
          >
            Confirm transfer
          </Button>
        </div>
      </ActionDialog>

      <ActionDialog
        title="Update assignment"
        open={dialog === "updateAssignment"}
        onClose={() => setDialog(null)}
      >
        <label className="flex flex-col gap-1 text-sm">
          Lead id (optional)
          <Input
            value={assignmentLeadId}
            onChange={(e) => setAssignmentLeadId(e.target.value)}
            aria-label="Lead id"
          />
        </label>
        <label className="mt-2 flex flex-col gap-1 text-sm">
          Assignee ids (comma-separated)
          <Input
            value={assignmentAssigneeIds}
            onChange={(e) => setAssignmentAssigneeIds(e.target.value)}
            aria-label="Assignee ids"
          />
        </label>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="button"
            data-testid="qep-plan-confirm-updateAssignment"
            onClick={() => run.mutate("updateAssignment")}
          >
            Confirm assignment
          </Button>
        </div>
      </ActionDialog>

      <ActionDialog
        title="Update schedule"
        open={dialog === "updateSchedule"}
        onClose={() => setDialog(null)}
      >
        <label className="flex flex-col gap-1 text-sm">
          Planned start (ISO date, optional)
          <Input
            value={schedulePlannedStart}
            onChange={(e) => setSchedulePlannedStart(e.target.value)}
            aria-label="Planned start"
            placeholder="2026-08-01"
          />
        </label>
        <label className="mt-2 flex flex-col gap-1 text-sm">
          Planned end (ISO date, optional)
          <Input
            value={schedulePlannedEnd}
            onChange={(e) => setSchedulePlannedEnd(e.target.value)}
            aria-label="Planned end"
            placeholder="2026-08-15"
          />
        </label>
        <label className="mt-2 flex flex-col gap-1 text-sm">
          Milestone (optional)
          <Input
            value={scheduleMilestoneRef}
            onChange={(e) => setScheduleMilestoneRef(e.target.value)}
            aria-label="Milestone"
          />
        </label>
        <label className="mt-2 flex flex-col gap-1 text-sm">
          Timezone (optional)
          <Input
            value={scheduleTimezone}
            onChange={(e) => setScheduleTimezone(e.target.value)}
            aria-label="Timezone"
          />
        </label>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="button"
            data-testid="qep-plan-confirm-updateSchedule"
            onClick={() => run.mutate("updateSchedule")}
          >
            Confirm schedule
          </Button>
        </div>
      </ActionDialog>
    </div>
  );
}

function InspectorBody({ dto }: { readonly dto: QepTestPlanDto }) {
  return (
    <div className="flex flex-col gap-4" data-testid="qep-plan-inspector">
      <div className="flex flex-wrap items-center gap-2">
        <QepStatusBadge status={dto.status} />
        <span className="text-sm text-[var(--color-muted-foreground)]">{dto.versionLabel}</span>
        <span className="rounded bg-[var(--color-muted)] px-2 py-0.5 text-xs font-medium">
          rev {dto.revision}
        </span>
      </div>
      <p className="text-sm text-[var(--color-muted-foreground)]">
        {dto.planType} · {dto.priority} · Owner {dto.ownerId}
      </p>
      <QepPanel title="Summary">
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="font-medium">Description</dt>
            <dd>{dto.description || "—"}</dd>
          </div>
          <div>
            <dt className="font-medium">Objective</dt>
            <dd>{dto.objective || "—"}</dd>
          </div>
          <div>
            <dt className="font-medium">Scope</dt>
            <dd>
              {dto.scope.class}
              {dto.scope.label ? ` — ${dto.scope.label}` : ""}
            </dd>
          </div>
        </dl>
      </QepPanel>
      <QepPanel title="Schedule">
        <dl className="grid gap-2 text-sm md:grid-cols-2">
          <div>
            <dt className="font-medium">Planned start</dt>
            <dd>{formatDate(dto.schedule.plannedStart)}</dd>
          </div>
          <div>
            <dt className="font-medium">Planned end</dt>
            <dd>{formatDate(dto.schedule.plannedEnd)}</dd>
          </div>
          <div>
            <dt className="font-medium">Milestone</dt>
            <dd>{dto.schedule.milestoneRef || "—"}</dd>
          </div>
          <div>
            <dt className="font-medium">Timezone</dt>
            <dd>{dto.schedule.timezone || "—"}</dd>
          </div>
        </dl>
      </QepPanel>
      <QepPanel title="Assignment">
        <dl className="grid gap-2 text-sm">
          <div>
            <dt className="font-medium">Lead</dt>
            <dd>{dto.assignment.leadId || "—"}</dd>
          </div>
          <div>
            <dt className="font-medium">Assignees</dt>
            <dd>
              {dto.assignment.assigneeIds.length > 0
                ? dto.assignment.assigneeIds.join(", ")
                : "—"}
            </dd>
          </div>
        </dl>
      </QepPanel>
      <QepPanel title={`Items (${dto.metrics.totalItems})`}>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Included {dto.metrics.includedCount} · Optional {dto.metrics.optionalCount} · Deferred{" "}
          {dto.metrics.deferredCount} · Pinned {dto.metrics.pinnedIncludedCount}
        </p>
        <Link className="mt-2 inline-block text-sm underline" href={QEP_TEST_PLAN_ROUTES.items(dto.id)}>
          Manage items
        </Link>
      </QepPanel>
      <QepPanel title="Relationships">
        {dto.items.length === 0 && (dto.externalReferences ?? []).length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">No relationships</p>
        ) : (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            {dto.items.length} linked Specification(s), {(dto.externalReferences ?? []).length}{" "}
            external reference(s)
          </p>
        )}
        <Link
          className="mt-2 inline-block text-sm underline"
          href={QEP_TEST_PLAN_ROUTES.relationships(dto.id)}
        >
          Manage relationships
        </Link>
      </QepPanel>
      {dto.approvals.length > 0 ? (
        <QepPanel title="Approvals">
          <ul className="space-y-1 text-sm">
            {dto.approvals.map((approval) => (
              <li key={approval.id}>
                {approval.decision} by {approval.decidedBy} at {formatDate(approval.decidedAt)}
                {approval.comment ? ` — ${approval.comment}` : ""}
              </li>
            ))}
          </ul>
        </QepPanel>
      ) : null}
      <QepPanel title="History (recent)">
        <ul className="space-y-1 text-sm">
          {dto.historySummaries.slice(0, 5).map((h, i) => (
            <li key={`${h.at}-${i}`}>
              {formatDate(h.at)} — {h.action}: {h.summary} ({h.actorId})
            </li>
          ))}
          {dto.historySummaries.length === 0 ? <li>—</li> : null}
        </ul>
        <Link className="mt-2 inline-block text-sm underline" href={QEP_TEST_PLAN_ROUTES.audit(dto.id)}>
          Full audit trail
        </Link>
      </QepPanel>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link className="underline" href={QEP_TEST_PLAN_ROUTES.versions(dto.id)}>
          Versions
        </Link>
        <Link className="underline" href={QEP_TEST_PLAN_ROUTES.items(dto.id)}>
          Items
        </Link>
        <Link className="underline" href={QEP_TEST_PLAN_ROUTES.relationships(dto.id)}>
          Relationships
        </Link>
        <Link className="underline" href={QEP_TEST_PLAN_ROUTES.audit(dto.id)}>
          Audit
        </Link>
      </div>
      <GovernedUnavailable capability="Linked Test Executions / Evidence / Defects" />
    </div>
  );
}

function ItemsView({
  dto,
  onChanged,
}: {
  readonly dto: QepTestPlanDto;
  readonly onChanged: () => void;
}) {
  const [specificationId, setSpecificationId] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const canAdd = hasAction(dto, "addItem");
  const canRemove = hasAction(dto, "removeItem");

  const add = useMutation({
    mutationFn: () =>
      addPlanItem(dto.id, {
        specificationId,
        notes: notes || undefined,
        expectedRevision: dto.revision,
      }),
    onSuccess: () => {
      setError(null);
      setSpecificationId("");
      setNotes("");
      onChanged();
    },
    onError: (err) => setError((err as Error).message),
  });

  const remove = useMutation({
    mutationFn: (itemId: string) =>
      removePlanItem(dto.id, itemId, { expectedRevision: dto.revision }),
    onSuccess: () => onChanged(),
    onError: (err) => setError((err as Error).message),
  });

  return (
    <QepPageShell
      title={`Items — ${dto.number}`}
      breadcrumbs={["QEP", "Test Plans", dto.number, "Items"]}
      actions={
        <Link
          className="inline-flex h-9 items-center rounded-md border border-[var(--color-border)] px-4 text-sm"
          href={QEP_TEST_PLAN_ROUTES.detail(dto.id)}
        >
          Back
        </Link>
      }
    >
      <ul className="mb-4 space-y-2 text-sm" data-testid="qep-plan-items">
        {dto.items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--color-border)] p-3"
          >
            <div>
              <span className="font-medium">#{item.sequence}</span>{" "}
              <Link
                className="text-[var(--color-primary)] underline"
                href={QEP_TEST_SPECIFICATION_ROUTES.detail(item.specificationId)}
              >
                Open Specification
              </Link>{" "}
              <span className="text-[var(--color-muted-foreground)]">({item.itemStatus})</span>
              {item.notes ? <div className="text-[var(--color-muted-foreground)]">{item.notes}</div> : null}
            </div>
            {canRemove ? (
              <Button type="button" variant="outline" onClick={() => remove.mutate(item.id)}>
                Remove
              </Button>
            ) : null}
          </li>
        ))}
        {dto.items.length === 0 ? <li>No items</li> : null}
      </ul>
      {canAdd ? (
        <QepPanel title="Add item">
          <div className="grid gap-2 sm:grid-cols-2">
            <Input
              value={specificationId}
              onChange={(e) => setSpecificationId(e.target.value)}
              aria-label="Specification id"
              placeholder="Specification id"
            />
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              aria-label="Notes"
              placeholder="Notes (optional)"
            />
          </div>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          <Button
            className="mt-2"
            type="button"
            disabled={!specificationId.trim()}
            onClick={() => add.mutate()}
          >
            Add
          </Button>
        </QepPanel>
      ) : (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Add/remove items is not available for this Plan (server availableActions).
        </p>
      )}
    </QepPageShell>
  );
}

function RelationshipsView({ dto }: { readonly dto: QepTestPlanDto }) {
  return (
    <QepPageShell
      title={`Relationships — ${dto.number}`}
      breadcrumbs={["QEP", "Test Plans", dto.number, "Relationships"]}
      actions={
        <Link
          className="inline-flex h-9 items-center rounded-md border border-[var(--color-border)] px-4 text-sm"
          href={QEP_TEST_PLAN_ROUTES.detail(dto.id)}
        >
          Back
        </Link>
      }
    >
      <QepPanel title="Linked Test Specifications">
        {dto.items.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">No linked specifications</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {dto.items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-2">
                <span className="font-medium">specification</span>
                <Link
                  className="text-sm text-[var(--color-primary)] underline"
                  href={QEP_TEST_SPECIFICATION_ROUTES.detail(item.specificationId)}
                >
                  Open Specification
                </Link>
                {item.specificationVersionPin ? (
                  <span className="text-[var(--color-muted-foreground)]">
                    pinned @ {item.specificationVersionPin}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </QepPanel>
      <QepPanel title="External references">
        {(dto.externalReferences ?? []).length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">No external references</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {(dto.externalReferences ?? []).map((ref) => (
              <li key={ref}>{ref}</li>
            ))}
          </ul>
        )}
      </QepPanel>
      <GovernedUnavailable capability="Linked Test Executions" />
      <GovernedUnavailable capability="Linked Evidence" />
      <GovernedUnavailable capability="Linked Defects" />
    </QepPageShell>
  );
}

function CompareUnavailableView({ id }: { readonly id: string }) {
  return (
    <QepPageShell
      title="Version comparison"
      breadcrumbs={["QEP", "Test Plans", "Compare"]}
      actions={
        <Link
          className="inline-flex h-9 items-center rounded-md border border-[var(--color-border)] px-4 text-sm"
          href={QEP_TEST_PLAN_ROUTES.detail(id)}
        >
          Back
        </Link>
      }
    >
      <p
        className="rounded-md border border-dashed border-[var(--color-border)] p-4 text-sm text-[var(--color-muted-foreground)]"
        role="status"
        data-testid="qep-plan-compare-unavailable"
      >
        Version comparison is not yet available for Test Plans.{" "}
        <Link className="underline" href={QEP_TEST_PLAN_ROUTES.versions(id)}>
          View Versions
        </Link>
      </p>
    </QepPageShell>
  );
}

function renderHistoryRows(rows: readonly QepTestPlanHistorySummaryDto[], testId: string) {
  return (
    <ul className="space-y-2 text-sm" data-testid={testId}>
      {rows.map((h, i) => (
        <li key={`${h.at}-${i}`} className="rounded border border-[var(--color-border)] p-3">
          <div className="font-medium">
            {h.action} — {formatDate(h.at)}
          </div>
          <div>{h.summary}</div>
          <div className="text-[var(--color-muted-foreground)]">by {h.actorId}</div>
        </li>
      ))}
      {rows.length === 0 ? <li>No history entries</li> : null}
    </ul>
  );
}

function HistoryView({ id, dto }: { readonly id: string; readonly dto: QepTestPlanDto }) {
  const history = useQuery({
    queryKey: qepQueryKeys.plans.history(id),
    queryFn: ({ signal }) => getPlanHistory(id, { signal }),
  });
  const rows: readonly QepTestPlanHistorySummaryDto[] = history.data ?? dto.historySummaries;

  return (
    <QepPageShell
      title={`History — ${dto.number}`}
      breadcrumbs={["QEP", "Test Plans", dto.number, "History"]}
      actions={
        <Link
          className="inline-flex h-9 items-center rounded-md border border-[var(--color-border)] px-4 text-sm"
          href={QEP_TEST_PLAN_ROUTES.detail(id)}
        >
          Back
        </Link>
      }
    >
      {history.isLoading ? <QepLoadingState label="Loading history…" /> : null}
      {renderHistoryRows(rows, "qep-plan-history")}
    </QepPageShell>
  );
}

function AuditView({ id, dto }: { readonly id: string; readonly dto: QepTestPlanDto }) {
  const history = useQuery({
    queryKey: qepQueryKeys.plans.history(id),
    queryFn: ({ signal }) => getPlanHistory(id, { signal }),
  });
  const rows: readonly QepTestPlanHistorySummaryDto[] = history.data ?? dto.historySummaries;

  return (
    <QepPageShell
      title={`Audit — ${dto.number}`}
      description="Audit projection derived from Plan history."
      breadcrumbs={["QEP", "Test Plans", dto.number, "Audit"]}
      actions={
        <Link
          className="inline-flex h-9 items-center rounded-md border border-[var(--color-border)] px-4 text-sm"
          href={QEP_TEST_PLAN_ROUTES.detail(id)}
        >
          Back
        </Link>
      }
    >
      {history.isLoading ? <QepLoadingState label="Loading audit trail…" /> : null}
      {renderHistoryRows(rows, "qep-plan-audit")}
    </QepPageShell>
  );
}

function VersionsView({ id, dto }: { readonly id: string; readonly dto: QepTestPlanDto }) {
  const versions = useQuery({
    queryKey: qepQueryKeys.plans.versions(id),
    queryFn: ({ signal }) => listPlanVersions(id, { signal }),
  });

  return (
    <QepPageShell
      title={`Versions — ${dto.number}`}
      breadcrumbs={["QEP", "Test Plans", dto.number, "Versions"]}
      actions={
        <Link
          className="inline-flex h-9 items-center rounded-md border border-[var(--color-border)] px-4 text-sm"
          href={QEP_TEST_PLAN_ROUTES.detail(id)}
        >
          Back
        </Link>
      }
    >
      {versions.isLoading ? <QepLoadingState label="Loading versions…" /> : null}
      {versions.data ? (
        <ExplorerTable items={versions.data} emptyLabel="No version lineage" />
      ) : null}
      {dto.revisions.length > 0 ? (
        <QepPanel title="Sealed revisions">
          <ul className="space-y-1 text-sm">
            {dto.revisions.map((rev, i) => (
              <li key={`${rev.versionLabel}-${i}`}>
                {rev.versionLabel} — sealed {formatDate(rev.sealedAt)} by {rev.sealedBy} (
                {rev.statusAtSeal})
              </li>
            ))}
          </ul>
        </QepPanel>
      ) : null}
    </QepPageShell>
  );
}

function CreatePlanView() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");
  const [scopeClass, setScopeClass] = useState("");
  const [priority, setPriority] = useState("medium");

  const create = useMutation({
    mutationFn: () => {
      const input: CreateQepTestPlanInput = {
        title,
        objective: objective || undefined,
        description: description || undefined,
        scope: { class: scopeClass },
        priority: priority || undefined,
        ownerId: DEFAULT_ACTOR,
      };
      return createPlan(input);
    },
    onSuccess: (dto) => {
      emitQepWorkbenchTelemetry({ event: "plan.create", outcome: "success" });
      router.push(QEP_TEST_PLAN_ROUTES.detail(dto.id));
    },
    onError: (err) => {
      emitQepWorkbenchTelemetry({ event: "plan.create", outcome: "error" });
      setError((err as Error).message);
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate();
  };

  return (
    <QepPageShell title="New Plan" breadcrumbs={["QEP", "Test Plans", "New"]}>
      <form className="grid max-w-2xl gap-3" onSubmit={onSubmit} data-testid="qep-plan-create">
        <label className="flex flex-col gap-1 text-sm">
          Title
          <Input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Title"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Objective
          <Input
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            aria-label="Objective"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Description
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-label="Description"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Scope class
          <Input
            required
            value={scopeClass}
            onChange={(e) => setScopeClass(e.target.value)}
            aria-label="Scope class"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Priority
          <Input
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            aria-label="Priority"
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

function EditContentView({ dto }: { readonly dto: QepTestPlanDto }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(dto.title);
  const [description, setDescription] = useState(dto.description ?? "");
  const [objective, setObjective] = useState(dto.objective);
  const [scopeClass, setScopeClass] = useState(dto.scope.class);
  const [priority, setPriority] = useState(dto.priority);

  const canEdit = hasAction(dto, "updateContent");

  const save = useMutation({
    mutationFn: () =>
      updatePlanContent(dto.id, {
        title,
        description,
        objective,
        scope: { class: scopeClass, label: dto.scope.label, externalRef: dto.scope.externalRef },
        priority,
        expectedRevision: dto.revision,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: qepQueryKeys.plans.detail(dto.id) });
      router.push(QEP_TEST_PLAN_ROUTES.detail(dto.id));
    },
    onError: (err) => setError((err as Error).message),
  });

  if (!canEdit) {
    return (
      <QepPageShell title="Edit draft" breadcrumbs={["QEP", "Test Plans", dto.number]}>
        <QepErrorState message="Editing is not available (updateContent not in availableActions)." />
      </QepPageShell>
    );
  }

  return (
    <QepPageShell
      title={`Edit — ${dto.number}`}
      breadcrumbs={["QEP", "Test Plans", dto.number, "Edit"]}
    >
      <form
        className="grid max-w-2xl gap-3"
        data-testid="qep-plan-edit"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <label className="flex flex-col gap-1 text-sm">
          Title
          <Input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Title" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Description
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-label="Description"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Objective
          <Input
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            aria-label="Objective"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Scope class
          <Input
            value={scopeClass}
            onChange={(e) => setScopeClass(e.target.value)}
            aria-label="Scope class"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Priority
          <Input
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            aria-label="Priority"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" disabled={save.isPending}>
            Save draft
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(QEP_TEST_PLAN_ROUTES.detail(dto.id))}
          >
            Cancel
          </Button>
        </div>
      </form>
    </QepPageShell>
  );
}

function PlanDetailView({
  id,
  mode,
}: {
  readonly id: string;
  readonly mode: ReturnType<typeof parseQepTestPlanDetailMode>;
}) {
  const queryClient = useQueryClient();
  const detail = useQuery({
    queryKey: qepQueryKeys.plans.detail(id),
    queryFn: ({ signal }) => getPlan(id, { signal }),
  });

  if (detail.isLoading) {
    return (
      <QepPageShell title="Plan" breadcrumbs={["QEP", "Test Plans"]}>
        <QepLoadingState label="Loading plan…" />
      </QepPageShell>
    );
  }
  if (detail.isError) {
    const err = detail.error as Error & { status?: number };
    return (
      <QepPageShell title="Plan" breadcrumbs={["QEP", "Test Plans"]}>
        <QepErrorState
          message={
            err.status === 403
              ? "You do not have permission to view this Plan."
              : err.status === 404
                ? "Plan not found."
                : err.message
          }
          onRetry={() => void detail.refetch()}
        />
      </QepPageShell>
    );
  }
  const dto = detail.data!;

  if (mode === "edit") {
    return <EditContentView dto={dto} />;
  }
  if (mode === "history") {
    return <HistoryView id={id} dto={dto} />;
  }
  if (mode === "versions") {
    return <VersionsView id={id} dto={dto} />;
  }
  if (mode === "items") {
    return (
      <ItemsView
        dto={dto}
        onChanged={() =>
          void queryClient.invalidateQueries({ queryKey: qepQueryKeys.plans.detail(id) })
        }
      />
    );
  }
  if (mode === "relationships") {
    return <RelationshipsView dto={dto} />;
  }
  if (mode === "compare") {
    return <CompareUnavailableView id={id} />;
  }
  if (mode === "audit") {
    return <AuditView id={id} dto={dto} />;
  }

  return (
    <QepPageShell
      title={`${dto.number} — ${dto.title}`}
      description="Plan Inspector"
      breadcrumbs={["QEP", "Test Plans", dto.number]}
      actions={<PlanActions dto={dto} />}
    >
      <InspectorBody dto={dto} />
    </QepPageShell>
  );
}

/**
 * APZQEP-ENG-070A — Test Plans Workbench router.
 */
export function QepTestPlanRouterView({ pathname }: { readonly pathname: string }) {
  const id = parseQepTestPlanRouteId(pathname);
  const mode = parseQepTestPlanDetailMode(pathname);

  if (id) {
    return <PlanDetailView id={id} mode={mode} />;
  }
  if (isQepTestPlansNewRoute(pathname)) {
    return <CreatePlanView />;
  }
  if (isQepTestPlansExplorerRoute(pathname)) {
    return <PlanExplorerView title="Explorer" description="Inventory of Test Plans." />;
  }
  if (isQepTestPlansReviewRoute(pathname)) {
    return (
      <PlanExplorerView
        initialStatus="review"
        title="Review"
        description="Test Plans awaiting review decisions."
      />
    );
  }
  if (isQepTestPlansSearchRoute(pathname)) {
    return <SearchView />;
  }

  return <DashboardView />;
}

export function planActionVisible(
  availableActions: readonly QepTestPlanAction[],
  action: QepTestPlanAction,
): boolean {
  return availableActions.includes(action);
}
