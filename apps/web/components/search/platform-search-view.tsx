"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

import {
  acknowledgeSearchPublicationDeadLetter,
  archiveSearchPublicationDeadLetter,
  clearSearchPublicationCompletedRetries,
  drainSearchPublicationBatch,
  getSearchPublicationAdminDiagnostics,
  getSearchPublicationQueueSummary,
  listSearchPublicationProducts,
  listSearchPublications,
  retrySearchPublication,
  retrySearchPublicationDeadLetter,
  retrySearchPublicationFailedBatch,
} from "@/lib/search/publication-admin-api";
import {
  executeSearchQuery,
  getSearchDiagnostics,
  getSearchHealth,
  getSearchReadiness,
  getSearchStatistics,
  listSearchAudit,
  listSearchCollections,
  listSearchConfigurations,
  listSearchProfiles,
  listSearchProviders,
  listSearchScopes,
  listSearchSources,
  validateSearchQuery,
} from "@/lib/search/search-api";
import { toSearchUserMessage } from "@/lib/search/search-errors";
import type { SearchSection } from "@/lib/search/routes";

function PageShell({
  title,
  description,
  actions,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 p-1" data-testid="search-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Search
          </p>
          <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </header>
      {children}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  readonly title: string;
  readonly description?: string;
}) {
  return (
    <div
      className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-10 text-center"
      data-testid="search-empty"
    >
      <p className="font-medium text-[var(--color-foreground)]">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  readonly message: string;
  readonly onRetry?: () => void;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-6"
      data-testid="search-error"
      role="alert"
    >
      <p className="font-medium text-[var(--color-foreground)]">
        Unable to load search
      </p>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{message}</p>
      {onRetry ? (
        <div className="mt-3">
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function SearchTable({
  columns,
  rows,
  caption,
}: {
  readonly columns: readonly string[];
  readonly rows: readonly {
    readonly id: string;
    readonly cells: readonly ReactNode[];
  }[];
  readonly caption?: string;
}) {
  return (
    <div
      className="overflow-x-auto rounded-lg border border-[var(--color-border)]"
      data-testid="search-table"
    >
      <table className="min-w-full text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/20">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-3 py-2 font-medium text-[var(--color-foreground)]"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-[var(--color-border)]"
              data-testid={`search-row-${row.id}`}
            >
              {row.cells.map((cell, index) => (
                <td
                  key={`${row.id}-${index}`}
                  className="px-3 py-2 text-[var(--color-foreground)]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OverviewSection() {
  const health = useQuery({
    queryKey: ["search", "health"],
    queryFn: () => getSearchHealth(),
  });
  const readiness = useQuery({
    queryKey: ["search", "readiness"],
    queryFn: () => getSearchReadiness(),
  });
  const stats = useQuery({
    queryKey: ["search", "statistics"],
    queryFn: () => getSearchStatistics(),
  });

  if (health.isError || readiness.isError || stats.isError) {
    return (
      <PageShell title="Overview" description="Platform Search status">
        <ErrorState
          message={toSearchUserMessage(health.error ?? readiness.error ?? stats.error)}
          onRetry={() => {
            void health.refetch();
            void readiness.refetch();
            void stats.refetch();
          }}
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Overview"
      description="Execution health, readiness, and declared inventory"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
            Health
          </p>
          <p className="mt-1 text-lg font-medium" data-testid="search-health-status">
            {health.data?.status ?? "…"}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
            Ready
          </p>
          <p className="mt-1 text-lg font-medium">
            {readiness.data ? (readiness.data.healthy ? "Healthy" : "Not ready") : "…"}
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] p-4">
          <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
            Providers
          </p>
          <p className="mt-1 text-lg font-medium">
            {stats.data?.declaredProviderCount ?? "…"}
          </p>
        </div>
      </div>
    </PageShell>
  );
}

function QuerySection() {
  const [keywords, setKeywords] = useState("policy");
  const [submitted, setSubmitted] = useState("policy");

  const query = useQuery({
    queryKey: ["search", "query", submitted],
    queryFn: () =>
      executeSearchQuery({
        query: {
          keywords: submitted,
          includeHighlights: true,
          includeSuggestions: true,
        },
      }),
  });

  const validation = useQuery({
    queryKey: ["search", "validate", submitted],
    queryFn: () => validateSearchQuery({ keywords: submitted }),
  });

  return (
    <PageShell
      title="Query"
      description="Canonical keyword search via Platform Search HTTP"
      actions={
        <Button
          type="button"
          size="sm"
          onClick={() => setSubmitted(keywords.trim() || "policy")}
        >
          Search
        </Button>
      }
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[16rem] flex-1 flex-col gap-1 text-sm">
          <span className="text-[var(--color-muted-foreground)]">Keywords</span>
          <Input
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            aria-label="Search keywords"
            data-testid="search-keywords"
          />
        </label>
      </div>
      {query.isError ? (
        <ErrorState
          message={toSearchUserMessage(query.error)}
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess && query.data.hits.length === 0 ? (
        <EmptyState
          title="No results"
          description="Try a different keyword or product filter."
        />
      ) : null}
      {query.isSuccess && query.data.hits.length > 0 ? (
        <SearchTable
          caption="Search hits"
          columns={["Title", "Product", "Type", "Highlights"]}
          rows={query.data.hits.map((hit) => ({
            id: hit.id,
            cells: [
              hit.title,
              hit.productId,
              hit.entityType,
              hit.highlightSnippets.join(" · ") || "—",
            ],
          }))}
        />
      ) : null}
      {validation.data ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Query validation: {validation.data.valid ? "valid" : "invalid"}
        </p>
      ) : null}
    </PageShell>
  );
}

function ProvidersSection() {
  const providers = useQuery({
    queryKey: ["search", "providers"],
    queryFn: () => listSearchProviders(),
  });
  if (providers.isError) {
    return (
      <PageShell title="Providers">
        <ErrorState
          message={toSearchUserMessage(providers.error)}
          onRetry={() => void providers.refetch()}
        />
      </PageShell>
    );
  }
  const items = providers.data?.items ?? [];
  return (
    <PageShell title="Providers" description="Registered search providers">
      {items.length === 0 ? (
        <EmptyState title="No providers" />
      ) : (
        <SearchTable
          caption="Providers"
          columns={["Label", "Kind", "Enabled", "Active"]}
          rows={items.map((item) => ({
            id: item.id,
            cells: [
              item.label,
              item.kind,
              item.enabled ? "Yes" : "No",
              item.active ? "Yes" : "No",
            ],
          }))}
        />
      )}
    </PageShell>
  );
}

function ConfigurationsSection() {
  const configs = useQuery({
    queryKey: ["search", "configurations"],
    queryFn: () => listSearchConfigurations(),
  });
  if (configs.isError) {
    return (
      <PageShell title="Configurations">
        <ErrorState message={toSearchUserMessage(configs.error)} />
      </PageShell>
    );
  }
  const items = configs.data?.items ?? [];
  return (
    <PageShell title="Configurations">
      {items.length === 0 ? (
        <EmptyState title="No configurations" />
      ) : (
        <SearchTable
          columns={["Label", "Status", "Page size", "Version"]}
          rows={items.map((item) => ({
            id: item.id,
            cells: [
              item.label ?? item.id,
              item.status,
              String(item.defaultPageSize),
              String(item.currentVersion),
            ],
          }))}
        />
      )}
    </PageShell>
  );
}

function CollectionsSection() {
  const collections = useQuery({
    queryKey: ["search", "collections"],
    queryFn: () => listSearchCollections(),
  });
  const items = collections.data?.items ?? [];
  return (
    <PageShell title="Collections">
      {collections.isError ? (
        <ErrorState message={toSearchUserMessage(collections.error)} />
      ) : items.length === 0 ? (
        <EmptyState title="No collections" />
      ) : (
        <SearchTable
          columns={["Name", "Scope", "Enabled"]}
          rows={items.map((item) => ({
            id: item.id,
            cells: [item.name, item.scope, item.enabled ? "Yes" : "No"],
          }))}
        />
      )}
    </PageShell>
  );
}

function SourcesSection() {
  const sources = useQuery({
    queryKey: ["search", "sources"],
    queryFn: () => listSearchSources(),
  });
  const items = sources.data?.items ?? [];
  return (
    <PageShell title="Sources">
      {sources.isError ? (
        <ErrorState message={toSearchUserMessage(sources.error)} />
      ) : items.length === 0 ? (
        <EmptyState title="No sources" />
      ) : (
        <SearchTable
          columns={["Label", "Product", "Enabled"]}
          rows={items.map((item) => ({
            id: item.id,
            cells: [item.label, item.productId, item.enabled ? "Yes" : "No"],
          }))}
        />
      )}
    </PageShell>
  );
}

function ScopesSection() {
  const scopes = useQuery({
    queryKey: ["search", "scopes"],
    queryFn: () => listSearchScopes(),
  });
  const items = scopes.data?.items ?? [];
  return (
    <PageShell title="Scopes">
      {scopes.isError ? (
        <ErrorState message={toSearchUserMessage(scopes.error)} />
      ) : items.length === 0 ? (
        <EmptyState title="No scopes" />
      ) : (
        <SearchTable
          columns={["Label", "Scope", "Enabled"]}
          rows={items.map((item) => ({
            id: item.id,
            cells: [item.label, item.scope, item.enabled ? "Yes" : "No"],
          }))}
        />
      )}
    </PageShell>
  );
}

function ProfilesSection() {
  const profiles = useQuery({
    queryKey: ["search", "profiles"],
    queryFn: () => listSearchProfiles(),
  });
  const items = profiles.data?.items ?? [];
  return (
    <PageShell title="Profiles">
      {profiles.isError ? (
        <ErrorState message={toSearchUserMessage(profiles.error)} />
      ) : items.length === 0 ? (
        <EmptyState title="No profiles" />
      ) : (
        <SearchTable
          columns={["Name", "Id"]}
          rows={items.map((item) => ({
            id: item.id,
            cells: [item.name, item.id],
          }))}
        />
      )}
    </PageShell>
  );
}

function AuditSection() {
  const audit = useQuery({
    queryKey: ["search", "audit"],
    queryFn: () => listSearchAudit(),
  });
  const items = audit.data?.items ?? [];
  return (
    <PageShell title="Audit">
      {audit.isError ? (
        <ErrorState message={toSearchUserMessage(audit.error)} />
      ) : items.length === 0 ? (
        <EmptyState title="No audit events" />
      ) : (
        <SearchTable
          columns={["Action", "Actor", "Created"]}
          rows={items.map((item) => ({
            id: item.id,
            cells: [item.action, item.actorUserId, item.createdAt],
          }))}
        />
      )}
    </PageShell>
  );
}

function DiagnosticsSection() {
  const diagnostics = useQuery({
    queryKey: ["search", "diagnostics"],
    queryFn: () => getSearchDiagnostics(),
  });
  return (
    <PageShell title="Diagnostics" description="Safe execution-plane diagnostics">
      {diagnostics.isError ? (
        <ErrorState message={toSearchUserMessage(diagnostics.error)} />
      ) : diagnostics.data ? (
        <div className="space-y-2 text-sm" data-testid="search-diagnostics">
          <p>Status: {diagnostics.data.health.status}</p>
          <p>
            Keywords: {diagnostics.data.capabilities.keywords ? "yes" : "no"} ·
            Semantic: {diagnostics.data.capabilities.semantic ? "yes" : "no"}
          </p>
          <p>
            Providers: {diagnostics.data.statistics.declaredProviderCount} ·
            Collections: {diagnostics.data.statistics.declaredCollectionCount}
          </p>
        </div>
      ) : (
        <p className="text-sm text-[var(--color-muted-foreground)]">Loading…</p>
      )}
    </PageShell>
  );
}

function PublicationOperationsSection() {
  const [statusFilter, setStatusFilter] = useState("queued");
  const queue = useQuery({
    queryKey: ["search", "publication", "queue"],
    queryFn: () => getSearchPublicationQueueSummary(),
  });
  const products = useQuery({
    queryKey: ["search", "publication", "products"],
    queryFn: () => listSearchPublicationProducts(),
  });
  const diagnostics = useQuery({
    queryKey: ["search", "publication", "diagnostics"],
    queryFn: () => getSearchPublicationAdminDiagnostics(),
  });
  const journal = useQuery({
    queryKey: ["search", "publication", "journal", statusFilter],
    queryFn: () =>
      listSearchPublications({
        status: statusFilter || undefined,
        limit: 50,
      }),
  });

  async function refreshAll() {
    await Promise.all([
      queue.refetch(),
      products.refetch(),
      diagnostics.refetch(),
      journal.refetch(),
    ]);
  }

  return (
    <PageShell
      title="Publication Operations"
      description="Operational visibility over the publication journal — metadata only"
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void retrySearchPublicationFailedBatch(25).then(refreshAll)}
          >
            Retry failed batch
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              void clearSearchPublicationCompletedRetries().then(refreshAll)
            }
          >
            Clear completed retries
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void drainSearchPublicationBatch().then(refreshAll)}
          >
            Drain batch
          </Button>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-3" data-testid="search-publication-ops">
        <div className="rounded-lg border border-[var(--color-border)] p-4 text-sm">
          <p className="font-medium">Queue</p>
          {queue.data ? (
            <ul className="mt-2 space-y-1 text-[var(--color-muted-foreground)]">
              <li>Depth: {queue.data.queueDepth}</li>
              <li>Retrying: {queue.data.retryingCount}</li>
              <li>Failed: {queue.data.failedCount}</li>
              <li>Dead-letter: {queue.data.deadLetterCount}</li>
              <li>Backlog: {queue.data.backlog}</li>
              <li>Throughput: {queue.data.throughputPublished}</li>
              <li>Oldest: {queue.data.oldestQueuedAt ?? "—"}</li>
            </ul>
          ) : (
            <p className="mt-2 text-[var(--color-muted-foreground)]">Loading…</p>
          )}
        </div>
        <div className="rounded-lg border border-[var(--color-border)] p-4 text-sm">
          <p className="font-medium">Diagnostics</p>
          {diagnostics.data ? (
            <ul className="mt-2 space-y-1 text-[var(--color-muted-foreground)]">
              <li>Health: {diagnostics.data.publicationHealth}</li>
              <li>Bootstrap: {diagnostics.data.bootstrapEnabled ? "on" : "off"}</li>
              <li>
                Journal: {diagnostics.data.journalReady ? "ready" : "unavailable"}
              </li>
              <li>
                Composition:{" "}
                {diagnostics.data.compositionRegistered ? "registered" : "missing"}
              </li>
              <li>Admin: {diagnostics.data.adminVersion}</li>
            </ul>
          ) : (
            <p className="mt-2 text-[var(--color-muted-foreground)]">Loading…</p>
          )}
        </div>
        <div className="rounded-lg border border-[var(--color-border)] p-4 text-sm">
          <p className="font-medium">By product</p>
          {products.data ? (
            <ul className="mt-2 space-y-1 text-[var(--color-muted-foreground)]">
              {products.data.map((p) => (
                <li key={p.productId}>
                  {p.productId}: {p.total} (q {p.queued} / f {p.failed} / dlq{" "}
                  {p.deadLetter})
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[var(--color-muted-foreground)]">Loading…</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-[var(--color-muted-foreground)]">
            Status filter
          </span>
          <Input
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            placeholder="queued"
            className="w-48"
          />
        </label>
      </div>

      {journal.isError ? (
        <ErrorState
          message={toSearchUserMessage(journal.error)}
          onRetry={() => void journal.refetch()}
        />
      ) : (journal.data?.items.length ?? 0) === 0 ? (
        <EmptyState
          title="No publications"
          description="No journal rows match the current filter."
        />
      ) : (
        <SearchTable
          caption="Publication journal"
          columns={["Id", "Product", "Entity", "Status", "Attempts", "Actions"]}
          rows={(journal.data?.items ?? []).map((item) => ({
            id: item.id,
            cells: [
              item.id,
              item.productId,
              `${item.entityType}:${item.entityId}`,
              item.status,
              `${item.attemptCount}/${item.maxAttempts}`,
              <div key={`${item.id}-actions`} className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void retrySearchPublication(item.id).then(refreshAll)}
                >
                  Retry
                </Button>
                {item.status === "dead-letter" ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void retrySearchPublicationDeadLetter(item.id).then(refreshAll)
                      }
                    >
                      Re-enqueue
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void acknowledgeSearchPublicationDeadLetter(
                          item.id,
                          "ack",
                        ).then(refreshAll)
                      }
                    >
                      Ack
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void archiveSearchPublicationDeadLetter(
                          item.id,
                          "archive",
                        ).then(refreshAll)
                      }
                    >
                      Archive
                    </Button>
                  </>
                ) : null}
              </div>,
            ],
          }))}
        />
      )}
    </PageShell>
  );
}

export function PlatformSearchView({ section }: { readonly section: SearchSection }) {
  switch (section) {
    case "query":
      return <QuerySection />;
    case "providers":
      return <ProvidersSection />;
    case "configurations":
      return <ConfigurationsSection />;
    case "collections":
      return <CollectionsSection />;
    case "sources":
      return <SourcesSection />;
    case "scopes":
      return <ScopesSection />;
    case "profiles":
      return <ProfilesSection />;
    case "audit":
      return <AuditSection />;
    case "diagnostics":
      return <DiagnosticsSection />;
    case "publication":
      return <PublicationOperationsSection />;
    case "overview":
    default:
      return <OverviewSection />;
  }
}
