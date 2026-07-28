"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";

import {
  createRequirement,
  compareContentVersions,
  getAvailableTransitions,
  getContentVersion,
  getLifecycleHistory,
  getRequirement,
  listRequirements,
  listContentVersions,
  searchRequirements,
  transitionRequirement,
  updateRequirement,
  type CreateQepRequirementInput,
  type QepListParams,
  type QepRequirementTransitionInput,
} from "@/lib/qep/qep-api";
import { qepQueryKeys } from "@/lib/qep/query-keys";
import {
  QEP_REQUIREMENTS_ROUTES,
  isQepBaselinesRoute,
  isQepRelationshipsRoute,
  parseQepRequirementRouteId,
} from "@apzhub/qep-requirements/presentation";

import { BaselineHistoryPanel, QepBaselinesRouterView } from "./qep-baselines-views";
import {
  QepRequirementRelationshipsPanel,
  QepRelationshipsRouterView,
} from "./qep-relationships-views";
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

const DEFAULT_PROJECT_ID = "default";

function formatLifecycleAction(action: string): string {
  return action.replace(/_/g, " ");
}

function LifecycleTransitionDialog({
  action,
  requirementKey,
  expectedRevision,
  onCancel,
  onConfirm,
  isSubmitting,
}: {
  readonly action: string;
  readonly requirementKey: string;
  readonly expectedRevision?: number;
  readonly onCancel: () => void;
  readonly onConfirm: (input: QepRequirementTransitionInput) => void;
  readonly isSubmitting: boolean;
}) {
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const requiresReason = action === "reject";

  return (
    <QepPanel title={`Confirm ${formatLifecycleAction(action)}`}>
      <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
        Apply lifecycle action <strong>{formatLifecycleAction(action)}</strong> to{" "}
        {requirementKey}.
      </p>
      {requiresReason ? (
        <Input
          label="Reason (required)"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          required
          data-testid="qep-lifecycle-reason"
        />
      ) : (
        <Input
          label="Reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        />
      )}
      <div className="mt-3">
        <Input
          label="Comments"
          value={comments}
          onChange={(event) => setComments(event.target.value)}
        />
      </div>
      <div className="mt-4 flex gap-2">
        <Button
          type="button"
          size="sm"
          disabled={isSubmitting || (requiresReason && !reason.trim())}
          onClick={() =>
            onConfirm({
              action,
              reason: reason.trim() || undefined,
              comments: comments.trim() || undefined,
              expectedRevision,
            })
          }
          data-testid="qep-lifecycle-confirm"
        >
          Confirm
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </QepPanel>
  );
}

function useSearchParamsState(): [QepListParams, (search: string) => void] {
  const [search, setSearch] = useState("");
  const params = useMemo<QepListParams>(
    () => ({
      ...(search.trim() ? { q: search.trim() } : {}),
    }),
    [search],
  );
  return [params, setSearch];
}

function ListQueryStates({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyTitle,
  onRetry,
  children,
}: {
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly error: unknown;
  readonly isEmpty: boolean;
  readonly emptyTitle: string;
  readonly onRetry: () => void;
  readonly children: ReactNode;
}) {
  if (isLoading) return <QepLoadingState />;
  if (isError) {
    return (
      <QepErrorState
        message={error instanceof Error ? error.message : "Unable to load requirements"}
        onRetry={onRetry}
      />
    );
  }
  if (isEmpty) return <QepEmptyState title={emptyTitle} />;
  return children;
}

export function QepRequirementsListView() {
  const [params, setSearch] = useSearchParamsState();
  const searchTerm = "q" in params && params.q ? params.q : "";

  const query = useQuery({
    queryKey: searchTerm
      ? qepQueryKeys.requirements.search({ q: searchTerm })
      : qepQueryKeys.requirements.list(params),
    queryFn: ({ signal }) =>
      searchTerm
        ? searchRequirements({ q: searchTerm }, { signal })
        : listRequirements(params, { signal }),
  });

  return (
    <QepPageShell
      title="Requirements"
      description="Quality Engineering Platform requirements catalogue."
      actions={
        <Link
          href={QEP_REQUIREMENTS_ROUTES.new}
          className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 text-sm font-medium"
          data-testid="qep-requirements-create"
        >
          New requirement
        </Link>
      }
    >
      <QepFilterBar>
        <Input
          label="Search"
          value={searchTerm}
          onChange={(event) => setSearch(event.target.value)}
          data-testid="qep-requirements-search"
        />
      </QepFilterBar>
      <ListQueryStates
        isLoading={query.isLoading}
        isError={query.isError}
        error={query.error}
        isEmpty={query.isSuccess && query.data.items.length === 0}
        emptyTitle="No requirements found"
        onRetry={() => void query.refetch()}
      >
        {query.isSuccess ? (
          <QepTable
            caption="Requirements"
            columns={["Key", "Title", "Status", "Priority", ""]}
            rows={query.data.items.map((item) => ({
              id: item.id,
              cells: [
                item.key,
                item.title,
                <QepStatusBadge key="status" status={item.status} />,
                item.priority,
                <Link
                  key="view"
                  href={QEP_REQUIREMENTS_ROUTES.detail(item.id)}
                  className="text-sm underline"
                >
                  View
                </Link>,
              ],
            }))}
          />
        ) : null}
      </ListQueryStates>
    </QepPageShell>
  );
}

export function QepRequirementDetailView({ requirementId }: { readonly requirementId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const query = useQuery({
    queryKey: qepQueryKeys.requirements.detail(requirementId),
    queryFn: ({ signal }) => getRequirement(requirementId, { signal }),
  });

  const transitionsQuery = useQuery({
    queryKey: qepQueryKeys.requirements.transitions(requirementId),
    queryFn: ({ signal }) => getAvailableTransitions(requirementId, { signal }),
    enabled: query.isSuccess,
  });

  const lifecycleQuery = useQuery({
    queryKey: qepQueryKeys.requirements.lifecycle(requirementId),
    queryFn: ({ signal }) => getLifecycleHistory(requirementId, { signal }),
    enabled: query.isSuccess,
  });
  const versionsQuery = useQuery({
    queryKey: qepQueryKeys.requirements.versions(requirementId),
    queryFn: ({ signal }) => listContentVersions(requirementId, { limit: 50 }, { signal }),
    enabled: query.isSuccess,
  });
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [comparisonVersions, setComparisonVersions] = useState<{ base: number; target: number } | null>(
    null,
  );
  const versionDetailQuery = useQuery({
    queryKey: qepQueryKeys.requirements.version(requirementId, selectedVersion ?? 0),
    queryFn: ({ signal }) => getContentVersion(requirementId, selectedVersion ?? 0, { signal }),
    enabled: selectedVersion !== null,
  });
  const comparisonQuery = useQuery({
    queryKey: qepQueryKeys.requirements.comparison(
      requirementId,
      comparisonVersions?.base ?? 0,
      comparisonVersions?.target ?? 0,
    ),
    queryFn: ({ signal }) =>
      compareContentVersions(requirementId, {
        baseVersionNumber: comparisonVersions?.base ?? 0,
        targetVersionNumber: comparisonVersions?.target ?? 0,
      }, { signal }),
    enabled: comparisonVersions !== null,
  });

  const transitionMutation = useMutation({
    mutationFn: (input: QepRequirementTransitionInput) =>
      transitionRequirement(requirementId, input),
    onSuccess: (updated) => {
      setPendingAction(null);
      void queryClient.invalidateQueries({ queryKey: qepQueryKeys.requirements.all() });
      if (updated.status === "archived") {
        router.push(QEP_REQUIREMENTS_ROUTES.list);
      }
    },
  });

  if (query.isLoading) return <QepLoadingState />;
  if (query.isError || !query.data) {
    return (
      <QepErrorState
        message={query.error instanceof Error ? query.error.message : "Requirement not found"}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const item = query.data;
  const availableActions = transitionsQuery.data ?? [];

  return (
    <QepPageShell
      title={item.title}
      description={item.key}
      breadcrumbs={["Requirements", item.key]}
      actions={
        <>
          <Link
            href={QEP_REQUIREMENTS_ROUTES.edit(item.id)}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
          >
            Edit
          </Link>
          {availableActions.map((transition) => (
            <Button
              key={transition.action}
              type="button"
              variant="outline"
              size="sm"
              disabled={transitionMutation.isPending}
              onClick={() => setPendingAction(transition.action)}
              data-testid={`qep-lifecycle-action-${transition.action}`}
            >
              {formatLifecycleAction(transition.action)}
            </Button>
          ))}
        </>
      }
    >
      <QepPanel title="Details">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-[var(--color-muted-foreground)]">Status</dt>
            <dd>
              <QepStatusBadge status={item.status} />
            </dd>
          </div>
          {item.latestContentVersion ? (
            <div>
              <dt className="font-medium text-[var(--color-muted-foreground)]">Content version</dt>
              <dd>
                #{item.latestContentVersion.versionNumber} · {item.latestContentVersion.changeReason}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="font-medium text-[var(--color-muted-foreground)]">Priority</dt>
            <dd>{item.priority}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--color-muted-foreground)]">Type</dt>
            <dd>{item.type}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--color-muted-foreground)]">Project</dt>
            <dd>{item.projectId}</dd>
          </div>
          {item.description ? (
            <div className="sm:col-span-2">
              <dt className="font-medium text-[var(--color-muted-foreground)]">Description</dt>
              <dd>{item.description}</dd>
            </div>
          ) : null}
        </dl>
      </QepPanel>
      <QepPanel title="Version history">
        {versionsQuery.isLoading ? <QepLoadingState /> : null}
        {versionsQuery.isError ? <QepErrorState message="Unable to load content history" onRetry={() => void versionsQuery.refetch()} /> : null}
        {versionsQuery.isSuccess && versionsQuery.data.items.length === 0 ? (
          <QepEmptyState title="No content versions yet" />
        ) : null}
        {versionsQuery.isSuccess && versionsQuery.data.items.length > 0 ? (
          <>
            <ol className="space-y-2 text-sm">
              {versionsQuery.data.items.map((version) => (
                <li key={version.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--color-border)] p-3">
                  <span>
                    <strong>Version {version.versionNumber}</strong> · {version.changeReason} · {version.createdAt}
                  </span>
                  <Button type="button" size="sm" variant="outline" onClick={() => setSelectedVersion(version.versionNumber)}>
                    View details
                  </Button>
                </li>
              ))}
            </ol>
            {versionsQuery.data.items.length >= 2 ? (
              <form
                className="mt-4 flex flex-wrap items-end gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  const data = new FormData(event.currentTarget);
                  setComparisonVersions({
                    base: Number(data.get("baseVersion")),
                    target: Number(data.get("targetVersion")),
                  });
                }}
              >
                <label className="text-sm">Base version <select name="baseVersion" defaultValue={versionsQuery.data.items[1]?.versionNumber}>{versionsQuery.data.items.map((version) => <option key={version.id} value={version.versionNumber}>{version.versionNumber}</option>)}</select></label>
                <label className="text-sm">Target version <select name="targetVersion" defaultValue={versionsQuery.data.items[0]?.versionNumber}>{versionsQuery.data.items.map((version) => <option key={version.id} value={version.versionNumber}>{version.versionNumber}</option>)}</select></label>
                <Button type="submit" size="sm">Compare versions</Button>
              </form>
            ) : null}
          </>
        ) : null}
        {versionDetailQuery.isSuccess ? (
          <div className="mt-4 rounded-md border border-[var(--color-border)] p-3 text-sm">
            <strong>Version {versionDetailQuery.data.versionNumber} details</strong>
            <pre className="mt-2 overflow-auto text-xs">{JSON.stringify(versionDetailQuery.data.snapshot, null, 2)}</pre>
          </div>
        ) : null}
        {comparisonQuery.isSuccess ? (
          <div className="mt-4" aria-live="polite">
            <p className="text-sm font-medium">{comparisonQuery.data.changedFieldCount} changed fields</p>
            <ul className="mt-2 space-y-1 text-sm">
              {comparisonQuery.data.fieldChanges.filter((change) => change.classification !== "unchanged").map((change) => (
                <li key={change.field}><strong>{change.field}</strong>: {change.classification} (base: {JSON.stringify(change.base)}; target: {JSON.stringify(change.target)})</li>
              ))}
            </ul>
          </div>
        ) : null}
      </QepPanel>
      {pendingAction ? (
        <LifecycleTransitionDialog
          action={pendingAction}
          requirementKey={item.key}
          expectedRevision={item.revision}
          onCancel={() => setPendingAction(null)}
          onConfirm={(input) => transitionMutation.mutate(input)}
          isSubmitting={transitionMutation.isPending}
        />
      ) : null}
      {transitionMutation.isError ? (
        <QepErrorState
          message={
            transitionMutation.error instanceof Error
              ? transitionMutation.error.message
              : "Lifecycle transition failed"
          }
        />
      ) : null}
      <QepPanel title="Lifecycle history">
        {lifecycleQuery.isLoading ? <QepLoadingState /> : null}
        {lifecycleQuery.isError ? (
          <QepErrorState
            message={
              lifecycleQuery.error instanceof Error
                ? lifecycleQuery.error.message
                : "Unable to load lifecycle history"
            }
            onRetry={() => void lifecycleQuery.refetch()}
          />
        ) : null}
        {lifecycleQuery.isSuccess && lifecycleQuery.data.length === 0 ? (
          <QepEmptyState title="No lifecycle transitions yet" />
        ) : null}
        {lifecycleQuery.isSuccess && lifecycleQuery.data.length > 0 ? (
          <ol className="space-y-3 text-sm">
            {lifecycleQuery.data.map((entry) => (
              <li
                key={entry.id}
                className="rounded-md border border-[var(--color-border)] p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <QepStatusBadge status={entry.previousState} />
                  <span aria-hidden="true">→</span>
                  <QepStatusBadge status={entry.newState} />
                  <span className="text-[var(--color-muted-foreground)]">
                    {formatLifecycleAction(entry.action)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                  {entry.createdAt} · {entry.actorUserId}
                </p>
                {entry.reason ? <p className="mt-1">Reason: {entry.reason}</p> : null}
                {entry.comments ? <p className="mt-1">Comments: {entry.comments}</p> : null}
              </li>
            ))}
          </ol>
        ) : null}
      </QepPanel>
      <BaselineHistoryPanel requirementId={requirementId} />
      <QepRequirementRelationshipsPanel requirementId={requirementId} />
    </QepPageShell>
  );
}

function RequirementForm({
  initial,
  submitLabel,
  onSubmit,
  isSubmitting,
}: {
  readonly initial?: Partial<CreateQepRequirementInput>;
  readonly submitLabel: string;
  readonly onSubmit: (values: CreateQepRequirementInput) => void;
  readonly isSubmitting: boolean;
}) {
  const [key, setKey] = useState(initial?.key ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [type, setType] = useState(initial?.type ?? "functional");
  const [priority, setPriority] = useState(initial?.priority ?? "medium");
  const [changeReason, setChangeReason] = useState("");
  const isEdit = Boolean(initial?.key);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit({
      projectId: initial?.projectId ?? DEFAULT_PROJECT_ID,
      key: key.trim(),
      title: title.trim(),
      description: description.trim() || undefined,
      type: type.trim(),
      priority: priority.trim(),
      changeReason: changeReason.trim() || undefined,
    });
  }

  return (
    <form className="flex max-w-xl flex-col gap-3" onSubmit={handleSubmit}>
      {!initial?.key ? (
        <Input label="Key" value={key} onChange={(e) => setKey(e.target.value)} required />
      ) : null}
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Input label="Type" value={type} onChange={(e) => setType(e.target.value)} required />
      <Input
        label="Priority"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        required
      />
      {isEdit ? (
        <>
          <Input
            label="Change reason (required)"
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            required
            data-testid="qep-change-reason"
          />
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Saving creates an immutable content version.
          </p>
        </>
      ) : null}
      <Button type="submit" disabled={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
}

export function QepRequirementCreateView() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (input: CreateQepRequirementInput) => createRequirement(input),
    onSuccess: (created) => {
      void queryClient.invalidateQueries({ queryKey: qepQueryKeys.requirements.all() });
      router.push(QEP_REQUIREMENTS_ROUTES.detail(created.id));
    },
  });

  return (
    <QepPageShell
      title="New requirement"
      description="Create a QEP requirement."
      breadcrumbs={["Requirements", "New"]}
    >
      <QepPanel title="Requirement">
        {mutation.isError ? (
          <QepErrorState
            message={
              mutation.error instanceof Error ? mutation.error.message : "Create failed"
            }
          />
        ) : null}
        <RequirementForm
          submitLabel={mutation.isPending ? "Creating…" : "Create requirement"}
          onSubmit={(values) => mutation.mutate(values)}
          isSubmitting={mutation.isPending}
        />
      </QepPanel>
    </QepPageShell>
  );
}

export function QepRequirementEditView({ requirementId }: { readonly requirementId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: qepQueryKeys.requirements.detail(requirementId),
    queryFn: ({ signal }) => getRequirement(requirementId, { signal }),
  });

  const mutation = useMutation({
    mutationFn: (values: CreateQepRequirementInput) =>
      updateRequirement(requirementId, {
        title: values.title,
        changeReason: values.changeReason ?? "",
        description: values.description ?? null,
        type: values.type,
        priority: values.priority,
        expectedRevision: query.data?.revision,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: qepQueryKeys.requirements.all() });
      router.push(QEP_REQUIREMENTS_ROUTES.detail(requirementId));
    },
  });

  if (query.isLoading) return <QepLoadingState />;
  if (query.isError || !query.data) {
    return (
      <QepErrorState
        message={query.error instanceof Error ? query.error.message : "Requirement not found"}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const item = query.data;

  return (
    <QepPageShell
      title={`Edit ${item.key}`}
      description={item.title}
      breadcrumbs={["Requirements", item.key, "Edit"]}
    >
      <QepPanel title="Requirement">
        {mutation.isError ? (
          <QepErrorState
            message={
              mutation.error instanceof Error ? mutation.error.message : "Update failed"
            }
          />
        ) : null}
        <RequirementForm
          initial={{
            projectId: item.projectId,
            key: item.key,
            title: item.title,
            description: item.description,
            type: item.type,
            priority: item.priority,
          }}
          submitLabel={mutation.isPending ? "Saving…" : "Save changes"}
          onSubmit={(values) => mutation.mutate(values)}
          isSubmitting={mutation.isPending}
        />
      </QepPanel>
    </QepPageShell>
  );
}

export function QepRequirementsRouterView({ pathname }: { readonly pathname: string }) {
  if (isQepBaselinesRoute(pathname)) {
    return <QepBaselinesRouterView pathname={pathname} />;
  }

  if (isQepRelationshipsRoute(pathname)) {
    return <QepRelationshipsRouterView pathname={pathname} />;
  }

  if (pathname.replace(/\/+$/, "") === QEP_REQUIREMENTS_ROUTES.new) {
    return <QepRequirementCreateView />;
  }

  const id = parseQepRequirementRouteId(pathname);
  if (id && pathname.endsWith("/edit")) {
    return <QepRequirementEditView requirementId={id} />;
  }
  if (id) {
    return <QepRequirementDetailView requirementId={id} />;
  }

  return <QepRequirementsListView />;
}
