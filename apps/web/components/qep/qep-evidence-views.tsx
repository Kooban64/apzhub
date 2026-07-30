"use client";

import type { EvidenceDto } from "@apzhub/qep-evidence";
import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";

import {
  captureEvidence,
  getEvidence,
  getEvidenceCollection,
  getEvidenceProvenance,
  getEvidenceRelationships,
  getEvidenceSet,
  getEvidenceVersions,
  isEvidenceLifecycleAction,
  listEvidence,
  performEvidenceAction,
  resolveEvidenceActionSlug,
  type CaptureQepEvidenceInput,
  type PerformQepEvidenceActionInput,
  type QepEvidenceListParams,
} from "@/lib/qep/qep-evidence-api";
import { qepQueryKeys } from "@/lib/qep/query-keys";
import {
  QEP_EVIDENCE_ROUTES,
  isQepEvidenceCollectionsRoute,
  isQepEvidenceExplorerRoute,
  isQepEvidenceNewRoute,
  parseQepEvidenceCollectionId,
  parseQepEvidenceDetailMode,
  parseQepEvidenceRouteId,
  parseQepEvidenceSetId,
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

const STATUS_FILTER_OPTIONS = [
  "captured",
  "validated",
  "classified",
  "associated",
  "in_review",
  "approved",
  "rejected",
  "quarantined",
  "sealed",
  "retained",
  "archived",
  "disposed",
] as const;

const ACTION_LABELS: Readonly<Record<string, string>> = {
  validate: "Validate",
  validateEvidence: "Validate",
  classify: "Classify",
  classifyEvidence: "Classify",
  requestReview: "Request review",
  approve: "Approve",
  approveEvidence: "Approve",
  reject: "Reject",
  rejectEvidence: "Reject",
  quarantine: "Quarantine",
  quarantineEvidence: "Quarantine",
  seal: "Seal",
  sealEvidence: "Seal",
  replaceContent: "Replace content",
  versionEvidence: "Replace content",
  applyLegalHold: "Apply legal hold",
  releaseLegalHold: "Release legal hold",
  archive: "Archive",
  archiveEvidence: "Archive",
  dispose: "Dispose",
  disposeEvidence: "Dispose",
  updateMetadata: "Update metadata",
  updateEvidenceMetadata: "Update metadata",
};

const REASON_REQUIRED_ACTIONS = new Set([
  "reject",
  "rejectEvidence",
  "quarantine",
  "quarantineEvidence",
  "dispose",
  "disposeEvidence",
  "applyLegalHold",
]);

const CONFIRMATION_ACTIONS = new Set([
  "reject",
  "rejectEvidence",
  "quarantine",
  "quarantineEvidence",
  "dispose",
  "disposeEvidence",
  "seal",
  "sealEvidence",
  "archive",
  "archiveEvidence",
]);

const DANGEROUS_ACTIONS = new Set([
  "reject",
  "rejectEvidence",
  "quarantine",
  "quarantineEvidence",
  "dispose",
  "disposeEvidence",
]);

export type EvidenceActionDescriptor = {
  readonly action: string;
  readonly label: string;
  readonly slug: string;
  readonly requiresConfirmation: boolean;
  readonly reasonRequired: boolean;
  readonly dangerous: boolean;
};

/**
 * Map server `availableActions` strings to action-bar descriptors.
 * Never derives actions from status (OES-ENG-091A PART-04 §3.3).
 */
export function toEvidenceActionDescriptor(action: string): EvidenceActionDescriptor {
  const slug = resolveEvidenceActionSlug(action);
  return {
    action,
    slug,
    label: ACTION_LABELS[action] ?? ACTION_LABELS[slug] ?? action,
    requiresConfirmation:
      CONFIRMATION_ACTIONS.has(action) || CONFIRMATION_ACTIONS.has(slug),
    reasonRequired:
      REASON_REQUIRED_ACTIONS.has(action) || REASON_REQUIRED_ACTIONS.has(slug),
    dangerous: DANGEROUS_ACTIONS.has(action) || DANGEROUS_ACTIONS.has(slug),
  };
}

/**
 * Action bar entries — filtered strictly from server-provided
 * `availableActions`. Exported for ENG-110F contract tests.
 */
export function getEvidenceActionBarDescriptors(
  availableActions: readonly string[],
): readonly EvidenceActionDescriptor[] {
  return availableActions
    .filter(isEvidenceLifecycleAction)
    .map(toEvidenceActionDescriptor);
}

function formatDate(value?: string): string {
  return value ? value : "—";
}

function formatBool(value: boolean): string {
  return value ? "Yes" : "No";
}

function useEvidenceList(params: QepEvidenceListParams) {
  return useQuery({
    queryKey: qepQueryKeys.evidence.list(params),
    queryFn: ({ signal }) => listEvidence(params, { signal }),
  });
}

function EvidenceExplorerTable({
  items,
  emptyLabel,
}: {
  readonly items: readonly EvidenceDto[];
  readonly emptyLabel: string;
}) {
  if (items.length === 0) {
    return <QepEmptyState title={emptyLabel} />;
  }
  return (
    <QepTable
      caption="Evidence"
      columns={[
        "Title",
        "Status",
        "Classification",
        "Source",
        "Owner",
        "Sealed",
        "Hold",
        "Updated",
      ]}
      rows={items.map((row) => ({
        id: row.id,
        href: QEP_EVIDENCE_ROUTES.detail(row.id),
        cells: [
          <Link
            key={`${row.id}-title`}
            className="font-medium text-[var(--color-primary)] underline"
            href={QEP_EVIDENCE_ROUTES.detail(row.id)}
            data-testid={`qep-evidence-row-${row.id}`}
          >
            {row.title ?? row.id}
          </Link>,
          <QepStatusBadge key={`${row.id}-status`} status={row.status} />,
          row.classification ?? "—",
          row.sourceKind,
          row.ownerId,
          formatBool(row.sealed),
          formatBool(row.legalHold),
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
        data-testid="qep-evidence-status-filter"
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
      data-testid="qep-evidence-pager"
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
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qep-evidence-action-dialog-title"
      data-testid="qep-evidence-action-dialog"
    >
      <div className="w-full max-w-md rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 shadow-lg">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 id="qep-evidence-action-dialog-title" className="text-lg font-semibold">
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
 * Action bar bound solely to `availableActions` — never status-derived.
 */
function EvidenceActionBar({ dto }: { readonly dto: EvidenceDto }) {
  const queryClient = useQueryClient();
  const [dialogAction, setDialogAction] = useState<EvidenceActionDescriptor | null>(
    null,
  );
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: qepQueryKeys.evidence.detail(dto.id),
    });
    await queryClient.invalidateQueries({ queryKey: qepQueryKeys.evidence.all() });
  };

  const run = useMutation({
    mutationFn: async (descriptor: EvidenceActionDescriptor) => {
      setError(null);
      const body: PerformQepEvidenceActionInput = {
        expectedRevision: dto.revision,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
        ...(descriptor.slug === "dispose" ? { confirm: true } : {}),
      };
      return performEvidenceAction(dto.id, descriptor.slug, body);
    },
    onSuccess: async () => {
      await invalidate();
      setDialogAction(null);
      setReason("");
    },
    onError: (err) => setError((err as Error).message),
  });

  const actionBar = getEvidenceActionBarDescriptors(dto.availableActions);

  if (actionBar.length === 0) {
    return (
      <p
        className="text-sm text-[var(--color-muted-foreground)]"
        data-testid="qep-evidence-actions-empty"
      >
        No actions available.
      </p>
    );
  }

  return (
    <div
      className="flex flex-wrap items-start gap-2"
      data-testid="qep-evidence-actions"
    >
      {actionBar.map((descriptor) => (
        <Button
          key={descriptor.action}
          type="button"
          variant={descriptor.dangerous ? "outline" : "default"}
          onClick={() =>
            descriptor.requiresConfirmation || descriptor.reasonRequired
              ? setDialogAction(descriptor)
              : run.mutate(descriptor)
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
              {dialogAction.label} this Evidence item?
            </p>
            {dialogAction.reasonRequired ? (
              <label className="flex flex-col gap-1 text-sm">
                Reason
                <Input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  aria-label="Reason"
                />
              </label>
            ) : null}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setDialogAction(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={
                  (dialogAction.reasonRequired && !reason.trim()) || run.isPending
                }
                data-testid={`qep-evidence-confirm-${dialogAction.action}`}
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

function MetadataPanel({ dto }: { readonly dto: EvidenceDto }) {
  return (
    <QepPanel title="Metadata">
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[var(--color-muted-foreground)]">ID</dt>
          <dd>{dto.id}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Project</dt>
          <dd>{dto.projectId}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Workspace</dt>
          <dd>{dto.workspaceId ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Owner</dt>
          <dd>{dto.ownerId}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Classification</dt>
          <dd>{dto.classification ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Source</dt>
          <dd>{dto.sourceKind}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Media type</dt>
          <dd>{dto.mediaType ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Revision</dt>
          <dd>{dto.revision}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[var(--color-muted-foreground)]">Description</dt>
          <dd>{dto.description ?? "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[var(--color-muted-foreground)]">Tags</dt>
          <dd>{dto.tags.length > 0 ? dto.tags.join(", ") : "—"}</dd>
        </div>
      </dl>
    </QepPanel>
  );
}

function IntegrityPanel({ dto }: { readonly dto: EvidenceDto }) {
  return (
    <QepPanel title="Integrity status">
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Verification</dt>
          <dd>{dto.verificationState ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Sealed</dt>
          <dd>{formatBool(dto.sealed)}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Hash algorithm</dt>
          <dd>{dto.hashAlgorithm ?? "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[var(--color-muted-foreground)]">Content hash</dt>
          <dd className="break-all font-mono text-xs">{dto.contentHash ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Byte size</dt>
          <dd>{dto.byteSize ?? "—"}</dd>
        </div>
      </dl>
    </QepPanel>
  );
}

function RetentionPanel({ dto }: { readonly dto: EvidenceDto }) {
  return (
    <QepPanel title="Retention & legal hold">
      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Retention class</dt>
          <dd>{dto.retentionClass}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Retain until</dt>
          <dd>{formatDate(dto.retainUntil)}</dd>
        </div>
        <div>
          <dt className="text-[var(--color-muted-foreground)]">Legal hold</dt>
          <dd>{formatBool(dto.legalHold)}</dd>
        </div>
      </dl>
    </QepPanel>
  );
}

function AvailableActionsPanel({ dto }: { readonly dto: EvidenceDto }) {
  const descriptors = dto.availableActions.map(toEvidenceActionDescriptor);
  return (
    <QepPanel title="Available actions">
      {descriptors.length === 0 ? (
        <QepEmptyState title="No actions returned by the server" />
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {descriptors.map((descriptor) => (
            <li key={descriptor.action}>
              <span className="font-medium">{descriptor.label}</span>
              <span className="text-[var(--color-muted-foreground)]">
                {" "}
                ({descriptor.action})
              </span>
            </li>
          ))}
        </ul>
      )}
    </QepPanel>
  );
}

function ExplorerView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [offset, setOffset] = useState(0);

  const applied: QepEvidenceListParams = {
    status: (status || undefined) as QepEvidenceListParams["status"],
    limit: PAGE_SIZE,
    offset,
  };
  const list = useEvidenceList(applied);

  const apply = (nextStatus: string) => {
    setStatus(nextStatus);
    setOffset(0);
    const sp = new URLSearchParams();
    if (nextStatus) sp.set("status", nextStatus);
    const qs = sp.toString();
    router.replace(
      qs ? `${QEP_EVIDENCE_ROUTES.explorer}?${qs}` : QEP_EVIDENCE_ROUTES.explorer,
    );
  };

  return (
    <QepPageShell
      title="Explorer"
      description="Inventory of Evidence items."
      breadcrumbs={["QEP", "Evidence", "Explorer"]}
      actions={
        <Link
          className="inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-foreground)]"
          href={QEP_EVIDENCE_ROUTES.new}
        >
          Capture Evidence
        </Link>
      }
    >
      <QepFilterBar>
        <StatusFilterSelect status={status} setStatus={apply} />
      </QepFilterBar>
      {list.isLoading ? <QepLoadingState label="Loading evidence…" /> : null}
      {list.isError ? (
        <QepErrorState
          message={(list.error as Error).message}
          onRetry={() => void list.refetch()}
        />
      ) : null}
      {list.data ? (
        <>
          <EvidenceExplorerTable
            items={list.data.items}
            emptyLabel="No Evidence items match the current filters"
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
  const list = useEvidenceList({ limit: 1, offset: 0 });

  return (
    <QepPageShell
      title="Evidence"
      description="Evidence Management workbench — capture, validate, and govern quality evidence."
      breadcrumbs={["QEP", "Evidence"]}
      actions={
        <Link
          className="inline-flex h-9 items-center rounded-md bg-[var(--color-primary)] px-4 text-sm font-medium text-[var(--color-primary-foreground)]"
          href={QEP_EVIDENCE_ROUTES.explorer}
        >
          Open Explorer
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-3" data-testid="qep-evidence-dashboard">
        <QepPanel title="Inventory">
          <p className="text-2xl font-semibold">
            {list.data?.total ?? list.data?.items.length ?? "—"}
          </p>
          <p className="text-sm text-[var(--color-muted-foreground)]">Evidence items</p>
        </QepPanel>
        <QepPanel title="Explorer">
          <Link
            className="text-sm text-[var(--color-primary)] underline"
            href={QEP_EVIDENCE_ROUTES.explorer}
          >
            Browse inventory
          </Link>
        </QepPanel>
        <QepPanel title="Collections">
          <Link
            className="text-sm text-[var(--color-primary)] underline"
            href={QEP_EVIDENCE_ROUTES.collections}
          >
            Manage collections
          </Link>
        </QepPanel>
      </div>
    </QepPageShell>
  );
}

function CaptureView() {
  const router = useRouter();
  const [projectId, setProjectId] = useState("");
  const [workspaceId, setWorkspaceId] = useState("");
  const [title, setTitle] = useState("");
  const [mediaType, setMediaType] = useState("application/json");
  const [error, setError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: (input: CaptureQepEvidenceInput) => captureEvidence(input),
    onSuccess: (dto) => {
      router.push(QEP_EVIDENCE_ROUTES.detail(dto.id));
    },
    onError: (err) => setError((err as Error).message),
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    const payload = JSON.stringify({
      title: title.trim() || "Untitled evidence",
      capturedAt: new Date().toISOString(),
    });
    // Deterministic demo content for Workbench — storage technology remains undecided.
    const contentBase64 = btoa(payload);
    create.mutate({
      projectId: projectId.trim(),
      workspaceId: workspaceId.trim() || undefined,
      title: title.trim() || undefined,
      mediaType: mediaType.trim(),
      sourceKind: "manual_upload",
      contentBase64,
      // Placeholder sha256-length hex; integrity verification is a separate command.
      contentHash: "d".repeat(64),
    });
  };

  return (
    <QepPageShell
      title="Capture Evidence"
      description="Capture evidence via transport (JSON + contentBase64). Storage technology remains undecided."
      breadcrumbs={["QEP", "Evidence", "Capture"]}
    >
      <form className="flex max-w-lg flex-col gap-3" onSubmit={onSubmit}>
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
            value={workspaceId}
            onChange={(e) => setWorkspaceId(e.target.value)}
            aria-label="Workspace ID"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Title
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Title"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Media type
          <Input
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
            aria-label="Media type"
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button type="submit" disabled={create.isPending}>
          Capture Evidence
        </Button>
      </form>
    </QepPageShell>
  );
}

function CollectionsLandingView() {
  return (
    <QepPageShell
      title="Collections"
      description="Evidence collections group related items for review and sealing."
      breadcrumbs={["QEP", "Evidence", "Collections"]}
    >
      <QepEmptyState title="Open a collection by ID — navigate to /workspace/qep/evidence/collections/{id} or create via the API." />
    </QepPageShell>
  );
}

function CollectionDetailView({ id }: { readonly id: string }) {
  const detail = useQuery({
    queryKey: qepQueryKeys.evidence.collection(id),
    queryFn: ({ signal }) => getEvidenceCollection(id, { signal }),
  });

  if (detail.isLoading) {
    return (
      <QepPageShell title="Collection" breadcrumbs={["QEP", "Evidence", "Collections"]}>
        <QepLoadingState label="Loading collection…" />
      </QepPageShell>
    );
  }
  if (detail.isError) {
    return (
      <QepPageShell title="Collection" breadcrumbs={["QEP", "Evidence", "Collections"]}>
        <QepErrorState
          message={(detail.error as Error).message}
          onRetry={() => void detail.refetch()}
        />
      </QepPageShell>
    );
  }
  const dto = detail.data!;

  return (
    <QepPageShell
      title={dto.name}
      description={dto.purpose}
      breadcrumbs={["QEP", "Evidence", "Collections", dto.name]}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <QepPanel title="Collection">
          <dl className="grid gap-2 text-sm">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Status</dt>
              <dd>
                <QepStatusBadge status={dto.status} />
              </dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Members</dt>
              <dd>{dto.memberEvidenceIds.length}</dd>
            </div>
            {dto.sealedSetId ? (
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Sealed set</dt>
                <dd>
                  <Link
                    className="text-[var(--color-primary)] underline"
                    href={QEP_EVIDENCE_ROUTES.setDetail(dto.sealedSetId)}
                  >
                    {dto.sealedSetId}
                  </Link>
                </dd>
              </div>
            ) : null}
          </dl>
        </QepPanel>
        <QepPanel title="Members">
          {dto.memberEvidenceIds.length === 0 ? (
            <QepEmptyState title="No members" />
          ) : (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {dto.memberEvidenceIds.map((memberId) => (
                <li key={memberId}>
                  <Link
                    className="text-[var(--color-primary)] underline"
                    href={QEP_EVIDENCE_ROUTES.detail(memberId)}
                  >
                    {memberId}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </QepPanel>
      </div>
    </QepPageShell>
  );
}

function SetDetailView({ id }: { readonly id: string }) {
  const detail = useQuery({
    queryKey: qepQueryKeys.evidence.set(id),
    queryFn: ({ signal }) => getEvidenceSet(id, { signal }),
  });

  if (detail.isLoading) {
    return (
      <QepPageShell title="Evidence Set" breadcrumbs={["QEP", "Evidence", "Sets"]}>
        <QepLoadingState label="Loading set…" />
      </QepPageShell>
    );
  }
  if (detail.isError) {
    return (
      <QepPageShell title="Evidence Set" breadcrumbs={["QEP", "Evidence", "Sets"]}>
        <QepErrorState
          message={(detail.error as Error).message}
          onRetry={() => void detail.refetch()}
        />
      </QepPageShell>
    );
  }
  const dto = detail.data!;

  return (
    <QepPageShell
      title={`Set ${dto.id}`}
      description={dto.purpose}
      breadcrumbs={["QEP", "Evidence", "Sets", dto.id]}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <QepPanel title="Seal">
          <dl className="grid gap-2 text-sm">
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Seal hash</dt>
              <dd className="break-all font-mono text-xs">{dto.sealHash}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Sealed at</dt>
              <dd>{formatDate(dto.sealedAt)}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-muted-foreground)]">Sealed by</dt>
              <dd>{dto.sealedBy}</dd>
            </div>
          </dl>
        </QepPanel>
        <QepPanel title="Members">
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {dto.memberEvidenceIds.map((memberId) => (
              <li key={memberId}>
                <Link
                  className="text-[var(--color-primary)] underline"
                  href={QEP_EVIDENCE_ROUTES.detail(memberId)}
                >
                  {memberId}
                </Link>
              </li>
            ))}
          </ul>
        </QepPanel>
      </div>
    </QepPageShell>
  );
}

function RelationshipsView({
  id,
  dto,
}: {
  readonly id: string;
  readonly dto: EvidenceDto;
}) {
  const relationships = useQuery({
    queryKey: qepQueryKeys.evidence.relationships(id),
    queryFn: ({ signal }) => getEvidenceRelationships(id, { signal }),
  });

  return (
    <QepPageShell
      title={dto.title ?? dto.id}
      description="Evidence relationships"
      breadcrumbs={["QEP", "Evidence", dto.title ?? dto.id, "Relationships"]}
      actions={
        <Link
          className="text-sm text-[var(--color-primary)] underline"
          href={QEP_EVIDENCE_ROUTES.detail(id)}
        >
          Back to detail
        </Link>
      }
    >
      {relationships.isLoading ? (
        <QepLoadingState label="Loading relationships…" />
      ) : null}
      {relationships.isError ? (
        <QepErrorState
          message={(relationships.error as Error).message}
          onRetry={() => void relationships.refetch()}
        />
      ) : null}
      {relationships.data ? (
        relationships.data.length === 0 ? (
          <QepEmptyState title="No relationships" />
        ) : (
          <QepTable
            caption="Relationships"
            columns={["Target capability", "Target ID", "Relation type", "Created"]}
            rows={relationships.data.map((row) => ({
              id: row.id,
              cells: [
                row.targetCapability,
                row.targetId,
                row.relationType,
                formatDate(row.createdAt),
              ],
            }))}
          />
        )
      ) : null}
    </QepPageShell>
  );
}

function ProvenanceView({
  id,
  dto,
}: {
  readonly id: string;
  readonly dto: EvidenceDto;
}) {
  const provenance = useQuery({
    queryKey: qepQueryKeys.evidence.provenance(id),
    queryFn: ({ signal }) => getEvidenceProvenance(id, { signal }),
  });

  return (
    <QepPageShell
      title={dto.title ?? dto.id}
      description="Lifecycle timeline and provenance"
      breadcrumbs={["QEP", "Evidence", dto.title ?? dto.id, "Provenance"]}
      actions={
        <Link
          className="text-sm text-[var(--color-primary)] underline"
          href={QEP_EVIDENCE_ROUTES.detail(id)}
        >
          Back to detail
        </Link>
      }
    >
      {provenance.isLoading ? <QepLoadingState label="Loading provenance…" /> : null}
      {provenance.isError ? (
        <QepErrorState
          message={(provenance.error as Error).message}
          onRetry={() => void provenance.refetch()}
        />
      ) : null}
      {provenance.data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <QepPanel title="Provenance events">
            {provenance.data.provenance.length === 0 ? (
              <QepEmptyState title="No provenance events" />
            ) : (
              <ol className="space-y-2 text-sm">
                {provenance.data.provenance.map((event, index) => (
                  <li
                    key={`${event.kind}-${index}`}
                    className="rounded border border-[var(--color-border)] p-2"
                  >
                    <p className="font-medium">{event.kind}</p>
                    <p className="text-[var(--color-muted-foreground)]">
                      {formatDate(event.occurredAt)} · {event.actorId}
                    </p>
                    {event.detail ? <p>{event.detail}</p> : null}
                  </li>
                ))}
              </ol>
            )}
          </QepPanel>
          <QepPanel title="Lifecycle history">
            {provenance.data.history.length === 0 ? (
              <QepEmptyState title="No history entries" />
            ) : (
              <ol className="space-y-2 text-sm">
                {provenance.data.history.map((entry) => (
                  <li
                    key={entry.sequence}
                    className="rounded border border-[var(--color-border)] p-2"
                  >
                    <p className="font-medium">{entry.command}</p>
                    <p className="text-[var(--color-muted-foreground)]">
                      {formatDate(entry.occurredAt)} · {entry.actorId}
                    </p>
                    <p>{entry.summary}</p>
                  </li>
                ))}
              </ol>
            )}
          </QepPanel>
        </div>
      ) : null}
    </QepPageShell>
  );
}

function VersionsView({ id, dto }: { readonly id: string; readonly dto: EvidenceDto }) {
  const versions = useQuery({
    queryKey: qepQueryKeys.evidence.versions(id),
    queryFn: ({ signal }) => getEvidenceVersions(id, { signal }),
  });

  return (
    <QepPageShell
      title={dto.title ?? dto.id}
      description="Version history"
      breadcrumbs={["QEP", "Evidence", dto.title ?? dto.id, "Versions"]}
      actions={
        <Link
          className="text-sm text-[var(--color-primary)] underline"
          href={QEP_EVIDENCE_ROUTES.detail(id)}
        >
          Back to detail
        </Link>
      }
    >
      {versions.isLoading ? <QepLoadingState label="Loading versions…" /> : null}
      {versions.isError ? (
        <QepErrorState
          message={(versions.error as Error).message}
          onRetry={() => void versions.refetch()}
        />
      ) : null}
      {versions.data ? (
        versions.data.length === 0 ? (
          <QepEmptyState title="No prior versions" />
        ) : (
          <QepTable
            caption="Version history"
            columns={[
              "Version",
              "Media type",
              "Byte size",
              "Replaced at",
              "Replaced by",
            ]}
            rows={versions.data.map((row) => ({
              id: String(row.version),
              cells: [
                String(row.version),
                row.content.mediaType,
                String(row.content.byteSize),
                formatDate(row.replacedAt),
                row.replacedBy,
              ],
            }))}
          />
        )
      ) : null}
    </QepPageShell>
  );
}

function EvidenceDetailView({
  id,
  mode,
}: {
  readonly id: string;
  readonly mode: ReturnType<typeof parseQepEvidenceDetailMode>;
}) {
  const detail = useQuery({
    queryKey: qepQueryKeys.evidence.detail(id),
    queryFn: ({ signal }) => getEvidence(id, { signal }),
  });

  if (detail.isLoading) {
    return (
      <QepPageShell title="Evidence" breadcrumbs={["QEP", "Evidence"]}>
        <QepLoadingState label="Loading evidence…" />
      </QepPageShell>
    );
  }
  if (detail.isError) {
    const err = detail.error as Error & { status?: number; code?: string };
    const forbidden =
      err.status === 403 || err.code === "FORBIDDEN" || /forbidden/i.test(err.message);
    const notFound =
      err.status === 404 || err.code === "NOT_FOUND" || /not found/i.test(err.message);
    return (
      <QepPageShell title="Evidence" breadcrumbs={["QEP", "Evidence"]}>
        <QepErrorState
          message={
            forbidden
              ? "You do not have permission to view this Evidence item."
              : notFound
                ? "Evidence item not found."
                : err.message
          }
          onRetry={() => void detail.refetch()}
        />
      </QepPageShell>
    );
  }
  const dto = detail.data!;

  if (mode === "relationships") return <RelationshipsView id={id} dto={dto} />;
  if (mode === "provenance") return <ProvenanceView id={id} dto={dto} />;
  if (mode === "versions") return <VersionsView id={id} dto={dto} />;

  return (
    <QepPageShell
      title={dto.title ?? dto.id}
      description="Evidence detail workspace"
      breadcrumbs={["QEP", "Evidence", dto.title ?? dto.id]}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <QepStatusBadge status={dto.status} />
          <Link
            className="text-sm text-[var(--color-primary)] underline"
            href={QEP_EVIDENCE_ROUTES.provenance(id)}
          >
            Provenance
          </Link>
          <Link
            className="text-sm text-[var(--color-primary)] underline"
            href={QEP_EVIDENCE_ROUTES.versions(id)}
          >
            Versions
          </Link>
          <Link
            className="text-sm text-[var(--color-primary)] underline"
            href={QEP_EVIDENCE_ROUTES.relationships(id)}
          >
            Relationships
          </Link>
        </div>
      }
    >
      <EvidenceActionBar dto={dto} />
      <div className="grid gap-4 lg:grid-cols-2">
        <MetadataPanel dto={dto} />
        <IntegrityPanel dto={dto} />
        <RetentionPanel dto={dto} />
        <AvailableActionsPanel dto={dto} />
      </div>
    </QepPageShell>
  );
}

/**
 * APZQEP-ENG-110F — Evidence Workbench router.
 */
export function QepEvidenceRouterView({ pathname }: { readonly pathname: string }) {
  const evidenceId = parseQepEvidenceRouteId(pathname);
  const detailMode = parseQepEvidenceDetailMode(pathname);
  const collectionId = parseQepEvidenceCollectionId(pathname);
  const setId = parseQepEvidenceSetId(pathname);

  if (setId) return <SetDetailView id={setId} />;
  if (collectionId) return <CollectionDetailView id={collectionId} />;
  if (evidenceId) return <EvidenceDetailView id={evidenceId} mode={detailMode} />;
  if (isQepEvidenceNewRoute(pathname)) return <CaptureView />;
  if (isQepEvidenceExplorerRoute(pathname)) return <ExplorerView />;
  if (isQepEvidenceCollectionsRoute(pathname)) return <CollectionsLandingView />;

  return <HomeView />;
}
