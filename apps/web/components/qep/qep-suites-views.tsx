"use client";

import type { SuiteLifecycleState, SuiteNode } from "@apzhub/qep-suites";
import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";

import {
  cloneSuite,
  createSuite,
  getSuite,
  listSuites,
  listSuiteTree,
  transitionSuite,
  versionSuite,
  type CreateQepSuiteInput,
  type QepSuiteListParams,
} from "@/lib/qep/qep-suites-api";
import { qepQueryKeys } from "@/lib/qep/query-keys";
import {
  QEP_SUITE_ROUTES,
  isQepSuitesNewRoute,
  parseQepSuiteRouteId,
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

type ViewMode = "list" | "tree" | "card";

const STATUS_OPTIONS: readonly SuiteLifecycleState[] = [
  "draft",
  "review",
  "approved",
  "published",
  "deprecated",
  "archived",
  "retired",
];

const LIFECYCLE_ACTIONS: Readonly<
  Record<SuiteLifecycleState, readonly { status: SuiteLifecycleState; label: string }[]>
> = {
  draft: [
    { status: "review", label: "Submit for review" },
    { status: "deleted", label: "Delete" },
  ],
  review: [
    { status: "approved", label: "Approve" },
    { status: "draft", label: "Return to draft" },
    { status: "deleted", label: "Delete" },
  ],
  approved: [
    { status: "published", label: "Publish" },
    { status: "review", label: "Return to review" },
    { status: "deprecated", label: "Deprecate" },
  ],
  published: [
    { status: "deprecated", label: "Deprecate" },
    { status: "archived", label: "Archive" },
  ],
  deprecated: [
    { status: "published", label: "Republish" },
    { status: "archived", label: "Archive" },
  ],
  archived: [
    { status: "draft", label: "Restore" },
    { status: "retired", label: "Retire" },
  ],
  retired: [{ status: "archived", label: "Return to archive" }],
  deleted: [],
};

function formatDate(value?: string): string {
  return value ? value.slice(0, 19).replace("T", " ") : "—";
}

function useSuiteList(params: QepSuiteListParams) {
  return useQuery({
    queryKey: qepQueryKeys.suites.list(params),
    queryFn: ({ signal }) => listSuites(params, { signal }),
  });
}

function SuiteListView({
  items,
  selectedId,
}: {
  readonly items: readonly SuiteNode[];
  readonly selectedId?: string;
}) {
  if (items.length === 0) {
    return <QepEmptyState title="No suites match the current filters." />;
  }
  return (
    <QepTable
      caption="Enterprise test suites"
      columns={["Name", "Status", "Kind", "Version", "Priority", "Owner", "Updated"]}
      rows={items.map((suite) => ({
        id: suite.suiteId,
        href: QEP_SUITE_ROUTES.detail(suite.suiteId),
        cells: [
          <Link
            key="n"
            href={QEP_SUITE_ROUTES.detail(suite.suiteId)}
            className={
              selectedId === suite.suiteId
                ? "font-semibold text-[var(--color-foreground)] underline"
                : "text-[var(--color-foreground)] underline-offset-2 hover:underline"
            }
          >
            {suite.name}
          </Link>,
          <QepStatusBadge key="s" status={suite.status} />,
          suite.kind,
          `v${suite.version}`,
          suite.priority,
          suite.ownerId,
          formatDate(suite.updatedAt),
        ],
      }))}
    />
  );
}

function SuiteCardView({ items }: { readonly items: readonly SuiteNode[] }) {
  if (items.length === 0) {
    return <QepEmptyState title="No suites to display." />;
  }
  return (
    <ul
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
      data-testid="qep-suite-cards"
    >
      {items.map((suite) => (
        <li key={suite.suiteId}>
          <Link
            href={QEP_SUITE_ROUTES.detail(suite.suiteId)}
            className="flex h-full flex-col gap-2 rounded-lg border border-[var(--color-border)] p-4 transition-colors hover:bg-[var(--color-muted)]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium">{suite.name}</h3>
              <QepStatusBadge status={suite.status} />
            </div>
            <p className="line-clamp-2 text-sm text-[var(--color-muted-foreground)]">
              {suite.description || "No description"}
            </p>
            <div className="mt-auto flex flex-wrap gap-2 text-xs text-[var(--color-muted-foreground)]">
              <span>{suite.kind}</span>
              <span>v{suite.version}</span>
              <span>{suite.priority}</span>
              {suite.folderPath !== "/" ? <span>{suite.folderPath}</span> : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function SuiteTreeView({ items }: { readonly items: readonly SuiteNode[] }) {
  const byParent = useMemo(() => {
    const map = new Map<string | undefined, SuiteNode[]>();
    for (const suite of items) {
      const key = suite.parentSuiteId;
      const list = map.get(key) ?? [];
      list.push(suite);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    return map;
  }, [items]);

  function renderNode(suite: SuiteNode, depth: number) {
    const children = byParent.get(suite.suiteId) ?? [];
    return (
      <li key={suite.suiteId}>
        <div
          className="flex items-center gap-2 py-1"
          style={{ paddingLeft: depth * 16 }}
        >
          <Link
            href={QEP_SUITE_ROUTES.detail(suite.suiteId)}
            className="font-medium underline-offset-2 hover:underline"
          >
            {suite.name}
          </Link>
          <QepStatusBadge status={suite.status} />
          <span className="text-xs text-[var(--color-muted-foreground)]">
            {suite.folderPath}
          </span>
        </div>
        {children.length > 0 ? (
          <ul>{children.map((child) => renderNode(child, depth + 1))}</ul>
        ) : null}
      </li>
    );
  }

  const roots = byParent.get(undefined) ?? [];
  if (roots.length === 0 && items.length === 0) {
    return <QepEmptyState title="No suite hierarchy yet." />;
  }

  return (
    <ul className="text-sm" data-testid="qep-suite-tree">
      {(roots.length > 0 ? roots : items).map((suite) => renderNode(suite, 0))}
    </ul>
  );
}

function SuiteHomeView() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [status, setStatus] = useState<string>("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<QepSuiteListParams["sortBy"]>("updatedAt");
  const [selected, setSelected] = useState<readonly string[]>([]);

  const params: QepSuiteListParams = {
    ...(status ? { status } : {}),
    ...(query.trim() ? { query: query.trim() } : {}),
    sortBy,
    sortDirection: "desc",
  };

  const listQuery = useSuiteList(params);
  const treeQuery = useQuery({
    queryKey: qepQueryKeys.suites.tree(),
    queryFn: ({ signal }) => listSuiteTree({ signal }),
    enabled: viewMode === "tree",
  });

  const items = listQuery.data?.items ?? [];
  const treeItems = treeQuery.data?.items ?? items;

  function toggleSelect(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  return (
    <QepPageShell
      title="Enterprise Test Suites"
      description="Create, organise, version, approve, and govern enterprise test suites."
      breadcrumbs={["QEP", "Suites"]}
      actions={
        <Link
          href={QEP_SUITE_ROUTES.new}
          className="inline-flex h-8 items-center rounded-md bg-[var(--color-primary)] px-3 text-sm font-medium text-[var(--color-primary-foreground)]"
        >
          New suite
        </Link>
      }
    >
      <QepFilterBar>
        <label className="flex flex-col gap-1 text-xs">
          Search
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, tag, description…"
            aria-label="Search suites"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Status
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            aria-label="Filter by status"
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
          Sort
          <select
            className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as QepSuiteListParams["sortBy"])}
            aria-label="Sort suites"
          >
            <option value="updatedAt">Updated</option>
            <option value="createdAt">Created</option>
            <option value="name">Name</option>
            <option value="priority">Priority</option>
          </select>
        </label>
        <div className="flex flex-col gap-1 text-xs">
          View
          <div className="flex gap-1" role="group" aria-label="View mode">
            {(["list", "tree", "card"] as const).map((mode) => (
              <Button
                key={mode}
                type="button"
                size="sm"
                variant={viewMode === mode ? "default" : "outline"}
                onClick={() => setViewMode(mode)}
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>
      </QepFilterBar>

      {selected.length > 0 ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          {selected.length} selected — bulk lifecycle actions follow the same patterns
          as detail actions in later waves.
        </p>
      ) : null}

      {listQuery.isLoading ? (
        <QepLoadingState label="Loading suites…" />
      ) : listQuery.isError ? (
        <QepErrorState
          message={
            listQuery.error instanceof Error
              ? listQuery.error.message
              : "Failed to load suites"
          }
          onRetry={() => void listQuery.refetch()}
        />
      ) : viewMode === "list" ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 text-xs">
            {items.map((suite) => (
              <label
                key={`sel-${suite.suiteId}`}
                className="inline-flex items-center gap-1"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(suite.suiteId)}
                  onChange={() => toggleSelect(suite.suiteId)}
                  aria-label={`Select ${suite.name}`}
                />
              </label>
            ))}
          </div>
          <SuiteListView items={items} />
        </div>
      ) : viewMode === "card" ? (
        <SuiteCardView items={items} />
      ) : treeQuery.isLoading ? (
        <QepLoadingState label="Loading suite tree…" />
      ) : (
        <SuiteTreeView items={treeItems} />
      )}
    </QepPageShell>
  );
}

function SuiteNewView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<CreateQepSuiteInput["kind"]>("standard");
  const [priority, setPriority] = useState<CreateQepSuiteInput["priority"]>("normal");
  const [tags, setTags] = useState("");
  const [folderPath, setFolderPath] = useState("/");
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (input: CreateQepSuiteInput) => createSuite(input),
    onSuccess: async (suite) => {
      await queryClient.invalidateQueries({ queryKey: qepQueryKeys.suites.all() });
      router.push(QEP_SUITE_ROUTES.detail(suite.suiteId));
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Create failed");
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    mutation.mutate({
      name,
      description,
      kind,
      priority,
      folderPath,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  }

  return (
    <QepPageShell
      title="Create suite"
      description="Define a new enterprise test suite. Cases and runs are out of scope for this capability."
      breadcrumbs={["QEP", "Suites", "New"]}
      actions={
        <Link
          href={QEP_SUITE_ROUTES.home}
          className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
        >
          Cancel
        </Link>
      }
    >
      <form
        onSubmit={onSubmit}
        className="mx-auto flex max-w-xl flex-col gap-4"
        data-testid="qep-suite-create-form"
      >
        <label className="flex flex-col gap-1 text-sm">
          Name
          <Input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={200}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Description
          <textarea
            className="min-h-24 rounded-md border border-[var(--color-border)] bg-transparent px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={4000}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            Kind
            <select
              className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2"
              value={kind}
              onChange={(e) => setKind(e.target.value as CreateQepSuiteInput["kind"])}
            >
              <option value="standard">Standard</option>
              <option value="shared">Shared</option>
              <option value="reusable">Reusable</option>
              <option value="template">Template</option>
              <option value="reference">Reference</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Priority
            <select
              className="h-9 rounded-md border border-[var(--color-border)] bg-transparent px-2"
              value={priority}
              onChange={(e) =>
                setPriority(e.target.value as CreateQepSuiteInput["priority"])
              }
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          Folder path
          <Input value={folderPath} onChange={(e) => setFolderPath(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Tags (comma-separated)
          <Input value={tags} onChange={(e) => setTags(e.target.value)} />
        </label>
        {error ? (
          <p className="text-sm text-[var(--color-destructive)]" role="alert">
            {error}
          </p>
        ) : null}
        <div className="flex gap-2">
          <Button type="submit" disabled={mutation.isPending || !name.trim()}>
            {mutation.isPending ? "Creating…" : "Create suite"}
          </Button>
        </div>
      </form>
    </QepPageShell>
  );
}

function SuiteDetailView({ suiteId }: { readonly suiteId: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const detailQuery = useQuery({
    queryKey: qepQueryKeys.suites.detail(suiteId),
    queryFn: ({ signal }) => getSuite(suiteId, { signal }),
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: qepQueryKeys.suites.all() });
  };

  const lifecycleMutation = useMutation({
    mutationFn: (status: SuiteLifecycleState) => transitionSuite(suiteId, status),
    onSuccess: invalidate,
  });

  const cloneMutation = useMutation({
    mutationFn: () => cloneSuite(suiteId),
    onSuccess: async (suite) => {
      await invalidate();
      router.push(QEP_SUITE_ROUTES.detail(suite.suiteId));
    },
  });

  const versionMutation = useMutation({
    mutationFn: () => versionSuite(suiteId),
    onSuccess: invalidate,
  });

  if (detailQuery.isLoading) {
    return <QepLoadingState label="Loading suite…" />;
  }
  if (detailQuery.isError || !detailQuery.data) {
    return (
      <QepErrorState
        message={
          detailQuery.error instanceof Error
            ? detailQuery.error.message
            : "Suite not found"
        }
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  const { suite, history } = detailQuery.data;
  const actions = LIFECYCLE_ACTIONS[suite.status] ?? [];

  return (
    <QepPageShell
      title={suite.name}
      description={suite.description || "Enterprise test suite"}
      breadcrumbs={["QEP", "Suites", suite.name]}
      actions={
        <>
          <Link
            href={QEP_SUITE_ROUTES.home}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
          >
            Back
          </Link>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => cloneMutation.mutate()}
            disabled={cloneMutation.isPending}
          >
            Clone
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => versionMutation.mutate()}
            disabled={versionMutation.isPending}
          >
            Version
          </Button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <QepPanel title="Details">
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Status</dt>
                <dd>
                  <QepStatusBadge status={suite.status} />
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Version</dt>
                <dd>v{suite.version}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Kind</dt>
                <dd>{suite.kind}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Priority</dt>
                <dd>{suite.priority}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Owner</dt>
                <dd>{suite.ownerId}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Folder</dt>
                <dd>{suite.folderPath}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Created</dt>
                <dd>{formatDate(suite.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Updated</dt>
                <dd>{formatDate(suite.updatedAt)}</dd>
              </div>
            </dl>
          </QepPanel>

          <QepPanel title="Lifecycle actions">
            <div className="flex flex-wrap gap-2">
              {actions.length === 0 ? (
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  No transitions available.
                </p>
              ) : (
                actions.map((action) => (
                  <Button
                    key={action.status}
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={lifecycleMutation.isPending}
                    onClick={() => {
                      if (
                        action.status === "deleted" &&
                        !window.confirm("Logically delete this suite?")
                      ) {
                        return;
                      }
                      lifecycleMutation.mutate(action.status);
                    }}
                  >
                    {action.label}
                  </Button>
                ))
              )}
            </div>
            {lifecycleMutation.isError ? (
              <p className="mt-2 text-sm text-[var(--color-destructive)]">
                {lifecycleMutation.error instanceof Error
                  ? lifecycleMutation.error.message
                  : "Lifecycle action failed"}
              </p>
            ) : null}
          </QepPanel>

          <QepPanel title="Activity timeline">
            {history.length === 0 ? (
              <p className="text-sm text-[var(--color-muted-foreground)]">
                No history yet.
              </p>
            ) : (
              <ol className="space-y-2 text-sm">
                {[...history].reverse().map((entry, index) => (
                  <li
                    key={`${entry.at}-${entry.action}-${index}`}
                    className="border-l-2 border-[var(--color-border)] pl-3"
                  >
                    <div className="font-medium capitalize">
                      {entry.action.replace(/_/g, " ")}
                      {entry.fromStatus && entry.toStatus
                        ? ` (${entry.fromStatus} → ${entry.toStatus})`
                        : null}
                    </div>
                    <div className="text-xs text-[var(--color-muted-foreground)]">
                      {formatDate(entry.at)} · {entry.actorId}
                      {entry.detail ? ` · ${entry.detail}` : ""}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </QepPanel>
        </div>

        <div className="flex flex-col gap-4">
          <QepPanel title="Metadata">
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Tags</dt>
                <dd>{suite.tags.length ? suite.tags.join(", ") : "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Category</dt>
                <dd>{suite.category ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Risk</dt>
                <dd>{suite.risk ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Business area</dt>
                <dd>{suite.businessArea ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Application</dt>
                <dd>{suite.application ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Component</dt>
                <dd>{suite.component ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Classification</dt>
                <dd>{suite.classification ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Published</dt>
                <dd>{formatDate(suite.publishedAt)}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Archived</dt>
                <dd>{formatDate(suite.archivedAt)}</dd>
              </div>
            </dl>
          </QepPanel>

          <QepPanel title="Version history">
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Current version <strong>v{suite.version}</strong>. Use Version to bump;
              full lineage store is available for Runs/Execution consumers.
            </p>
          </QepPanel>
        </div>
      </div>
    </QepPageShell>
  );
}

/**
 * Suite Workspace router view — reference UX for APZQEP capabilities A–F.
 */
export function QepSuitesRouterView({ pathname }: { readonly pathname: string }) {
  if (isQepSuitesNewRoute(pathname)) {
    return <SuiteNewView />;
  }
  const suiteId = parseQepSuiteRouteId(pathname);
  if (suiteId) {
    return <SuiteDetailView suiteId={suiteId} />;
  }
  return <SuiteHomeView />;
}
