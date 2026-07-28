"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  addBaselineItem,
  compareBaselines,
  createBaseline,
  getBaseline,
  listBaselineItems,
  listBaselines,
  listContentVersions,
  lockBaseline,
  archiveBaseline,
  removeBaselineItem,
  requirementBaselineHistory,
  searchRequirements,
  updateDraftBaseline,
  verifyBaselineIntegrity,
  type AddQepBaselineItemInput,
  type CreateQepBaselineInput,
  type QepBaselineListParams,
} from "@/lib/qep/qep-api";
import { qepQueryKeys } from "@/lib/qep/query-keys";
import { QEP_REQUIREMENTS_ROUTES, parseQepBaselineRouteId } from "@apzhub/qep-requirements/presentation";

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

function formatDate(value?: string): string {
  return value ? value : "—";
}

function IntegrityBadge({
  status,
}: {
  readonly status?: string;
}) {
  if (!status) {
    return <span className="text-xs text-[var(--color-muted-foreground)]">Not applicable</span>;
  }
  const label =
    status === "verified"
      ? "Verified"
      : status === "verification_failed"
        ? "Verification failed"
        : status === "unsupported_schema"
          ? "Unsupported schema"
          : "Not yet verified";
  return (
    <span
      className="inline-flex rounded-full border border-[var(--color-border)] px-2 py-0.5 text-xs"
      data-testid="qep-baseline-integrity-status"
    >
      {label}
    </span>
  );
}

/** APZQEP-ENG-020E Part 3 — Requirement Baselines list (Workbench). */
export function QepBaselinesListView() {
  const [status, setStatus] = useState<QepBaselineListParams["status"]>(undefined);

  const query = useQuery({
    queryKey: qepQueryKeys.baselines.list({ status }),
    queryFn: ({ signal }) => listBaselines({ status, limit: 50 }, { signal }),
  });

  return (
    <QepPageShell
      title="Requirement Baselines"
      description="Named, numbered sets of pinned requirement content versions used for configuration management."
      breadcrumbs={["Requirements", "Baselines"]}
      actions={
        <>
          <Link
            href={QEP_REQUIREMENTS_ROUTES.baselines.compare}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
            data-testid="qep-baselines-compare-link"
          >
            Compare baselines
          </Link>
          <Link
            href={QEP_REQUIREMENTS_ROUTES.baselines.new}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm font-medium"
            data-testid="qep-baselines-create"
          >
            New baseline
          </Link>
        </>
      }
    >
      <QepFilterBar>
        <label className="text-sm">
          Status{" "}
          <select
            data-testid="qep-baselines-status-filter"
            value={status ?? ""}
            onChange={(event) =>
              setStatus(
                (event.target.value || undefined) as QepBaselineListParams["status"],
              )
            }
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="locked">Locked</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </QepFilterBar>
      {query.isLoading ? <QepLoadingState label="Loading baselines…" /> : null}
      {query.isError ? (
        <QepErrorState
          message={query.error instanceof Error ? query.error.message : "Unable to load baselines"}
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess && query.data.items.length === 0 ? (
        <QepEmptyState title="No requirement baselines found" />
      ) : null}
      {query.isSuccess && query.data.items.length > 0 ? (
        <QepTable
          caption="Requirement baselines"
          columns={[
            "Number",
            "Name",
            "Status",
            "Owner",
            "Items",
            "Integrity",
            "Created",
            "Locked",
            "Archived",
            "",
          ]}
          rows={query.data.items.map((baseline) => ({
            id: baseline.id,
            cells: [
              baseline.number,
              <span key="name">
                {baseline.name}
                {baseline.description ? (
                  <span className="mt-0.5 block text-xs text-[var(--color-muted-foreground)]">
                    {baseline.description}
                  </span>
                ) : null}
              </span>,
              <QepStatusBadge key="status" status={baseline.status} />,
              baseline.createdBy,
              baseline.itemCount,
              <IntegrityBadge key="integrity" status={baseline.integrityVerificationStatus} />,
              formatDate(baseline.createdAt),
              formatDate(baseline.lockedAt),
              formatDate(baseline.archivedAt),
              <Link
                key="view"
                href={QEP_REQUIREMENTS_ROUTES.baselines.detail(baseline.id)}
                className="text-sm underline"
              >
                View
              </Link>,
            ],
          }))}
        />
      ) : null}
    </QepPageShell>
  );
}

/** Create-draft-baseline form. */
export function QepBaselineCreateView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
    mutationFn: (input: CreateQepBaselineInput) => createBaseline(input),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: qepQueryKeys.baselines.all() });
      router.push(QEP_REQUIREMENTS_ROUTES.baselines.detail(created.id));
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  }

  return (
    <QepPageShell
      title="New requirement baseline"
      description="Create a draft configuration-management baseline. Membership can be edited only while the baseline is a draft."
      breadcrumbs={["Requirements", "Baselines", "New"]}
    >
      <QepPanel title="Baseline">
        <p
          className="mb-3 rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/30 p-3 text-sm text-[var(--color-muted-foreground)]"
          role="note"
        >
          Locking a baseline is <strong>irreversible</strong> — once locked, its
          membership and integrity fingerprint can never be changed, and there is no
          unlock action.
        </p>
        {mutation.isError ? (
          <QepErrorState
            message={mutation.error instanceof Error ? mutation.error.message : "Create failed"}
          />
        ) : null}
        <form className="flex max-w-xl flex-col gap-3" onSubmit={handleSubmit}>
          <Input
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            data-testid="qep-baseline-name"
          />
          <Input
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            data-testid="qep-baseline-description"
          />
          <Button type="submit" disabled={mutation.isPending} data-testid="qep-baseline-create-submit">
            {mutation.isPending ? "Creating…" : "Create baseline"}
          </Button>
        </form>
      </QepPanel>
    </QepPageShell>
  );
}

function LockConfirmDialog({
  baselineName,
  onCancel,
  onConfirm,
  isSubmitting,
}: {
  readonly baselineName: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
  readonly isSubmitting: boolean;
}) {
  const [acknowledged, setAcknowledged] = useState(false);
  return (
    <QepPanel title="Confirm lock">
      <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
        Locking <strong>{baselineName}</strong> computes and permanently records its
        integrity fingerprint. Membership can never be changed afterward, and there is
        no unlock action.
      </p>
      <label className="mb-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={acknowledged}
          onChange={(event) => setAcknowledged(event.target.checked)}
          data-testid="qep-baseline-lock-ack"
        />
        I understand this action is irreversible.
      </label>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={isSubmitting || !acknowledged}
          onClick={onConfirm}
          data-testid="qep-baseline-lock-confirm"
        >
          Lock baseline
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </QepPanel>
  );
}

function ArchiveConfirmDialog({
  baselineName,
  onCancel,
  onConfirm,
  isSubmitting,
}: {
  readonly baselineName: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
  readonly isSubmitting: boolean;
}) {
  return (
    <QepPanel title="Confirm archive">
      <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
        Archiving <strong>{baselineName}</strong> retains it as historical configuration.
        There is no restore action.
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={isSubmitting}
          onClick={onConfirm}
          data-testid="qep-baseline-archive-confirm"
        >
          Archive baseline
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </QepPanel>
  );
}

function RemoveItemConfirmDialog({
  requirementId,
  onCancel,
  onConfirm,
  isSubmitting,
}: {
  readonly requirementId: string;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
  readonly isSubmitting: boolean;
}) {
  return (
    <QepPanel title="Remove baseline member">
      <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
        Remove requirement <strong>{requirementId}</strong> from this draft baseline?
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isSubmitting}
          onClick={onConfirm}
          data-testid="qep-baseline-remove-item-confirm"
        >
          Remove
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </QepPanel>
  );
}

/** Add-version flow: find requirement -> list versions -> select exact version -> confirm -> add. No "latest" auto-selection. */
function AddBaselineItemFlow({
  baselineId,
  onDone,
}: {
  readonly baselineId: string;
  readonly onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedRequirementId, setSelectedRequirementId] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  const searchQuery = useQuery({
    queryKey: qepQueryKeys.requirements.search({ q: search }),
    queryFn: ({ signal }) => searchRequirements({ q: search }, { signal }),
    enabled: search.trim().length > 0,
  });

  const versionsQuery = useQuery({
    queryKey: qepQueryKeys.requirements.versions(selectedRequirementId ?? ""),
    queryFn: ({ signal }) =>
      listContentVersions(selectedRequirementId ?? "", { limit: 50 }, { signal }),
    enabled: Boolean(selectedRequirementId),
  });

  const addMutation = useMutation({
    mutationFn: (input: AddQepBaselineItemInput) => addBaselineItem(baselineId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qepQueryKeys.baselines.detail(baselineId) });
      void queryClient.invalidateQueries({ queryKey: qepQueryKeys.baselines.items(baselineId) });
      setSelectedRequirementId(null);
      setSelectedVersion(null);
      onDone();
    },
  });

  const selectedVersionMeta = versionsQuery.data?.items.find(
    (version) => version.versionNumber === selectedVersion,
  );

  return (
    <QepPanel title="Add requirement version">
      {addMutation.isError ? (
        <QepErrorState
          message={addMutation.error instanceof Error ? addMutation.error.message : "Add failed"}
        />
      ) : null}
      <Input
        label="Find requirement"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setSelectedRequirementId(null);
          setSelectedVersion(null);
        }}
        data-testid="qep-baseline-add-item-search"
      />
      {searchQuery.isSuccess && searchQuery.data.items.length > 0 && !selectedRequirementId ? (
        <ul className="mt-2 space-y-1 text-sm">
          {searchQuery.data.items.map((requirement) => (
            <li key={requirement.id}>
              <button
                type="button"
                className="underline"
                onClick={() => setSelectedRequirementId(requirement.id)}
                data-testid={`qep-baseline-add-item-pick-${requirement.id}`}
              >
                {requirement.key} — {requirement.title}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {selectedRequirementId ? (
        <div className="mt-4">
          <p className="text-sm font-medium">Requirement: {selectedRequirementId}</p>
          {versionsQuery.isLoading ? <QepLoadingState label="Loading versions…" /> : null}
          {versionsQuery.isSuccess && versionsQuery.data.items.length === 0 ? (
            <QepEmptyState title="This requirement has no content versions yet" />
          ) : null}
          {versionsQuery.isSuccess && versionsQuery.data.items.length > 0 ? (
            <label className="mt-2 block text-sm">
              Exact version (no "latest" auto-selection)
              <select
                className="ml-2"
                data-testid="qep-baseline-add-item-version"
                value={selectedVersion ?? ""}
                onChange={(event) =>
                  setSelectedVersion(event.target.value ? Number(event.target.value) : null)
                }
              >
                <option value="">Select a version…</option>
                {versionsQuery.data.items.map((version) => (
                  <option key={version.id} value={version.versionNumber}>
                    Version {version.versionNumber} · {version.changeReason}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {selectedVersionMeta ? (
            <div className="mt-3 rounded-md border border-[var(--color-border)] p-3 text-sm">
              <p>
                Confirm adding <strong>version {selectedVersionMeta.versionNumber}</strong> of{" "}
                {selectedRequirementId} ({selectedVersionMeta.changeReason}).
              </p>
              <Button
                type="button"
                size="sm"
                className="mt-2"
                disabled={addMutation.isPending}
                onClick={() =>
                  addMutation.mutate({
                    contentVersionId: selectedVersionMeta.id,
                    requirementId: selectedRequirementId,
                  })
                }
                data-testid="qep-baseline-add-item-confirm"
              >
                {addMutation.isPending ? "Adding…" : "Add to baseline"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </QepPanel>
  );
}

/** Detail view: metadata, integrity, contents table, lifecycle actions. */
export function QepBaselineDetailView({ baselineId }: { readonly baselineId: string }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [pendingAction, setPendingAction] = useState<null | "lock" | "archive">(null);
  const [removingContentVersionId, setRemovingContentVersionId] = useState<string | null>(null);

  const query = useQuery({
    queryKey: qepQueryKeys.baselines.detail(baselineId),
    queryFn: ({ signal }) => getBaseline(baselineId, { signal }),
  });

  const itemsQuery = useQuery({
    queryKey: qepQueryKeys.baselines.items(baselineId),
    queryFn: ({ signal }) => listBaselineItems(baselineId, { signal }),
    enabled: query.isSuccess,
  });

  function invalidateBaseline() {
    void queryClient.invalidateQueries({ queryKey: qepQueryKeys.baselines.detail(baselineId) });
    void queryClient.invalidateQueries({ queryKey: qepQueryKeys.baselines.items(baselineId) });
    void queryClient.invalidateQueries({ queryKey: qepQueryKeys.baselines.all() });
  }

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const editMutation = useMutation({
    mutationFn: () => updateDraftBaseline(baselineId, { name, description }),
    onSuccess: () => {
      setEditing(false);
      invalidateBaseline();
    },
  });

  const removeMutation = useMutation({
    mutationFn: (contentVersionId: string) => removeBaselineItem(baselineId, contentVersionId),
    onSuccess: () => {
      setRemovingContentVersionId(null);
      invalidateBaseline();
    },
  });

  const lockMutation = useMutation({
    mutationFn: () => lockBaseline(baselineId),
    onSuccess: () => {
      setPendingAction(null);
      invalidateBaseline();
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveBaseline(baselineId),
    onSuccess: () => {
      setPendingAction(null);
      invalidateBaseline();
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => verifyBaselineIntegrity(baselineId),
    onSuccess: invalidateBaseline,
  });

  if (query.isLoading) return <QepLoadingState label="Loading baseline…" />;
  if (query.isError || !query.data) {
    return (
      <QepErrorState
        message={query.error instanceof Error ? query.error.message : "Baseline not found"}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const baseline = query.data;
  const actions = new Set(baseline.availableActions);

  return (
    <QepPageShell
      title={`Baseline #${baseline.number} — ${baseline.name}`}
      description={baseline.description}
      breadcrumbs={["Requirements", "Baselines", `#${baseline.number}`]}
      actions={
        <>
          {actions.has("edit") ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setName(baseline.name);
                setDescription(baseline.description ?? "");
                setEditing(true);
              }}
              data-testid="qep-baseline-edit"
            >
              Edit
            </Button>
          ) : null}
          {actions.has("addItem") ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAddingItem(true)}
              data-testid="qep-baseline-add-item-open"
            >
              Add version
            </Button>
          ) : null}
          {actions.has("lock") ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPendingAction("lock")}
              data-testid="qep-baseline-lock-open"
            >
              Lock
            </Button>
          ) : null}
          {actions.has("archive") ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPendingAction("archive")}
              data-testid="qep-baseline-archive-open"
            >
              Archive
            </Button>
          ) : null}
          {actions.has("verifyIntegrity") ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={verifyMutation.isPending}
              onClick={() => verifyMutation.mutate()}
              data-testid="qep-baseline-verify"
            >
              {verifyMutation.isPending ? "Verifying…" : "Verify integrity"}
            </Button>
          ) : null}
          {actions.has("compare") ? (
            <Link
              href={QEP_REQUIREMENTS_ROUTES.baselines.compare}
              className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
            >
              Compare
            </Link>
          ) : null}
        </>
      }
    >
      <QepPanel title="Details">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-[var(--color-muted-foreground)]">Status</dt>
            <dd data-testid="qep-baseline-status">
              <QepStatusBadge status={baseline.status} /> <span>{baseline.status}</span>
            </dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--color-muted-foreground)]">Owner</dt>
            <dd>{baseline.createdBy}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--color-muted-foreground)]">Item count</dt>
            <dd>{baseline.itemCount}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--color-muted-foreground)]">Created</dt>
            <dd>{formatDate(baseline.createdAt)}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--color-muted-foreground)]">Locked</dt>
            <dd>{formatDate(baseline.lockedAt)}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--color-muted-foreground)]">Archived</dt>
            <dd>{formatDate(baseline.archivedAt)}</dd>
          </div>
        </dl>
      </QepPanel>

      <QepPanel title="Integrity">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-[var(--color-muted-foreground)]">Verification status</dt>
            <dd>
              <IntegrityBadge status={baseline.integrityVerificationStatus} />
            </dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--color-muted-foreground)]">Algorithm</dt>
            <dd>{baseline.integrityAlgorithm ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--color-muted-foreground)]">Verified at</dt>
            <dd>{formatDate(baseline.integrityVerifiedAt)}</dd>
          </div>
          {baseline.integrityFingerprint ? (
            <div className="sm:col-span-2">
              <dt className="font-medium text-[var(--color-muted-foreground)]">Fingerprint</dt>
              <dd className="break-all font-mono text-xs">{baseline.integrityFingerprint}</dd>
            </div>
          ) : null}
        </dl>
        {verifyMutation.isError ? (
          <QepErrorState
            message={
              verifyMutation.error instanceof Error
                ? verifyMutation.error.message
                : "Integrity verification failed — the baseline may have been tampered with"
            }
          />
        ) : null}
        {verifyMutation.isSuccess ? (
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]" role="status">
            Integrity re-verified successfully.
          </p>
        ) : null}
      </QepPanel>

      {editing ? (
        <QepPanel title="Edit draft baseline">
          <form
            className="flex max-w-xl flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              editMutation.mutate();
            }}
          >
            <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
            <Input
              label="Description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={editMutation.isPending}>
                Save changes
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </QepPanel>
      ) : null}

      {addingItem ? (
        <AddBaselineItemFlow baselineId={baselineId} onDone={() => setAddingItem(false)} />
      ) : null}

      <QepPanel title="Baseline contents">
        {itemsQuery.isLoading ? <QepLoadingState label="Loading contents…" /> : null}
        {itemsQuery.isError ? (
          <QepErrorState
            message={
              itemsQuery.error instanceof Error ? itemsQuery.error.message : "Unable to load contents"
            }
            onRetry={() => void itemsQuery.refetch()}
          />
        ) : null}
        {itemsQuery.isSuccess && itemsQuery.data.length === 0 ? (
          <QepEmptyState title="This baseline has no members yet" />
        ) : null}
        {itemsQuery.isSuccess && itemsQuery.data.length > 0 ? (
          <QepTable
            caption="Baseline contents"
            columns={["Requirement", "Content version", "Included at", "Included by", ""]}
            rows={itemsQuery.data.map((item) => ({
              id: item.contentVersionId,
              cells: [
                <Link
                  key="req"
                  href={QEP_REQUIREMENTS_ROUTES.detail(item.requirementId)}
                  className="underline"
                >
                  {item.requirementId}
                </Link>,
                <span key="version">Version {item.contentVersionNumber}</span>,
                formatDate(item.includedAt),
                item.includedBy,
                actions.has("removeItem") ? (
                  <Button
                    key="remove"
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRemovingContentVersionId(item.contentVersionId)}
                    data-testid={`qep-baseline-remove-item-${item.contentVersionId}`}
                  >
                    Remove
                  </Button>
                ) : null,
              ],
            }))}
          />
        ) : null}
      </QepPanel>

      {removingContentVersionId ? (
        <RemoveItemConfirmDialog
          requirementId={
            itemsQuery.data?.find((item) => item.contentVersionId === removingContentVersionId)
              ?.requirementId ?? removingContentVersionId
          }
          isSubmitting={removeMutation.isPending}
          onCancel={() => setRemovingContentVersionId(null)}
          onConfirm={() => removeMutation.mutate(removingContentVersionId)}
        />
      ) : null}

      {pendingAction === "lock" ? (
        <LockConfirmDialog
          baselineName={baseline.name}
          isSubmitting={lockMutation.isPending}
          onCancel={() => setPendingAction(null)}
          onConfirm={() => lockMutation.mutate()}
        />
      ) : null}
      {pendingAction === "archive" ? (
        <ArchiveConfirmDialog
          baselineName={baseline.name}
          isSubmitting={archiveMutation.isPending}
          onCancel={() => setPendingAction(null)}
          onConfirm={() => archiveMutation.mutate()}
        />
      ) : null}
      {lockMutation.isError ? (
        <QepErrorState
          message={lockMutation.error instanceof Error ? lockMutation.error.message : "Lock failed"}
        />
      ) : null}
      {archiveMutation.isError ? (
        <QepErrorState
          message={
            archiveMutation.error instanceof Error ? archiveMutation.error.message : "Archive failed"
          }
        />
      ) : null}
    </QepPageShell>
  );
}

/** Compare two baselines' membership, with a version-changed callout. */
export function QepBaselinesCompareView() {
  const [baseId, setBaseId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [submitted, setSubmitted] = useState<{ base: string; target: string } | null>(null);

  const listQuery = useQuery({
    queryKey: qepQueryKeys.baselines.list(),
    queryFn: ({ signal }) => listBaselines({ limit: 100 }, { signal }),
  });

  const compareQuery = useQuery({
    queryKey: qepQueryKeys.baselines.compare(submitted?.base ?? "", submitted?.target ?? ""),
    queryFn: () =>
      compareBaselines({ baseBaselineId: submitted!.base, targetBaselineId: submitted!.target }),
    enabled: Boolean(submitted),
  });

  return (
    <QepPageShell
      title="Compare baselines"
      description="Compare membership between two requirement baselines."
      breadcrumbs={["Requirements", "Baselines", "Compare"]}
    >
      <QepPanel title="Select baselines">
        <form
          className="flex flex-wrap items-end gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (baseId && targetId) setSubmitted({ base: baseId, target: targetId });
          }}
        >
          <label className="text-sm">
            Base baseline{" "}
            <select
              data-testid="qep-baselines-compare-base"
              value={baseId}
              onChange={(event) => setBaseId(event.target.value)}
            >
              <option value="">Select…</option>
              {listQuery.data?.items.map((baseline) => (
                <option key={baseline.id} value={baseline.id}>
                  #{baseline.number} — {baseline.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Target baseline{" "}
            <select
              data-testid="qep-baselines-compare-target"
              value={targetId}
              onChange={(event) => setTargetId(event.target.value)}
            >
              <option value="">Select…</option>
              {listQuery.data?.items.map((baseline) => (
                <option key={baseline.id} value={baseline.id}>
                  #{baseline.number} — {baseline.name}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" size="sm" data-testid="qep-baselines-compare-submit">
            Compare
          </Button>
        </form>
      </QepPanel>

      {compareQuery.isLoading ? <QepLoadingState label="Comparing…" /> : null}
      {compareQuery.isError ? (
        <QepErrorState
          message={
            compareQuery.error instanceof Error ? compareQuery.error.message : "Comparison failed"
          }
        />
      ) : null}
      {compareQuery.isSuccess ? (
        <div className="grid gap-4" aria-live="polite" data-testid="qep-baselines-compare-result">
          {compareQuery.data.versionChanged.length > 0 ? (
            <QepPanel title="Version changed">
              <ul className="space-y-1 text-sm">
                {compareQuery.data.versionChanged.map((change) => (
                  <li key={change.requirementId}>
                    <Link
                      href={QEP_REQUIREMENTS_ROUTES.detail(change.requirementId)}
                      className="underline"
                    >
                      {change.requirementId}
                    </Link>
                    : version {change.removed.contentVersionNumber} → version{" "}
                    {change.added.contentVersionNumber}
                  </li>
                ))}
              </ul>
            </QepPanel>
          ) : null}
          <QepPanel title={`Added (${compareQuery.data.summary.addedCount})`}>
            {compareQuery.data.added.length === 0 ? (
              <QepEmptyState title="No added members" />
            ) : (
              <ul className="space-y-1 text-sm">
                {compareQuery.data.added.map((item) => (
                  <li key={item.contentVersionId}>
                    {item.requirementId} — version {item.contentVersionNumber}
                  </li>
                ))}
              </ul>
            )}
          </QepPanel>
          <QepPanel title={`Removed (${compareQuery.data.summary.removedCount})`}>
            {compareQuery.data.removed.length === 0 ? (
              <QepEmptyState title="No removed members" />
            ) : (
              <ul className="space-y-1 text-sm">
                {compareQuery.data.removed.map((item) => (
                  <li key={item.contentVersionId}>
                    {item.requirementId} — version {item.contentVersionNumber}
                  </li>
                ))}
              </ul>
            )}
          </QepPanel>
          <QepPanel title={`Unchanged (${compareQuery.data.summary.unchangedCount})`}>
            {compareQuery.data.unchanged.length === 0 ? (
              <QepEmptyState title="No unchanged members" />
            ) : (
              <ul className="space-y-1 text-sm">
                {compareQuery.data.unchanged.map((item) => (
                  <li key={item.contentVersionId}>
                    {item.requirementId} — version {item.contentVersionNumber}
                  </li>
                ))}
              </ul>
            )}
          </QepPanel>
        </div>
      ) : null}
    </QepPageShell>
  );
}

/** Baseline History panel embedded on the Requirement detail view. */
export function BaselineHistoryPanel({ requirementId }: { readonly requirementId: string }) {
  const query = useQuery({
    queryKey: qepQueryKeys.requirements.baselineHistory(requirementId),
    queryFn: ({ signal }) => requirementBaselineHistory(requirementId, { signal }),
  });

  return (
    <QepPanel title="Baseline history">
      {query.isLoading ? <QepLoadingState label="Loading baseline history…" /> : null}
      {query.isError ? (
        <QepErrorState
          message={
            query.error instanceof Error ? query.error.message : "Unable to load baseline history"
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess && query.data.length === 0 ? (
        <QepEmptyState title="This requirement is not included in any baseline yet" />
      ) : null}
      {query.isSuccess && query.data.length > 0 ? (
        <ul className="space-y-2 text-sm" data-testid="qep-requirement-baseline-history">
          {query.data.map((baseline) => (
            <li
              key={baseline.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--color-border)] p-3"
            >
              <span>
                <Link href={QEP_REQUIREMENTS_ROUTES.baselines.detail(baseline.id)} className="underline">
                  #{baseline.number} — {baseline.name}
                </Link>
              </span>
              <QepStatusBadge status={baseline.status} />
            </li>
          ))}
        </ul>
      ) : null}
    </QepPanel>
  );
}

/** Dispatches among the baseline surfaces based on pathname. */
export function QepBaselinesRouterView({ pathname }: { readonly pathname: string }) {
  const normalized = pathname.replace(/\/+$/, "");
  if (normalized === QEP_REQUIREMENTS_ROUTES.baselines.new) {
    return <QepBaselineCreateView />;
  }
  if (normalized === QEP_REQUIREMENTS_ROUTES.baselines.compare) {
    return <QepBaselinesCompareView />;
  }
  const id = parseQepBaselineRouteId(normalized);
  if (id) {
    return <QepBaselineDetailView baselineId={id} />;
  }
  return <QepBaselinesListView />;
}
