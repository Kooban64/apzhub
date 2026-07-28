"use client";

import type {
  CreateQepTestSpecificationInput,
  QepTestSpecificationAction,
  QepTestSpecificationDto,
  QepTestSpecificationHistorySummaryDto,
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
  addSpecificationRelationship,
  approveSpecification,
  cancelSpecification,
  createSpecification,
  getSpecification,
  getSpecificationHistory,
  listSpecificationVersions,
  listSpecifications,
  rejectSpecification,
  removeSpecificationRelationship,
  retireSpecification,
  submitForReview,
  supersedeSpecification,
  updateDraft,
  withdrawSpecification,
  type QepTestSpecificationListParams,
} from "@/lib/qep/qep-test-specification-api";
import { qepQueryKeys } from "@/lib/qep/query-keys";
import {
  QEP_REQUIREMENTS_ROUTES,
  QEP_TEST_SPECIFICATION_ROUTES,
  QEP_TRACEABILITY_ROUTES,
  QEP_VERIFICATION_ROUTES,
  isQepTestSpecificationsExplorerRoute,
  isQepTestSpecificationsNewRoute,
  isQepTestSpecificationsReviewRoute,
  isQepTestSpecificationsSearchRoute,
  parseQepTestSpecificationDetailMode,
  parseQepTestSpecificationRouteId,
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
  "under_review",
  "approved",
  "rejected",
  "superseded",
  "withdrawn",
  "retired",
  "cancelled",
] as const;

const ACTION_LABELS: Record<QepTestSpecificationAction, string> = {
  updateDraft: "Edit draft",
  submitForReview: "Submit for review",
  approve: "Approve",
  reject: "Reject",
  withdraw: "Withdraw",
  supersede: "Supersede",
  retire: "Retire",
  cancel: "Cancel",
  addRelationship: "Add relationship",
  removeRelationship: "Remove relationship",
};

function hasAction(
  dto: QepTestSpecificationDto,
  action: QepTestSpecificationAction,
): boolean {
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
      data-testid="qep-spec-unavailable"
    >
      {capability} is not available in this platform baseline.
    </p>
  );
}

function RelationshipNav({
  kind,
  artefactId,
}: {
  readonly kind: string;
  readonly artefactId: string;
}) {
  if (kind === "requirement") {
    return (
      <Link
        className="text-sm text-[var(--color-primary)] underline"
        href={QEP_REQUIREMENTS_ROUTES.detail(artefactId)}
      >
        Open Requirement
      </Link>
    );
  }
  if (kind === "trace_link") {
    return (
      <Link
        className="text-sm text-[var(--color-primary)] underline"
        href={QEP_TRACEABILITY_ROUTES.detail(artefactId)}
      >
        Open Trace Link
      </Link>
    );
  }
  if (kind === "verification") {
    return (
      <Link
        className="text-sm text-[var(--color-primary)] underline"
        href={QEP_VERIFICATION_ROUTES.detail(artefactId)}
      >
        Open Verification
      </Link>
    );
  }
  if (["test_case", "test_suite", "execution", "evidence"].includes(kind)) {
    return <GovernedUnavailable capability={`Linked ${kind}`} />;
  }
  return (
    <span className="text-sm text-[var(--color-muted-foreground)]">
      {kind}:{artefactId}
    </span>
  );
}

function useSpecificationList(params: QepTestSpecificationListParams) {
  return useQuery({
    queryKey: qepQueryKeys.specifications.list(params),
    queryFn: ({ signal }) => listSpecifications(params, { signal }),
  });
}

function ExplorerTable({
  items,
  emptyLabel,
}: {
  readonly items: readonly QepTestSpecificationDto[];
  readonly emptyLabel: string;
}) {
  if (items.length === 0) {
    return <QepEmptyState title={emptyLabel} />;
  }
  return (
    <QepTable
      caption="Test Specifications"
      columns={[
        "Number",
        "Title",
        "Status",
        "Version",
        "Type",
        "Priority",
        "Owner",
        "Authoritative",
        "Updated",
      ]}
      rows={items.map((row) => ({
        id: row.id,
        href: QEP_TEST_SPECIFICATION_ROUTES.detail(row.id),
        cells: [
          <Link
            key={`${row.id}-num`}
            className="font-medium text-[var(--color-primary)] underline"
            href={QEP_TEST_SPECIFICATION_ROUTES.detail(row.id)}
            data-testid={`qep-spec-row-${row.id}`}
          >
            {row.number}
          </Link>,
          row.title,
          <QepStatusBadge key={`${row.id}-status`} status={row.status} />,
          row.version.label,
          row.type,
          row.priority,
          row.owner,
          row.isAuthoritative ? "Yes" : "No",
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
  type,
  setType,
  onApply,
}: {
  readonly status: string;
  readonly setStatus: (v: string) => void;
  readonly query: string;
  readonly setQuery: (v: string) => void;
  readonly type: string;
  readonly setType: (v: string) => void;
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
          data-testid="qep-spec-status-filter"
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
        Type
        <Input
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="e.g. functional"
          aria-label="Filter by type"
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

function SpecificationExplorerView({
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
  const [status, setStatus] = useState(
    initialStatus ?? searchParams.get("status") ?? "",
  );
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [applied, setApplied] = useState<QepTestSpecificationListParams>({
    status: initialStatus ?? searchParams.get("status") ?? undefined,
    type: searchParams.get("type") ?? undefined,
    query: searchParams.get("q") ?? undefined,
    limit: PAGE_SIZE,
    offset: 0,
  });

  useEffect(() => {
    if (initialStatus) setStatus(initialStatus);
  }, [initialStatus]);

  const list = useSpecificationList(applied);

  const apply = () => {
    const next: QepTestSpecificationListParams = {
      status: status || undefined,
      type: type || undefined,
      query: query || undefined,
      limit: PAGE_SIZE,
      offset: 0,
    };
    setApplied(next);
    const sp = new URLSearchParams();
    if (next.status) sp.set("status", next.status);
    if (next.type) sp.set("type", next.type);
    if (next.query) sp.set("q", next.query);
    const qs = sp.toString();
    const base = initialStatus
      ? QEP_TEST_SPECIFICATION_ROUTES.review
      : QEP_TEST_SPECIFICATION_ROUTES.explorer;
    router.replace(qs ? `${base}?${qs}` : base);
  };

  return (
    <QepPageShell
      title={title}
      description={description}
      breadcrumbs={["QEP", "Test Specifications", title]}
      actions={
        <Link
          className="inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-foreground)]"
          href={QEP_TEST_SPECIFICATION_ROUTES.new}
        >
          New Specification
        </Link>
      }
    >
      <FilterControls
        status={status}
        setStatus={setStatus}
        query={query}
        setQuery={setQuery}
        type={type}
        setType={setType}
        onApply={apply}
      />
      {list.isLoading ? <QepLoadingState label="Loading specifications…" /> : null}
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
            initialStatus
              ? "No Specifications awaiting review"
              : "No Specifications match the current filters"
          }
        />
      ) : null}
    </QepPageShell>
  );
}

function DashboardView() {
  const draft = useSpecificationList({ status: "draft", limit: 5, offset: 0 });
  const review = useSpecificationList({ status: "under_review", limit: 5, offset: 0 });
  const approved = useSpecificationList({ status: "approved", limit: 5, offset: 0 });

  const cards = [
    {
      label: "Draft",
      total: draft.data?.total ?? 0,
      href: `${QEP_TEST_SPECIFICATION_ROUTES.explorer}?status=draft`,
      loading: draft.isLoading,
    },
    {
      label: "Under review",
      total: review.data?.total ?? 0,
      href: QEP_TEST_SPECIFICATION_ROUTES.review,
      loading: review.isLoading,
    },
    {
      label: "Approved",
      total: approved.data?.total ?? 0,
      href: `${QEP_TEST_SPECIFICATION_ROUTES.explorer}?status=approved`,
      loading: approved.isLoading,
    },
  ];

  return (
    <QepPageShell
      title="Test Specifications"
      description="Attention and counts for Specification design work."
      breadcrumbs={["QEP", "Test Specifications", "Dashboard"]}
      actions={
        <Link
          className="inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-foreground)]"
          href={QEP_TEST_SPECIFICATION_ROUTES.new}
        >
          New Specification
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3" data-testid="qep-spec-dashboard">
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
      <QepPanel title="Recently under review">
        {review.isLoading ? <QepLoadingState label="Loading…" /> : null}
        {review.data ? (
          <ExplorerTable
            items={review.data.items}
            emptyLabel="Nothing awaiting review"
          />
        ) : null}
      </QepPanel>
    </QepPageShell>
  );
}

function SearchView() {
  const [q, setQ] = useState("");
  const [applied, setApplied] = useState("");
  const list = useSpecificationList(
    applied ? { query: applied, limit: PAGE_SIZE, offset: 0 } : { limit: 0, offset: 0 },
  );

  return (
    <QepPageShell
      title="Search Specifications"
      description="Capability-scoped search over Test Specifications."
      breadcrumbs={["QEP", "Test Specifications", "Search"]}
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
          aria-label="Search specifications"
          className="min-w-[16rem] flex-1"
        />
        <Button type="submit">Search</Button>
      </form>
      {!applied ? (
        <QepEmptyState title="Enter a query to search Specifications" />
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
      data-testid="qep-spec-action-dialog-backdrop"
    >
      <div
        ref={panelRef}
        className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="qep-spec-action-dialog"
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

function SpecificationActions({ dto }: { readonly dto: QepTestSpecificationDto }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dialog, setDialog] = useState<QepTestSpecificationAction | null>(null);
  const [reviewerId, setReviewerId] = useState(DEFAULT_ACTOR);
  const [rejectComment, setRejectComment] = useState("");
  const [approveComment, setApproveComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const invalidate = async (id: string) => {
    await queryClient.invalidateQueries({
      queryKey: qepQueryKeys.specifications.detail(id),
    });
    await queryClient.invalidateQueries({
      queryKey: qepQueryKeys.specifications.all(),
    });
  };

  const run = useMutation({
    mutationFn: async (action: QepTestSpecificationAction) => {
      setError(null);
      const started = performance.now();
      try {
        let navigateTo: string | undefined;
        switch (action) {
          case "submitForReview":
            await submitForReview(dto.id, { reviewerId });
            break;
          case "approve":
            await approveSpecification(dto.id, {
              approvalComment: approveComment || undefined,
            });
            break;
          case "reject":
            await rejectSpecification(dto.id, { reviewComment: rejectComment });
            break;
          case "withdraw":
            await withdrawSpecification(dto.id);
            break;
          case "cancel":
            await cancelSpecification(dto.id);
            break;
          case "retire":
            await retireSpecification(dto.id);
            break;
          case "supersede": {
            const result = await supersedeSpecification(dto.id, {
              createSuccessor: { bump: "minor" },
            });
            navigateTo =
              result.successor?.id ?? result.predecessor.successorSpecificationId;
            break;
          }
          case "updateDraft":
            router.push(QEP_TEST_SPECIFICATION_ROUTES.edit(dto.id));
            return undefined;
          default:
            throw new Error(`Action ${action} is not supported in this dialog`);
        }
        emitQepWorkbenchTelemetry({
          event: "specification.lifecycle",
          outcome: "success",
          durationMs: performance.now() - started,
        });
        return navigateTo;
      } catch (err) {
        emitQepWorkbenchTelemetry({
          event: "specification.lifecycle",
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
        router.push(QEP_TEST_SPECIFICATION_ROUTES.detail(navigateTo));
      }
    },
    onError: (err) => setError((err as Error).message),
  });

  const primaryActions = dto.availableActions.filter(
    (a) => a !== "addRelationship" && a !== "removeRelationship",
  );

  return (
    <div className="flex flex-wrap gap-2" data-testid="qep-spec-actions">
      {primaryActions.map((action) => (
        <Button
          key={action}
          type="button"
          onClick={() => {
            if (action === "updateDraft") {
              router.push(QEP_TEST_SPECIFICATION_ROUTES.edit(dto.id));
              return;
            }
            if (
              action === "withdraw" ||
              action === "cancel" ||
              action === "retire" ||
              action === "supersede"
            ) {
              if (window.confirm(`${ACTION_LABELS[action]} this Specification?`)) {
                run.mutate(action);
              }
              return;
            }
            setDialog(action);
          }}
        >
          {ACTION_LABELS[action]}
        </Button>
      ))}

      <ActionDialog
        title={dialog ? ACTION_LABELS[dialog] : ""}
        open={dialog === "submitForReview"}
        onClose={() => setDialog(null)}
      >
        <label className="flex flex-col gap-1 text-sm">
          Reviewer id
          <Input
            value={reviewerId}
            onChange={(e) => setReviewerId(e.target.value)}
            aria-label="Reviewer id"
          />
        </label>
        {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
        <div className="mt-3 flex justify-end gap-2">
          <Button type="button" onClick={() => run.mutate("submitForReview")}>
            Submit
          </Button>
        </div>
      </ActionDialog>

      <ActionDialog
        title="Approve"
        open={dialog === "approve"}
        onClose={() => setDialog(null)}
      >
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
            data-testid="qep-spec-confirm-approve"
            onClick={() => run.mutate("approve")}
          >
            Confirm approve
          </Button>
        </div>
      </ActionDialog>

      <ActionDialog
        title="Reject"
        open={dialog === "reject"}
        onClose={() => setDialog(null)}
      >
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
            data-testid="qep-spec-confirm-reject"
            disabled={!rejectComment.trim()}
            onClick={() => run.mutate("reject")}
          >
            Confirm reject
          </Button>
        </div>
      </ActionDialog>
    </div>
  );
}

function InspectorBody({ dto }: { readonly dto: QepTestSpecificationDto }) {
  return (
    <div className="flex flex-col gap-4" data-testid="qep-spec-inspector">
      <div className="flex flex-wrap items-center gap-2">
        <QepStatusBadge status={dto.status} />
        <span className="text-sm text-[var(--color-muted-foreground)]">
          {dto.version.label}
        </span>
        {dto.isAuthoritative ? (
          <span className="rounded bg-[var(--color-muted)] px-2 py-0.5 text-xs font-medium">
            Authoritative
          </span>
        ) : null}
      </div>
      <p className="text-sm text-[var(--color-muted-foreground)]">
        {dto.type} · {dto.priority} · {dto.classification} · Owner {dto.owner} · Author{" "}
        {dto.author}
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
            <dd>{dto.scope || "—"}</dd>
          </div>
        </dl>
      </QepPanel>
      <QepPanel title="Design structure">
        <div className="grid gap-3 text-sm md:grid-cols-3">
          <div>
            <h3 className="font-medium">Preconditions</h3>
            <ul className="list-disc pl-4">
              {dto.preconditions.map((p) => (
                <li key={p}>{p}</li>
              ))}
              {dto.preconditions.length === 0 ? <li>—</li> : null}
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Postconditions</h3>
            <ul className="list-disc pl-4">
              {dto.postconditions.map((p) => (
                <li key={p}>{p}</li>
              ))}
              {dto.postconditions.length === 0 ? <li>—</li> : null}
            </ul>
          </div>
          <div>
            <h3 className="font-medium">Acceptance criteria</h3>
            <ul className="list-disc pl-4">
              {dto.acceptanceCriteria.map((p) => (
                <li key={p}>{p}</li>
              ))}
              {dto.acceptanceCriteria.length === 0 ? <li>—</li> : null}
            </ul>
          </div>
        </div>
      </QepPanel>
      <QepPanel title="Relationships">
        {dto.relationships.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            No relationships
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {dto.relationships.map((rel) => (
              <li key={rel.id} className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{rel.kind}</span>
                <RelationshipNav kind={rel.kind} artefactId={rel.artefactId} />
                {rel.label ? (
                  <span className="text-[var(--color-muted-foreground)]">
                    {rel.label}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-2">
          <Link
            className="text-sm underline"
            href={QEP_TEST_SPECIFICATION_ROUTES.relationships(dto.id)}
          >
            Manage relationships
          </Link>
        </div>
      </QepPanel>
      <QepPanel title="History (recent)">
        <ul className="space-y-1 text-sm">
          {dto.historySummaries.slice(0, 5).map((h, i) => (
            <li key={`${h.at}-${i}`}>
              {formatDate(h.at)} — {h.kind}: {h.summary} ({h.by})
            </li>
          ))}
          {dto.historySummaries.length === 0 ? <li>—</li> : null}
        </ul>
        <Link
          className="mt-2 inline-block text-sm underline"
          href={QEP_TEST_SPECIFICATION_ROUTES.history(dto.id)}
        >
          Full history
        </Link>
      </QepPanel>
      <div className="flex flex-wrap gap-3 text-sm">
        <Link
          className="underline"
          href={QEP_TEST_SPECIFICATION_ROUTES.versions(dto.id)}
        >
          Versions
        </Link>
        {dto.predecessorSpecificationId ? (
          <Link
            className="underline"
            href={QEP_TEST_SPECIFICATION_ROUTES.compare(
              dto.id,
              dto.predecessorSpecificationId,
            )}
          >
            Compare with predecessor
          </Link>
        ) : null}
      </div>
      <GovernedUnavailable capability="Derived Test Cases / Executions / Evidence" />
    </div>
  );
}

function SpecificationDetailView({
  id,
  mode,
}: {
  readonly id: string;
  readonly mode: ReturnType<typeof parseQepTestSpecificationDetailMode>;
}) {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const detail = useQuery({
    queryKey: qepQueryKeys.specifications.detail(id),
    queryFn: ({ signal }) => getSpecification(id, { signal }),
  });

  if (detail.isLoading) {
    return (
      <QepPageShell title="Specification" breadcrumbs={["QEP", "Test Specifications"]}>
        <QepLoadingState label="Loading specification…" />
      </QepPageShell>
    );
  }
  if (detail.isError) {
    const err = detail.error as Error & { status?: number };
    return (
      <QepPageShell title="Specification" breadcrumbs={["QEP", "Test Specifications"]}>
        <QepErrorState
          message={
            err.status === 403
              ? "You do not have permission to view this Specification."
              : err.status === 404
                ? "Specification not found."
                : err.message
          }
          onRetry={() => void detail.refetch()}
        />
      </QepPageShell>
    );
  }
  const dto = detail.data!;
  if (mode === "edit") {
    return <EditDraftView dto={dto} />;
  }
  if (mode === "history") {
    return <HistoryView id={id} dto={dto} />;
  }
  if (mode === "versions") {
    return <VersionsView id={id} dto={dto} />;
  }
  if (mode === "relationships") {
    return (
      <RelationshipsView
        dto={dto}
        onChanged={() =>
          void queryClient.invalidateQueries({
            queryKey: qepQueryKeys.specifications.detail(id),
          })
        }
      />
    );
  }
  if (mode === "compare") {
    const withId = searchParams.get("with") ?? dto.predecessorSpecificationId ?? "";
    return <CompareView leftId={id} rightId={withId} />;
  }

  return (
    <QepPageShell
      title={`${dto.number} — ${dto.title}`}
      description="Specification Inspector"
      breadcrumbs={["QEP", "Test Specifications", dto.number]}
      actions={<SpecificationActions dto={dto} />}
    >
      <InspectorBody dto={dto} />
    </QepPageShell>
  );
}

function HistoryView({
  id,
  dto,
}: {
  readonly id: string;
  readonly dto: QepTestSpecificationDto;
}) {
  const history = useQuery({
    queryKey: qepQueryKeys.specifications.history(id),
    queryFn: ({ signal }) => getSpecificationHistory(id, { signal }),
  });
  const rows: readonly QepTestSpecificationHistorySummaryDto[] =
    history.data ?? dto.historySummaries;

  return (
    <QepPageShell
      title={`History — ${dto.number}`}
      breadcrumbs={["QEP", "Test Specifications", dto.number, "History"]}
      actions={
        <Link
          className="inline-flex h-9 items-center rounded-md border border-[var(--color-border)] px-4 text-sm"
          href={QEP_TEST_SPECIFICATION_ROUTES.detail(id)}
        >
          Back
        </Link>
      }
    >
      {history.isLoading ? <QepLoadingState label="Loading history…" /> : null}
      <ul className="space-y-2 text-sm" data-testid="qep-spec-history">
        {rows.map((h, i) => (
          <li
            key={`${h.at}-${i}`}
            className="rounded border border-[var(--color-border)] p-3"
          >
            <div className="font-medium">
              {h.kind} — {formatDate(h.at)}
            </div>
            <div>{h.summary}</div>
            <div className="text-[var(--color-muted-foreground)]">by {h.by}</div>
          </li>
        ))}
        {rows.length === 0 ? <li>No history entries</li> : null}
      </ul>
    </QepPageShell>
  );
}

function VersionsView({
  id,
  dto,
}: {
  readonly id: string;
  readonly dto: QepTestSpecificationDto;
}) {
  const versions = useQuery({
    queryKey: qepQueryKeys.specifications.versions(id),
    queryFn: ({ signal }) => listSpecificationVersions(id, { signal }),
  });

  return (
    <QepPageShell
      title={`Versions — ${dto.number}`}
      breadcrumbs={["QEP", "Test Specifications", dto.number, "Versions"]}
      actions={
        <Link
          className="inline-flex h-9 items-center rounded-md border border-[var(--color-border)] px-4 text-sm"
          href={QEP_TEST_SPECIFICATION_ROUTES.detail(id)}
        >
          Back
        </Link>
      }
    >
      {versions.isLoading ? <QepLoadingState label="Loading versions…" /> : null}
      {versions.data ? (
        <ExplorerTable items={versions.data} emptyLabel="No version lineage" />
      ) : null}
      {dto.versionLineage.length > 0 ? (
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Lineage ids: {dto.versionLineage.join(", ")}
        </p>
      ) : null}
    </QepPageShell>
  );
}

function RelationshipsView({
  dto,
  onChanged,
}: {
  readonly dto: QepTestSpecificationDto;
  readonly onChanged: () => void;
}) {
  const [kind, setKind] = useState("requirement");
  const [artefactId, setArtefactId] = useState("");
  const [relId, setRelId] = useState(`rel_${Date.now()}`);
  const [error, setError] = useState<string | null>(null);
  const canAdd = hasAction(dto, "addRelationship");
  const canRemove = hasAction(dto, "removeRelationship");

  const add = useMutation({
    mutationFn: () =>
      addSpecificationRelationship(dto.id, {
        id: relId,
        kind,
        artefactId,
      }),
    onSuccess: () => {
      setError(null);
      onChanged();
    },
    onError: (err) => setError((err as Error).message),
  });

  const remove = useMutation({
    mutationFn: (relationshipId: string) =>
      removeSpecificationRelationship(dto.id, relationshipId),
    onSuccess: () => onChanged(),
    onError: (err) => setError((err as Error).message),
  });

  return (
    <QepPageShell
      title={`Relationships — ${dto.number}`}
      breadcrumbs={["QEP", "Test Specifications", dto.number, "Relationships"]}
      actions={
        <Link
          className="inline-flex h-9 items-center rounded-md border border-[var(--color-border)] px-4 text-sm"
          href={QEP_TEST_SPECIFICATION_ROUTES.detail(dto.id)}
        >
          Back
        </Link>
      }
    >
      <ul className="mb-4 space-y-2 text-sm">
        {dto.relationships.map((rel) => (
          <li
            key={rel.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded border border-[var(--color-border)] p-3"
          >
            <div>
              <span className="font-medium">{rel.kind}</span>{" "}
              <RelationshipNav kind={rel.kind} artefactId={rel.artefactId} />
            </div>
            {canRemove ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => remove.mutate(rel.id)}
              >
                Remove
              </Button>
            ) : null}
          </li>
        ))}
        {dto.relationships.length === 0 ? <li>No relationships</li> : null}
      </ul>
      {canAdd ? (
        <QepPanel title="Add relationship">
          <div className="grid gap-2 sm:grid-cols-3">
            <Input
              value={relId}
              onChange={(e) => setRelId(e.target.value)}
              aria-label="Relationship id"
              placeholder="Relationship id"
            />
            <Input
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              aria-label="Kind"
              placeholder="kind"
            />
            <Input
              value={artefactId}
              onChange={(e) => setArtefactId(e.target.value)}
              aria-label="Artefact id"
              placeholder="artefact id"
            />
          </div>
          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
          <Button
            className="mt-2"
            type="button"
            disabled={!artefactId.trim()}
            onClick={() => add.mutate()}
          >
            Add
          </Button>
        </QepPanel>
      ) : (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Add/remove relationships is not available for this Specification (server
          availableActions).
        </p>
      )}
    </QepPageShell>
  );
}

function CompareView({
  leftId,
  rightId,
}: {
  readonly leftId: string;
  readonly rightId: string;
}) {
  const left = useQuery({
    queryKey: qepQueryKeys.specifications.detail(leftId),
    queryFn: ({ signal }) => getSpecification(leftId, { signal }),
  });
  const right = useQuery({
    queryKey: qepQueryKeys.specifications.detail(rightId),
    queryFn: ({ signal }) => getSpecification(rightId, { signal }),
    enabled: Boolean(rightId),
  });

  if (!rightId) {
    return (
      <QepPageShell
        title="Compare"
        breadcrumbs={["QEP", "Test Specifications", "Compare"]}
      >
        <QepEmptyState title="Select a version to compare (query ?with=)" />
      </QepPageShell>
    );
  }

  if (left.isLoading || right.isLoading) {
    return (
      <QepPageShell
        title="Compare"
        breadcrumbs={["QEP", "Test Specifications", "Compare"]}
      >
        <QepLoadingState label="Loading versions…" />
      </QepPageShell>
    );
  }
  if (left.isError || right.isError || !left.data || !right.data) {
    return (
      <QepPageShell
        title="Compare"
        breadcrumbs={["QEP", "Test Specifications", "Compare"]}
      >
        <QepErrorState message="Unable to load one or both Specifications for comparison." />
      </QepPageShell>
    );
  }

  const fields: Array<[string, string, string]> = [
    ["Title", left.data.title, right.data.title],
    ["Description", left.data.description, right.data.description],
    ["Objective", left.data.objective, right.data.objective],
    ["Scope", left.data.scope, right.data.scope],
    ["Type", left.data.type, right.data.type],
    ["Priority", left.data.priority, right.data.priority],
    ["Classification", left.data.classification, right.data.classification],
  ];

  return (
    <QepPageShell
      title="Version comparison"
      breadcrumbs={["QEP", "Test Specifications", "Compare"]}
      actions={
        <Link
          className="inline-flex h-9 items-center rounded-md border border-[var(--color-border)] px-4 text-sm"
          href={QEP_TEST_SPECIFICATION_ROUTES.detail(leftId)}
        >
          Back
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-2" data-testid="qep-spec-compare">
        <QepPanel title={`${left.data.number} ${left.data.version.label}`}>
          <dl className="space-y-2 text-sm">
            {fields.map(([label, a]) => (
              <div key={`l-${label}`}>
                <dt className="font-medium">{label}</dt>
                <dd>{a || "—"}</dd>
              </div>
            ))}
          </dl>
        </QepPanel>
        <QepPanel title={`${right.data.number} ${right.data.version.label}`}>
          <dl className="space-y-2 text-sm">
            {fields.map(([label, , b]) => (
              <div key={`r-${label}`}>
                <dt className="font-medium">{label}</dt>
                <dd
                  className={
                    fields.find((f) => f[0] === label)?.[1] !== b ? "font-semibold" : ""
                  }
                >
                  {b || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </QepPanel>
      </div>
      {left.data.comparisonNotes ? (
        <p className="mt-3 text-sm">Notes: {left.data.comparisonNotes}</p>
      ) : null}
    </QepPageShell>
  );
}

function CreateSpecificationView() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreateQepTestSpecificationInput>({
    number: "",
    title: "",
    description: "",
    objective: "",
    scope: "",
    type: "functional",
    classification: "internal",
    owner: DEFAULT_ACTOR,
    author: DEFAULT_ACTOR,
    priority: "medium",
  });

  const create = useMutation({
    mutationFn: () => createSpecification(form),
    onSuccess: (dto) => {
      emitQepWorkbenchTelemetry({ event: "specification.create", outcome: "success" });
      router.push(QEP_TEST_SPECIFICATION_ROUTES.detail(dto.id));
    },
    onError: (err) => {
      emitQepWorkbenchTelemetry({ event: "specification.create", outcome: "error" });
      setError((err as Error).message);
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    create.mutate();
  };

  return (
    <QepPageShell
      title="New Specification"
      breadcrumbs={["QEP", "Test Specifications", "New"]}
    >
      <form
        className="grid max-w-2xl gap-3"
        onSubmit={onSubmit}
        data-testid="qep-spec-create"
      >
        {(
          [
            ["number", "Number"],
            ["title", "Title"],
            ["description", "Description"],
            ["objective", "Objective"],
            ["scope", "Scope"],
            ["type", "Type"],
            ["classification", "Classification"],
            ["owner", "Owner"],
            ["author", "Author"],
            ["priority", "Priority"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex flex-col gap-1 text-sm">
            {label}
            <Input
              required={[
                "number",
                "title",
                "description",
                "objective",
                "scope",
              ].includes(key)}
              value={String(form[key] ?? "")}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              aria-label={label}
            />
          </label>
        ))}
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={create.isPending}>
          Create draft
        </Button>
      </form>
    </QepPageShell>
  );
}

function EditDraftView({ dto }: { readonly dto: QepTestSpecificationDto }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(dto.title);
  const [description, setDescription] = useState(dto.description);
  const [objective, setObjective] = useState(dto.objective);
  const [scope, setScope] = useState(dto.scope);

  if (!hasAction(dto, "updateDraft")) {
    return (
      <QepPageShell
        title="Edit draft"
        breadcrumbs={["QEP", "Test Specifications", dto.number]}
      >
        <QepErrorState message="Editing is not available (updateDraft not in availableActions)." />
      </QepPageShell>
    );
  }

  const save = useMutation({
    mutationFn: () =>
      updateDraft(dto.id, {
        content: { title, description, objective, scope },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: qepQueryKeys.specifications.detail(dto.id),
      });
      router.push(QEP_TEST_SPECIFICATION_ROUTES.detail(dto.id));
    },
    onError: (err) => setError((err as Error).message),
  });

  return (
    <QepPageShell
      title={`Edit — ${dto.number}`}
      breadcrumbs={["QEP", "Test Specifications", dto.number, "Edit"]}
    >
      <form
        className="grid max-w-2xl gap-3"
        data-testid="qep-spec-edit"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <label className="flex flex-col gap-1 text-sm">
          Title
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Title"
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
          Objective
          <Input
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            aria-label="Objective"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Scope
          <Input
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            aria-label="Scope"
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
            onClick={() => router.push(QEP_TEST_SPECIFICATION_ROUTES.detail(dto.id))}
          >
            Cancel
          </Button>
        </div>
      </form>
    </QepPageShell>
  );
}

/**
 * APZQEP-ENG-050C — Test Specifications Workbench router.
 */
export function QepTestSpecificationRouterView({
  pathname,
}: {
  readonly pathname: string;
}) {
  const id = parseQepTestSpecificationRouteId(pathname);
  const mode = parseQepTestSpecificationDetailMode(pathname);

  if (id) {
    return <SpecificationDetailView id={id} mode={mode} />;
  }
  if (isQepTestSpecificationsNewRoute(pathname)) {
    return <CreateSpecificationView />;
  }
  if (isQepTestSpecificationsExplorerRoute(pathname)) {
    return (
      <SpecificationExplorerView
        title="Explorer"
        description="Inventory of Test Specifications."
      />
    );
  }
  if (isQepTestSpecificationsReviewRoute(pathname)) {
    return (
      <SpecificationExplorerView
        initialStatus="under_review"
        title="Review"
        description="Specifications awaiting review decisions."
      />
    );
  }
  if (isQepTestSpecificationsSearchRoute(pathname)) {
    return <SearchView />;
  }

  return <DashboardView />;
}

export function specificationActionVisible(
  availableActions: readonly QepTestSpecificationAction[],
  action: QepTestSpecificationAction,
): boolean {
  return availableActions.includes(action);
}
