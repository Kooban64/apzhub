"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import {
  parseSourceChangeId,
  parseSourceRepositoryId,
  parseSourceRepositoryMode,
  SOURCE_ROUTES,
} from "@/lib/source/routes";
import { buildSourceFileTree, flattenSourceFileTree } from "@/lib/source/file-tree";
import { SourceLineEditor } from "@/components/source/source-line-editor";
import { SourceReviewView } from "@/components/source/source-review-view";
import { SourceAdminView } from "@/components/source/source-admin-view";
import {
  closeTab,
  cycleTabPath,
  isTabDirty,
  markTabClean,
  moveTreeFocus,
  openOrFocusTab,
  tabBasename,
  updateTabDraft,
  type SourceEditorTab,
} from "@/lib/source/editor-tabs";
import {
  QEP_DOMAINS_ROUTES,
  QEP_PR_QUALITY_ROUTES,
  QEP_QUALITY_GRAPH_ROUTES,
  QEP_SCM_ROUTES,
} from "@/lib/qep/routes";

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
  filesChanged?: string[];
};

type TreeEntry = {
  path: string;
  name: string;
  type: "file" | "dir";
};

type BranchRow = { name: string; sha?: string; protected?: boolean };
type CommitRow = { sha: string; message: string; committedAt?: string };

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
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
 * Shared Source Workspace — Phase E browse + permission-gated write.
 * Provider-neutral; QEP/PEN overlays remain product-owned.
 */
export function SourceWorkspaceView() {
  const pathname = usePathname() ?? "";
  const repositoryId = parseSourceRepositoryId(pathname);
  const changeEventId = parseSourceChangeId(pathname);
  const mode = parseSourceRepositoryMode(pathname);

  if (changeEventId) {
    return <ChangeBrowseView changeEventId={changeEventId} />;
  }
  if (repositoryId && mode === "review") {
    return <RepositoryModeShell repositoryId={repositoryId} mode="review" />;
  }
  if (repositoryId && mode === "admin") {
    return <RepositoryModeShell repositoryId={repositoryId} mode="admin" />;
  }
  if (repositoryId) {
    return <RepositoryWorkspaceView repositoryId={repositoryId} />;
  }
  return <SourceHomeView />;
}

function RepositoryModeShell({
  repositoryId,
  mode,
}: {
  readonly repositoryId: string;
  readonly mode: "review" | "admin";
}) {
  const capabilitiesQuery = useQuery({
    queryKey: ["source-workspace", "capabilities"],
    queryFn: () =>
      fetchJson<{ canRead: boolean; canWrite: boolean }>("/api/v1/source/capabilities"),
  });
  const canWrite = capabilitiesQuery.data?.canWrite === true;
  return (
    <Shell
      title={mode === "review" ? "Source · Review" : "Source · Admin"}
      description={
        mode === "review"
          ? "Review and merge change requests for this APZ repository."
          : "Repository registration, sync, and health."
      }
      actions={
        <nav className="flex flex-wrap gap-3 text-sm">
          <Link href={SOURCE_ROUTES.repository(repositoryId)} className="underline">
            Files
          </Link>
          <Link
            href={SOURCE_ROUTES.repositoryReview(repositoryId)}
            className="underline"
          >
            Review
          </Link>
          <Link
            href={SOURCE_ROUTES.repositoryAdmin(repositoryId)}
            className="underline"
          >
            Admin
          </Link>
        </nav>
      }
    >
      {mode === "review" ? (
        <SourceReviewView repositoryId={repositoryId} canWrite={canWrite} />
      ) : (
        <SourceAdminView repositoryId={repositoryId} canWrite={canWrite} />
      )}
    </Shell>
  );
}

function Shell({
  title,
  description,
  children,
  actions,
}: {
  readonly title: string;
  readonly description: string;
  readonly children: React.ReactNode;
  readonly actions?: React.ReactNode;
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
        <div className="flex flex-wrap items-center gap-3">
          {actions}
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
        </div>
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
      description="Browse and edit APZ repositories. Providers stay behind adapters — shared platform surface for Quality and Security overlays."
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
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </Shell>
  );
}

function RepositoryWorkspaceView({ repositoryId }: { readonly repositoryId: string }) {
  const queryClient = useQueryClient();
  const [branch, setBranch] = useState("main");
  const [tabs, setTabs] = useState<readonly SourceEditorTab[]>([]);
  const [activePath, setActivePath] = useState<string | null>(null);
  const [treeFocus, setTreeFocus] = useState(0);
  const [commitMessage, setCommitMessage] = useState("");
  const [newBranchName, setNewBranchName] = useState("");
  const [prTitle, setPrTitle] = useState("");
  const [prTarget, setPrTarget] = useState("main");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedDirs, setExpandedDirs] = useState<ReadonlySet<string>>(
    () => new Set<string>(),
  );

  const detailQuery = useQuery({
    queryKey: ["source-workspace", "repository", repositoryId],
    queryFn: () =>
      fetchJson<{
        repository: RepositoryRow;
        changes: ChangeRow[];
      }>(`/api/v1/qep/scm/repositories/${encodeURIComponent(repositoryId)}`),
  });

  const capabilitiesQuery = useQuery({
    queryKey: ["source-workspace", "capabilities"],
    queryFn: () =>
      fetchJson<{ canRead: boolean; canWrite: boolean }>("/api/v1/source/capabilities"),
  });

  const branchesQuery = useQuery({
    queryKey: ["source-workspace", "branches", repositoryId],
    queryFn: () =>
      fetchJson<{ branches: BranchRow[] }>(
        `/api/v1/source/repositories/${encodeURIComponent(repositoryId)}/branches`,
      ),
  });

  const treeQuery = useQuery({
    queryKey: ["source-workspace", "tree", repositoryId, branch],
    queryFn: () =>
      fetchJson<{ entries: TreeEntry[] }>(
        `/api/v1/source/repositories/${encodeURIComponent(repositoryId)}/tree?branch=${encodeURIComponent(branch)}`,
      ),
  });

  const commitsQuery = useQuery({
    queryKey: ["source-workspace", "commits", repositoryId, branch],
    queryFn: () =>
      fetchJson<{ commits: CommitRow[] }>(
        `/api/v1/source/repositories/${encodeURIComponent(repositoryId)}/commits?branch=${encodeURIComponent(branch)}&limit=12`,
      ),
  });

  const searchQueryDebounced = searchQuery.trim();
  const searchQueryEnabled = searchQueryDebounced.length >= 2;
  const searchResultsQuery = useQuery({
    queryKey: [
      "source-workspace",
      "search",
      repositoryId,
      branch,
      searchQueryDebounced,
    ],
    enabled: searchQueryEnabled,
    queryFn: () =>
      fetchJson<{ hits: Array<{ path: string; line?: number; preview: string }> }>(
        `/api/v1/source/repositories/${encodeURIComponent(repositoryId)}/search?q=${encodeURIComponent(searchQueryDebounced)}&branch=${encodeURIComponent(branch)}`,
      ),
  });

  const activeTab = tabs.find((tab) => tab.path === activePath) ?? null;

  const diffQuery = useQuery({
    queryKey: ["source-workspace", "diff", repositoryId, activePath, branch, prTarget],
    enabled: showDiff && Boolean(activePath),
    queryFn: () =>
      fetchJson<{
        diff: { patch: string; status: string } | null;
      }>(
        `/api/v1/source/repositories/${encodeURIComponent(repositoryId)}/diff?path=${encodeURIComponent(activePath!)}&baseRef=${encodeURIComponent(prTarget)}&headRef=${encodeURIComponent(branch)}`,
      ),
  });

  useEffect(() => {
    const defaultBranch = detailQuery.data?.repository.defaultBranch;
    if (defaultBranch) setBranch(defaultBranch);
  }, [detailQuery.data?.repository.defaultBranch]);

  const openFile = async (path: string) => {
    const existing = tabs.find((tab) => tab.path === path);
    if (existing) {
      setActivePath(path);
      return;
    }
    try {
      const data = await fetchJson<{
        file: { path: string; content: string };
      }>(
        `/api/v1/source/repositories/${encodeURIComponent(repositoryId)}/file?path=${encodeURIComponent(path)}&branch=${encodeURIComponent(branch)}`,
      );
      const opened = openOrFocusTab(tabs, path, data.file.content);
      setTabs(opened.tabs);
      setActivePath(opened.activePath);
    } catch (error) {
      setStatusMessage((error as Error).message);
    }
  };

  const dirty = activeTab ? isTabDirty(activeTab) : false;
  const canWrite = capabilitiesQuery.data?.canWrite === true;
  const repository = detailQuery.data?.repository;
  const entries = treeQuery.data?.entries ?? [];
  const fileEntries = entries.filter((entry) => entry.type === "file");
  const nestedTree = buildSourceFileTree(fileEntries.map((entry) => entry.path));
  const branches = branchesQuery.data?.branches ?? [];
  const commits = commitsQuery.data?.commits ?? [];
  const searchHits = searchResultsQuery.data?.hits ?? [];

  useEffect(() => {
    const dirs = new Set<string>();
    const walk = (nodes: typeof nestedTree) => {
      for (const node of nodes) {
        if (node.children.length > 0) {
          dirs.add(node.path);
          walk(node.children);
        }
      }
    };
    walk(nestedTree);
    setExpandedDirs(dirs);
  }, [treeQuery.dataUpdatedAt]);

  const invalidateSource = async () => {
    await queryClient.invalidateQueries({ queryKey: ["source-workspace"] });
  };

  const commitMutation = useMutation({
    mutationFn: async () => {
      if (!activeTab) throw new Error("No file open");
      if (!commitMessage.trim()) throw new Error("Commit message required");
      return fetchJson<{ commit: { sha: string; message: string } }>(
        `/api/v1/source/repositories/${encodeURIComponent(repositoryId)}/commit`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            branch,
            message: commitMessage.trim(),
            files: [
              {
                path: activeTab.path,
                content: activeTab.draft,
                operation: "upsert",
              },
            ],
          }),
        },
      );
    },
    onSuccess: async (data) => {
      if (activeTab) {
        setTabs(markTabClean(tabs, activeTab.path, activeTab.draft));
      }
      setCommitMessage("");
      setStatusMessage(`Committed ${data.commit.sha.slice(0, 10)}`);
      await invalidateSource();
    },
    onError: (error) => setStatusMessage((error as Error).message),
  });

  const branchMutation = useMutation({
    mutationFn: async () => {
      if (!newBranchName.trim()) throw new Error("Branch name required");
      return fetchJson<{ branch: BranchRow }>(
        `/api/v1/source/repositories/${encodeURIComponent(repositoryId)}/branches`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            name: newBranchName.trim(),
            fromRef: branch,
          }),
        },
      );
    },
    onSuccess: async (data) => {
      setBranch(data.branch.name);
      setTabs([]);
      setActivePath(null);
      setNewBranchName("");
      setStatusMessage(`Created branch ${data.branch.name}`);
      await invalidateSource();
    },
    onError: (error) => setStatusMessage((error as Error).message),
  });

  const prMutation = useMutation({
    mutationFn: async () => {
      if (!prTitle.trim()) throw new Error("Pull request title required");
      return fetchJson<{ pullRequest: { number: number; title: string } }>(
        `/api/v1/source/repositories/${encodeURIComponent(repositoryId)}/pull-requests`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            title: prTitle.trim(),
            sourceBranch: branch,
            targetBranch: prTarget,
          }),
        },
      );
    },
    onSuccess: async (data) => {
      setPrTitle("");
      setStatusMessage(`Opened change request #${data.pullRequest.number}`);
      await invalidateSource();
    },
    onError: (error) => setStatusMessage((error as Error).message),
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const typing =
        tag === "textarea" ||
        tag === "input" ||
        tag === "select" ||
        Boolean(target?.isContentEditable);

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "w") {
        if (!activePath) return;
        event.preventDefault();
        const closed = closeTab(tabs, activePath, activePath);
        setTabs(closed.tabs);
        setActivePath(closed.activePath);
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key === "Tab") {
        event.preventDefault();
        const next = cycleTabPath(tabs, activePath, event.shiftKey ? -1 : 1);
        if (next) setActivePath(next);
        return;
      }

      if (typing) return;

      if (event.key === "j" || event.key === "ArrowDown") {
        event.preventDefault();
        setTreeFocus((current) => moveTreeFocus(fileEntries.length, current, 1));
        return;
      }
      if (event.key === "k" || event.key === "ArrowUp") {
        event.preventDefault();
        setTreeFocus((current) => moveTreeFocus(fileEntries.length, current, -1));
        return;
      }
      if (event.key === "Enter") {
        const focused = fileEntries[treeFocus];
        if (focused) {
          event.preventDefault();
          void openFile(focused.path);
        }
        return;
      }
      if (event.key === "d" && activePath) {
        event.preventDefault();
        setShowDiff((value) => !value);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activePath, tabs, fileEntries, treeFocus]);

  return (
    <Shell
      title={repository?.fullName ?? "Repository"}
      description="Shared Source workspace — tabs, keyboard tree (j/k · Enter), commit, and change requests. Write requires source.write."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px]"
            data-testid="source-write-gate"
          >
            {canWrite ? "Write enabled" : "Read only"}
          </span>
          <nav className="flex flex-wrap gap-3 text-sm">
            <Link href={SOURCE_ROUTES.repository(repositoryId)} className="underline">
              Files
            </Link>
            <Link
              href={SOURCE_ROUTES.repositoryReview(repositoryId)}
              className="underline"
            >
              Review
            </Link>
            <Link
              href={SOURCE_ROUTES.repositoryAdmin(repositoryId)}
              className="underline"
            >
              Admin
            </Link>
          </nav>
        </div>
      }
    >
      {detailQuery.isError ? (
        <p className="text-sm text-[var(--color-destructive)]" role="alert">
          {(detailQuery.error as Error).message}
        </p>
      ) : null}

      <p
        className="text-[11px] text-[var(--color-muted-foreground)]"
        data-testid="source-keyboard-hints"
      >
        Keyboard: j/k tree · Enter open · Ctrl+Tab cycle tabs · Ctrl+W close · d toggle
        diff
      </p>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-[var(--color-muted-foreground)]">Branch</span>
          <select
            className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1"
            value={branch}
            onChange={(event) => {
              setBranch(event.target.value);
              setTabs([]);
              setActivePath(null);
            }}
            data-testid="source-branch-select"
          >
            {branches.map((row) => (
              <option key={row.name} value={row.name}>
                {row.name}
              </option>
            ))}
            {branches.length === 0 ? <option value={branch}>{branch}</option> : null}
          </select>
        </label>
        {canWrite ? (
          <>
            <input
              className="min-w-[10rem] rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs"
              placeholder="New branch name"
              value={newBranchName}
              onChange={(event) => setNewBranchName(event.target.value)}
              data-testid="source-new-branch-input"
            />
            <button
              type="button"
              className="rounded border border-[var(--color-border)] px-2 py-1 text-xs hover:bg-[var(--color-muted)]"
              onClick={() => branchMutation.mutate()}
              disabled={branchMutation.isPending}
              data-testid="source-create-branch"
            >
              Create branch
            </button>
          </>
        ) : null}
        {statusMessage ? (
          <span className="text-xs text-[var(--color-muted-foreground)]">
            {statusMessage}
          </span>
        ) : null}
      </div>

      <div
        className="grid min-h-[28rem] gap-3 lg:grid-cols-[minmax(200px,0.85fr)_minmax(0,1.7fr)_minmax(200px,0.85fr)]"
        data-testid="source-repo-workspace"
      >
        <section
          className="rounded-lg border border-[var(--color-border)] p-3"
          aria-label="Repository tree"
          data-testid="source-tree-pane"
        >
          <h2 className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
            Files
          </h2>
          <input
            className="mb-2 w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs"
            placeholder="Search paths & contents…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            data-testid="source-search-input"
          />
          {searchQueryEnabled ? (
            <ul
              className="mb-3 max-h-32 space-y-1 overflow-auto border-b border-[var(--color-border)] pb-2 font-mono text-[11px]"
              data-testid="source-search-hits"
            >
              {searchResultsQuery.isLoading ? (
                <li className="text-[var(--color-muted-foreground)]">Searching…</li>
              ) : null}
              {searchHits.length === 0 && !searchResultsQuery.isLoading ? (
                <li className="text-[var(--color-muted-foreground)]">No hits</li>
              ) : null}
              {searchHits.map((hit, index) => (
                <li key={`${hit.path}:${hit.line ?? 0}:${index}`}>
                  <button
                    type="button"
                    className="w-full text-left hover:underline"
                    onClick={() => void openFile(hit.path)}
                  >
                    {hit.path}
                    {hit.line ? `:${hit.line}` : ""}
                    <span className="block truncate text-[var(--color-muted-foreground)]">
                      {hit.preview}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {treeQuery.isLoading ? (
            <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
          ) : null}
          {treeQuery.isError ? (
            <p className="text-xs text-[var(--color-destructive)]" role="alert">
              {(treeQuery.error as Error).message}
            </p>
          ) : null}
          <ul className="max-h-[22rem] space-y-0.5 overflow-auto font-mono text-[11px]">
            {nestedTree.map((node) => (
              <NestedTreeNode
                key={node.path}
                node={node}
                depth={0}
                expandedDirs={expandedDirs}
                activePath={activePath}
                onToggle={(dirPath) => {
                  setExpandedDirs((current) => {
                    const next = new Set(current);
                    if (next.has(dirPath)) next.delete(dirPath);
                    else next.add(dirPath);
                    return next;
                  });
                }}
                onOpen={(filePath) => {
                  const index = fileEntries.findIndex(
                    (entry) => entry.path === filePath,
                  );
                  if (index >= 0) setTreeFocus(index);
                  void openFile(filePath);
                }}
              />
            ))}
          </ul>
        </section>

        <section
          className="flex flex-col rounded-lg border border-[var(--color-border)] p-3"
          aria-label="Editor"
          data-testid="source-editor"
        >
          <div
            className="mb-2 flex flex-wrap gap-1 border-b border-[var(--color-border)] pb-2"
            data-testid="source-editor-tabs"
            role="tablist"
            aria-label="Open files"
          >
            {tabs.length === 0 ? (
              <span className="text-xs text-[var(--color-muted-foreground)]">
                No tabs open
              </span>
            ) : (
              tabs.map((tab) => {
                const selected = tab.path === activePath;
                return (
                  <div
                    key={tab.path}
                    className={`flex items-center gap-1 rounded border px-2 py-1 text-[11px] ${
                      selected
                        ? "border-[var(--color-primary)] bg-[var(--color-muted)]"
                        : "border-[var(--color-border)]"
                    }`}
                    role="tab"
                    aria-selected={selected}
                  >
                    <button
                      type="button"
                      className="font-mono hover:underline"
                      onClick={() => setActivePath(tab.path)}
                    >
                      {tabBasename(tab.path)}
                      {isTabDirty(tab) ? " •" : ""}
                    </button>
                    <button
                      type="button"
                      className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                      aria-label={`Close ${tab.path}`}
                      data-testid={`source-close-tab-${tab.path}`}
                      onClick={() => {
                        const closed = closeTab(tabs, tab.path, activePath);
                        setTabs(closed.tabs);
                        setActivePath(closed.activePath);
                      }}
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-mono text-xs text-[var(--color-muted-foreground)]">
              {activePath ?? "Open a file"}
              {dirty ? " · dirty" : ""}
            </h2>
            <button
              type="button"
              className="rounded border border-[var(--color-border)] px-2 py-1 text-[11px]"
              disabled={!activePath}
              onClick={() => setShowDiff((value) => !value)}
              data-testid="source-toggle-diff"
            >
              {showDiff ? "Hide diff" : "Diff vs target"}
            </button>
          </div>
          {showDiff ? (
            <pre className="max-h-[22rem] flex-1 overflow-auto rounded bg-[var(--color-muted)]/30 p-3 font-mono text-[11px]">
              {diffQuery.data?.diff?.patch ||
                (diffQuery.isLoading ? "Loading diff…" : "No diff")}
            </pre>
          ) : (
            <SourceLineEditor
              value={activeTab?.draft ?? ""}
              onChange={(next) => {
                if (!activePath) return;
                setTabs(updateTabDraft(tabs, activePath, next));
              }}
              readOnly={!canWrite || !activeTab}
            />
          )}
          {canWrite && activeTab ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <input
                className="min-w-[14rem] flex-1 rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs"
                placeholder="Commit message"
                value={commitMessage}
                onChange={(event) => setCommitMessage(event.target.value)}
                data-testid="source-commit-message"
              />
              <button
                type="button"
                className="rounded border border-[var(--color-border)] px-3 py-1 text-xs hover:bg-[var(--color-muted)] disabled:opacity-50"
                disabled={!dirty || commitMutation.isPending}
                onClick={() => commitMutation.mutate()}
                data-testid="source-commit"
              >
                Commit
              </button>
            </div>
          ) : null}
        </section>

        <aside className="space-y-3" data-testid="source-context-pane">
          <section className="rounded-lg border border-[var(--color-border)] p-3 text-sm">
            <h2 className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
              History
            </h2>
            <ul className="max-h-40 space-y-2 overflow-auto text-[11px]">
              {commits.map((commit) => (
                <li key={commit.sha}>
                  <span className="font-mono">{commit.sha.slice(0, 8)}</span>
                  <p className="text-[var(--color-muted-foreground)]">
                    {commit.message}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {canWrite ? (
            <section
              className="rounded-lg border border-[var(--color-border)] p-3 text-sm"
              data-testid="source-pr-panel"
            >
              <h2 className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
                Change request
              </h2>
              <div className="space-y-2">
                <input
                  className="w-full rounded border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs"
                  placeholder="Title"
                  value={prTitle}
                  onChange={(event) => setPrTitle(event.target.value)}
                  data-testid="source-pr-title"
                />
                <label className="flex items-center gap-2 text-xs">
                  Target
                  <select
                    className="rounded border border-[var(--color-border)] bg-transparent px-2 py-1"
                    value={prTarget}
                    onChange={(event) => setPrTarget(event.target.value)}
                  >
                    {branches.map((row) => (
                      <option key={row.name} value={row.name}>
                        {row.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="rounded border border-[var(--color-border)] px-3 py-1 text-xs hover:bg-[var(--color-muted)]"
                  onClick={() => prMutation.mutate()}
                  disabled={prMutation.isPending || branch === prTarget}
                  data-testid="source-create-pr"
                >
                  Open change request
                </button>
              </div>
            </section>
          ) : null}

          <section className="rounded-lg border border-[var(--color-border)] p-3 text-sm">
            <h2 className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
              Overlays
            </h2>
            <ul className="space-y-1 text-xs">
              <li>
                <Link href={QEP_PR_QUALITY_ROUTES.home} className="underline">
                  PR Quality
                </Link>
              </li>
              <li>
                <Link href={QEP_QUALITY_GRAPH_ROUTES.home} className="underline">
                  Quality Graph
                </Link>
              </li>
              <li>
                <Link href="/apzpen/code" className="underline">
                  Security overlay
                </Link>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </Shell>
  );
}

function NestedTreeNode({
  node,
  depth,
  expandedDirs,
  activePath,
  onToggle,
  onOpen,
}: {
  readonly node: ReturnType<typeof buildSourceFileTree>[number];
  readonly depth: number;
  readonly expandedDirs: ReadonlySet<string>;
  readonly activePath: string | null;
  readonly onToggle: (path: string) => void;
  readonly onOpen: (path: string) => void;
}) {
  const isDir = node.children.length > 0;
  const expanded = expandedDirs.has(node.path);
  return (
    <li style={{ paddingLeft: `${depth * 12}px` }}>
      {isDir ? (
        <button
          type="button"
          className="w-full text-left text-[var(--color-muted-foreground)] hover:underline"
          onClick={() => onToggle(node.path)}
          data-testid={`source-dir-${node.path}`}
        >
          {expanded ? "▾ " : "▸ "}
          {node.name}
        </button>
      ) : (
        <button
          type="button"
          className={`w-full rounded px-1 py-0.5 text-left hover:bg-[var(--color-muted)] ${
            activePath === node.path ? "font-semibold" : ""
          }`}
          onClick={() => onOpen(node.path)}
          data-testid={`source-file-${node.path}`}
        >
          · {node.name}
        </button>
      )}
      {isDir && expanded ? (
        <ul>
          {node.children.map((child) => (
            <NestedTreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              expandedDirs={expandedDirs}
              activePath={activePath}
              onToggle={onToggle}
              onOpen={onOpen}
            />
          ))}
        </ul>
      ) : null}
    </li>
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
  const fileRows = flattenSourceFileTree(
    buildSourceFileTree(change?.filesChanged ?? []),
  );

  return (
    <Shell
      title={change?.title ?? change?.summary ?? "Change"}
      description="Shared Source change detail — file explorer from changed paths; open the repository workspace for full tree and editor."
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
          className="grid gap-4 lg:grid-cols-[minmax(220px,0.9fr)_minmax(0,1.2fr)_minmax(200px,0.7fr)]"
          data-testid="source-change-detail"
        >
          <section
            className="rounded-lg border border-[var(--color-border)] p-4 text-sm"
            data-testid="source-file-explorer"
          >
            <h2 className="mb-2 text-xs font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
              Changed files
            </h2>
            {fileRows.length === 0 ? (
              <p className="text-xs text-[var(--color-muted-foreground)]">
                No file paths on this change event yet.
              </p>
            ) : (
              <ul className="max-h-[28rem] space-y-0.5 overflow-auto font-mono text-[11px]">
                {fileRows.map(({ node, depth }) => (
                  <li
                    key={node.path}
                    style={{ paddingLeft: `${depth * 12}px` }}
                    className={
                      node.children.length > 0
                        ? "text-[var(--color-muted-foreground)]"
                        : ""
                    }
                  >
                    {node.children.length > 0 ? "▸ " : "· "}
                    {node.name}
                  </li>
                ))}
              </ul>
            )}
          </section>
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
            </dl>
            <p className="mt-4 whitespace-pre-wrap">{change.summary}</p>
            {change.repositoryId ? (
              <Link
                href={SOURCE_ROUTES.repository(change.repositoryId)}
                className="mt-4 inline-block text-xs underline"
              >
                Open repository workspace →
              </Link>
            ) : null}
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
                >
                  PR Quality View
                </Link>
              </li>
              <li>
                <Link
                  href={QEP_QUALITY_GRAPH_ROUTES.byChange(changeEventId)}
                  className="underline"
                >
                  Quality Graph
                </Link>
              </li>
              <li>
                <Link
                  href={`${QEP_DOMAINS_ROUTES.home}?changeEventId=${encodeURIComponent(changeEventId)}`}
                  className="underline"
                >
                  Quality domains
                </Link>
              </li>
            </ul>
          </aside>
        </div>
      ) : null}
    </Shell>
  );
}
