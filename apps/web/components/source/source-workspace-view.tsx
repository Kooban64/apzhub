"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import {
  parseSourceChangeId,
  parseSourceRepositoryId,
  SOURCE_ROUTES,
} from "@/lib/source/routes";
import { QEP_PR_QUALITY_ROUTES, QEP_SCM_ROUTES } from "@/lib/qep/routes";

type RepositoryRow = {
  repositoryId: string;
  fullName: string;
  providerId: string;
  state: string;
  defaultBranch: string;
  health?: { ok: boolean; detail?: string };
};

type ChangeRow = {
  changeEventId: string;
  kind: string;
  title?: string;
  summary: string;
  branch?: string;
  occurredAt: string;
  repositoryId?: string;
};

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const body = (await response.json()) as {
    data?: T;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  return body.data as T;
}

/**
 * Phase-1 Shared Source Workspace — provider-neutral browse of registered
 * repositories and change events. Reuses platform SCM APIs; QEP/PEN overlay
 * deeper quality/security flows from their workbenches.
 */
export function SourceWorkspaceView() {
  const pathname = usePathname() ?? "";
  const repositoryId = parseSourceRepositoryId(pathname);
  const changeEventId = parseSourceChangeId(pathname);

  if (changeEventId) {
    return <ChangeBrowseView changeEventId={changeEventId} />;
  }
  if (repositoryId) {
    return <RepositoryBrowseView repositoryId={repositoryId} />;
  }
  return <SourceHomeView />;
}

function Shell({
  title,
  description,
  children,
}: {
  readonly title: string;
  readonly description: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col gap-4 p-4" data-testid="source-workspace">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-[var(--color-foreground)]">
            {title}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--color-muted-foreground)]">
            {description}
          </p>
        </div>
        <nav className="flex flex-wrap gap-3 text-sm">
          <Link
            href={SOURCE_ROUTES.home}
            className="text-[var(--color-primary)] underline-offset-2 hover:underline"
          >
            Repositories
          </Link>
          <Link
            href={QEP_PR_QUALITY_ROUTES.home}
            className="text-[var(--color-muted-foreground)] underline-offset-2 hover:underline"
          >
            PR Quality
          </Link>
          <Link
            href={QEP_SCM_ROUTES.home}
            className="text-[var(--color-muted-foreground)] underline-offset-2 hover:underline"
          >
            Quality overlays
          </Link>
          <Link
            href="/apzpen/code"
            className="text-[var(--color-muted-foreground)] underline-offset-2 hover:underline"
          >
            Security overlays
          </Link>
        </nav>
      </header>
      {children}
    </div>
  );
}

function SourceHomeView() {
  const repositoriesQuery = useQuery({
    queryKey: ["source-workspace", "repositories"],
    queryFn: () =>
      fetchJson<{ repositories: RepositoryRow[] }>("/api/v1/qep/scm/repositories"),
  });
  const changesQuery = useQuery({
    queryKey: ["source-workspace", "changes"],
    queryFn: () =>
      fetchJson<{ changes: ChangeRow[] }>("/api/v1/qep/scm/changes?limit=30"),
  });

  const repositories = repositoriesQuery.data?.repositories ?? [];
  const changes = changesQuery.data?.changes ?? [];

  return (
    <Shell
      title="Source"
      description="Browse APZ repositories and recent changes. Providers stay behind the adapter — this is the shared platform surface for Quality and Security overlays."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <section
          className="rounded-lg border border-[var(--color-border)] p-4"
          data-testid="source-repositories-panel"
        >
          <h2 className="mb-3 text-sm font-semibold">Repositories</h2>
          {repositoriesQuery.isLoading ? (
            <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
          ) : null}
          {repositoriesQuery.isError ? (
            <p className="text-xs text-[var(--color-destructive)]" role="alert">
              {(repositoriesQuery.error as Error).message}
            </p>
          ) : null}
          {repositories.length === 0 && !repositoriesQuery.isLoading ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No repositories registered yet. Register via Quality source administration
              when entitled.
            </p>
          ) : (
            <ul className="divide-y divide-[var(--color-border)] text-sm">
              {repositories.map((repo) => (
                <li
                  key={repo.repositoryId}
                  className="flex items-center justify-between gap-2 py-2"
                >
                  <div>
                    <Link
                      href={SOURCE_ROUTES.repository(repo.repositoryId)}
                      className="font-medium hover:underline"
                    >
                      {repo.fullName}
                    </Link>
                    <p className="text-[11px] text-[var(--color-muted-foreground)]">
                      {repo.defaultBranch} · {repo.state}
                      {repo.health?.ok === false
                        ? ` · ${repo.health.detail ?? "unhealthy"}`
                        : ""}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--color-muted-foreground)]">
                    {repo.providerId}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          className="rounded-lg border border-[var(--color-border)] p-4"
          data-testid="source-changes-panel"
        >
          <h2 className="mb-3 text-sm font-semibold">Recent changes</h2>
          {changesQuery.isLoading ? (
            <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
          ) : null}
          {changes.length === 0 && !changesQuery.isLoading ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No change events yet.
            </p>
          ) : (
            <ul className="max-h-[28rem] space-y-2 overflow-auto text-sm">
              {changes.map((change) => (
                <li
                  key={change.changeEventId}
                  className="rounded border border-[var(--color-border)] px-3 py-2"
                >
                  <Link
                    href={SOURCE_ROUTES.change(change.changeEventId)}
                    className="font-medium hover:underline"
                  >
                    {change.title ?? change.summary}
                  </Link>
                  <p className="text-[11px] text-[var(--color-muted-foreground)]">
                    {change.kind}
                    {change.branch ? ` · ${change.branch}` : ""} · {change.occurredAt}
                  </p>
                  <div className="mt-1 flex gap-3 text-[11px]">
                    <Link
                      href={QEP_PR_QUALITY_ROUTES.byChange(change.changeEventId)}
                      className="underline"
                    >
                      PR Quality
                    </Link>
                    <Link href="/apzpen/code" className="underline">
                      Security
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Shell>
  );
}

function RepositoryBrowseView({ repositoryId }: { readonly repositoryId: string }) {
  const detailQuery = useQuery({
    queryKey: ["source-workspace", "repository", repositoryId],
    queryFn: () =>
      fetchJson<{
        repository: RepositoryRow;
        changes: ChangeRow[];
      }>(`/api/v1/qep/scm/repositories/${encodeURIComponent(repositoryId)}`),
  });

  const repository = detailQuery.data?.repository;
  const changes = detailQuery.data?.changes ?? [];

  return (
    <Shell
      title={repository?.fullName ?? "Repository"}
      description="Repository browse — change history for this APZ repository. File explorer and editor arrive in later Source phases."
    >
      {detailQuery.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : null}
      {detailQuery.isError ? (
        <p className="text-sm text-[var(--color-destructive)]" role="alert">
          {(detailQuery.error as Error).message}
        </p>
      ) : null}
      {repository ? (
        <dl className="grid gap-2 rounded-lg border border-[var(--color-border)] p-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Branch</dt>
            <dd>{repository.defaultBranch}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">State</dt>
            <dd>{repository.state}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-muted-foreground)]">Adapter</dt>
            <dd className="font-mono text-xs">{repository.providerId}</dd>
          </div>
        </dl>
      ) : null}
      <section className="rounded-lg border border-[var(--color-border)] p-4">
        <h2 className="mb-3 text-sm font-semibold">Changes</h2>
        {changes.length === 0 ? (
          <p className="text-sm text-[var(--color-muted-foreground)]">
            No changes for this repository.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {changes.map((change) => (
              <li
                key={change.changeEventId}
                className="border-t border-[var(--color-border)] pt-2 first:border-0 first:pt-0"
              >
                <Link
                  href={SOURCE_ROUTES.change(change.changeEventId)}
                  className="font-medium hover:underline"
                >
                  {change.title ?? change.summary}
                </Link>
                <p className="text-[11px] text-[var(--color-muted-foreground)]">
                  {change.kind} · {change.occurredAt}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Shell>
  );
}

function ChangeBrowseView({ changeEventId }: { readonly changeEventId: string }) {
  const changesQuery = useQuery({
    queryKey: ["source-workspace", "change", changeEventId],
    queryFn: async () => {
      const data = await fetchJson<{ changes: ChangeRow[] }>(
        "/api/v1/qep/scm/changes?limit=200",
      );
      const change = data.changes.find((c) => c.changeEventId === changeEventId);
      if (!change) throw new Error("Change not found");
      return change;
    },
  });

  const change = changesQuery.data;

  return (
    <Shell
      title={change?.title ?? change?.summary ?? "Change"}
      description="Shared Source change detail — open Quality or Security overlays without leaving the APZ surface."
    >
      {changesQuery.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : null}
      {changesQuery.isError ? (
        <p className="text-sm text-[var(--color-destructive)]" role="alert">
          {(changesQuery.error as Error).message}
        </p>
      ) : null}
      {change ? (
        <div
          className="grid gap-4 lg:grid-cols-[1fr_280px]"
          data-testid="source-change-detail"
        >
          <section className="rounded-lg border border-[var(--color-border)] p-4 text-sm">
            <dl className="grid gap-2 sm:grid-cols-2">
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Kind</dt>
                <dd>{change.kind}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Branch</dt>
                <dd>{change.branch ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Occurred</dt>
                <dd>{change.occurredAt}</dd>
              </div>
              <div>
                <dt className="text-[var(--color-muted-foreground)]">Change id</dt>
                <dd className="font-mono text-xs">{change.changeEventId}</dd>
              </div>
            </dl>
            <p className="mt-4 whitespace-pre-wrap">{change.summary}</p>
          </section>
          <aside className="rounded-lg border border-[var(--color-border)] p-4 text-sm">
            <h2 className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
              Product overlays
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href={QEP_PR_QUALITY_ROUTES.byChange(changeEventId)}
                  className="underline"
                  data-testid="source-open-pr-quality"
                >
                  PR Quality View
                </Link>
              </li>
              <li>
                <Link href="/apzpen/code" className="underline">
                  Security code overlay
                </Link>
              </li>
              {change.repositoryId ? (
                <li>
                  <Link
                    href={SOURCE_ROUTES.repository(change.repositoryId)}
                    className="underline"
                  >
                    Repository
                  </Link>
                </li>
              ) : null}
            </ul>
          </aside>
        </div>
      ) : null}
    </Shell>
  );
}
