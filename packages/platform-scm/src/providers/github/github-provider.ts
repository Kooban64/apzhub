import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import type { ScmProvider, ScmProviderContext } from "../../contracts/provider";
import type {
  ScmBranchRef,
  ScmCommitRef,
  ScmProviderDescriptor,
  ScmPullRequestRef,
  ScmRepositoryRef,
} from "../../contracts/repository";
import type {
  ScmCommitFilesInput,
  ScmCreateBranchInput,
  ScmCreatePullRequestInput,
  ScmFileContent,
  ScmFileDiff,
  ScmTreeEntry,
} from "../../contracts/content";
import type {
  ScmWebhookDelivery,
  ScmWebhookRegistration,
} from "../../contracts/webhook";
import { OfflineSourceWorkspace } from "../offline-workspace";

export interface GitHubProviderOptions {
  /**
   * When true (default), provider operates without calling api.github.com —
   * suitable for CI and Wave 2 foundation demos. Set false + PAT for live API.
   */
  readonly forceOffline?: boolean;
  readonly apiBaseUrl?: string;
}

const DESCRIPTOR: ScmProviderDescriptor = {
  providerId: "github",
  name: "GitHub Provider",
  version: "0.1.0",
  status: "active",
  capabilities: [
    "authentication-pat",
    "repository-discovery",
    "branch-discovery",
    "commit-ingestion",
    "pull-request-ingestion",
    "webhook-receiver",
    "webhook-verification",
    "provider-health",
    "connection-testing",
    "offline-mode",
    "source-tree",
    "source-file-content",
    "source-diff",
    "source-write",
    "source-branch-create",
    "source-commit",
    "source-pull-request-create",
  ],
};

function header(
  headers: Readonly<Record<string, string | undefined>>,
  name: string,
): string | undefined {
  const direct = headers[name] ?? headers[name.toLowerCase()];
  if (direct) return direct;
  const found = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === name.toLowerCase(),
  );
  return found?.[1];
}

/**
 * GitHub execution provider for the Enterprise SCM Platform.
 * The SCM Engine never imports this module — only registry/bootstrap does.
 */
export class GitHubScmProvider implements ScmProvider {
  readonly descriptor = DESCRIPTOR;
  private readonly forceOffline: boolean;
  private readonly apiBaseUrl: string;
  private readonly offlineRepos = new Map<string, ScmRepositoryRef>();
  private readonly offlineWorkspace = new OfflineSourceWorkspace();

  constructor(options: GitHubProviderOptions = {}) {
    this.forceOffline = options.forceOffline ?? true;
    this.apiBaseUrl = options.apiBaseUrl ?? "https://api.github.com";
    // Seed a demo repository for offline registration/sync.
    this.offlineRepos.set("apzor/apzhub", {
      providerId: "github",
      externalId: "offline-apzor-apzhub",
      fullName: "apzor/apzhub",
      defaultBranch: "main",
      htmlUrl: "https://github.com/apzor/apzhub",
      visibility: "private",
      cloneUrl: "https://github.com/apzor/apzhub.git",
    });
  }

  async connect(context: ScmProviderContext) {
    if (this.forceOffline) {
      return { ok: true, detail: "github offline mode — connection simulated" };
    }
    if (!context.credentials?.token && !context.credentials?.secretRef) {
      return { ok: false, detail: "PAT or secretRef required for live GitHub" };
    }
    const health = await this.health(context);
    return health;
  }

  async health(context: ScmProviderContext) {
    if (this.forceOffline) {
      return { ok: true, detail: "github offline mode healthy" };
    }
    try {
      const response = await this.gh(context, "/user");
      return response.ok
        ? { ok: true, detail: "github api reachable" }
        : { ok: false, detail: `github api status ${response.status}` };
    } catch (error) {
      return {
        ok: false,
        detail: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async listRepositories(context: ScmProviderContext) {
    if (this.forceOffline) {
      return [...this.offlineRepos.values()];
    }
    const response = await this.gh(context, "/user/repos?per_page=50");
    if (!response.ok) {
      throw new Error(`GitHub list repositories failed (${response.status})`);
    }
    const body = (await response.json()) as Array<Record<string, unknown>>;
    return body.map((item) => this.mapRepo(item));
  }

  async getRepository(context: ScmProviderContext, fullName: string) {
    if (this.forceOffline) {
      return (
        this.offlineRepos.get(fullName) ?? {
          providerId: "github" as const,
          externalId: `offline-${fullName.replace("/", "-")}`,
          fullName,
          defaultBranch: "main",
          htmlUrl: `https://github.com/${fullName}`,
          visibility: "private" as const,
        }
      );
    }
    const response = await this.gh(context, `/repos/${fullName}`);
    if (response.status === 404) return undefined;
    if (!response.ok) {
      throw new Error(`GitHub get repository failed (${response.status})`);
    }
    return this.mapRepo((await response.json()) as Record<string, unknown>);
  }

  async listBranches(context: ScmProviderContext, fullName: string) {
    if (this.forceOffline) {
      return this.offlineWorkspace.listBranches(fullName);
    }
    const response = await this.gh(context, `/repos/${fullName}/branches?per_page=50`);
    if (!response.ok) {
      throw new Error(`GitHub list branches failed (${response.status})`);
    }
    const body = (await response.json()) as Array<Record<string, unknown>>;
    return body.map((item) => ({
      name: String(item.name),
      sha: String((item.commit as { sha?: string } | undefined)?.sha ?? ""),
      protected: Boolean(item.protected),
    }));
  }

  async listCommits(
    context: ScmProviderContext,
    fullName: string,
    options?: { readonly branch?: string; readonly limit?: number },
  ) {
    if (this.forceOffline) {
      return this.offlineWorkspace.listCommits(fullName, options);
    }
    const query = new URLSearchParams();
    if (options?.branch) query.set("sha", options.branch);
    query.set("per_page", String(options?.limit ?? 20));
    const response = await this.gh(
      context,
      `/repos/${fullName}/commits?${query.toString()}`,
    );
    if (!response.ok) {
      throw new Error(`GitHub list commits failed (${response.status})`);
    }
    const body = (await response.json()) as Array<Record<string, unknown>>;
    return body.map((item) => {
      const commit = item.commit as Record<string, unknown>;
      const author = commit.author as Record<string, unknown> | undefined;
      return {
        sha: String(item.sha),
        message: String(commit.message ?? ""),
        authorName: author ? String(author.name ?? "") : undefined,
        authorEmail: author ? String(author.email ?? "") : undefined,
        committedAt: author ? String(author.date ?? "") : undefined,
        branch: options?.branch,
        htmlUrl: item.html_url ? String(item.html_url) : undefined,
      } satisfies ScmCommitRef;
    });
  }

  async listPullRequests(
    context: ScmProviderContext,
    fullName: string,
    options?: { readonly state?: "open" | "closed" | "all"; readonly limit?: number },
  ) {
    if (this.forceOffline) {
      const offline = this.offlineWorkspace.listPullRequests(fullName);
      if (offline.length > 0) return offline;
      return [
        {
          externalId: "offline-pr-1",
          number: 1,
          title: "Offline demo pull request",
          state: "open",
          sourceBranch: "feature/demo",
          targetBranch: "main",
          authorLogin: "apzor-bot",
          htmlUrl: `https://github.com/${fullName}/pull/1`,
          updatedAt: new Date().toISOString(),
        },
      ] satisfies ScmPullRequestRef[];
    }
    const query = new URLSearchParams({
      state: options?.state ?? "open",
      per_page: String(options?.limit ?? 20),
    });
    const response = await this.gh(
      context,
      `/repos/${fullName}/pulls?${query.toString()}`,
    );
    if (!response.ok) {
      throw new Error(`GitHub list pull requests failed (${response.status})`);
    }
    const body = (await response.json()) as Array<Record<string, unknown>>;
    return body.map((item) => ({
      externalId: String(item.id),
      number: Number(item.number),
      title: String(item.title ?? ""),
      state: item.merged_at
        ? ("merged" as const)
        : item.draft
          ? ("draft" as const)
          : item.state === "closed"
            ? ("closed" as const)
            : ("open" as const),
      sourceBranch: String((item.head as { ref?: string } | undefined)?.ref ?? ""),
      targetBranch: String((item.base as { ref?: string } | undefined)?.ref ?? ""),
      authorLogin: String((item.user as { login?: string } | undefined)?.login ?? ""),
      htmlUrl: item.html_url ? String(item.html_url) : undefined,
      updatedAt: item.updated_at ? String(item.updated_at) : undefined,
    }));
  }

  async listTree(
    _context: ScmProviderContext,
    fullName: string,
    options?: { readonly branch?: string; readonly path?: string },
  ): Promise<readonly ScmTreeEntry[]> {
    if (this.forceOffline) {
      return this.offlineWorkspace.listTree(fullName, options);
    }
    // Live Contents API — list directory
    const branch = options?.branch ?? "main";
    const path = options?.path ? `/${options.path}` : "";
    const response = await this.gh(
      _context,
      `/repos/${fullName}/contents${path}?ref=${encodeURIComponent(branch)}`,
    );
    if (!response.ok) {
      throw new Error(`GitHub list tree failed (${response.status})`);
    }
    const body = (await response.json()) as
      Array<Record<string, unknown>> | Record<string, unknown>;
    const items = Array.isArray(body) ? body : [body];
    return items.map((item) => ({
      path: String(item.path ?? ""),
      name: String(item.name ?? ""),
      type: item.type === "dir" ? ("dir" as const) : ("file" as const),
      sha: item.sha ? String(item.sha) : undefined,
      size: typeof item.size === "number" ? item.size : undefined,
    }));
  }

  async getFileContent(
    context: ScmProviderContext,
    fullName: string,
    options: { readonly path: string; readonly branch?: string },
  ): Promise<ScmFileContent | undefined> {
    if (this.forceOffline) {
      return this.offlineWorkspace.getFileContent(fullName, options);
    }
    const branch = options.branch ?? "main";
    const response = await this.gh(
      context,
      `/repos/${fullName}/contents/${options.path}?ref=${encodeURIComponent(branch)}`,
    );
    if (response.status === 404) return undefined;
    if (!response.ok) {
      throw new Error(`GitHub get file failed (${response.status})`);
    }
    const body = (await response.json()) as Record<string, unknown>;
    if (body.type !== "file") {
      throw new Error("Path is not a file");
    }
    const encoding = String(body.encoding ?? "base64");
    const raw = String(body.content ?? "").replace(/\n/g, "");
    const content =
      encoding === "base64" ? Buffer.from(raw, "base64").toString("utf-8") : raw;
    return {
      path: options.path,
      branch,
      content,
      encoding: "utf-8",
      sha: body.sha ? String(body.sha) : undefined,
      truncated: content.length > 512_000,
    };
  }

  async getFileDiff(
    _context: ScmProviderContext,
    fullName: string,
    options: {
      readonly path: string;
      readonly baseRef: string;
      readonly headRef: string;
    },
  ): Promise<ScmFileDiff | undefined> {
    if (this.forceOffline) {
      return this.offlineWorkspace.getFileDiff(fullName, options);
    }
    // Live: compare commits and extract file patch when present.
    const response = await this.gh(
      _context,
      `/repos/${fullName}/compare/${encodeURIComponent(options.baseRef)}...${encodeURIComponent(options.headRef)}`,
    );
    if (!response.ok) {
      throw new Error(`GitHub compare failed (${response.status})`);
    }
    const body = (await response.json()) as {
      files?: Array<Record<string, unknown>>;
    };
    const file = (body.files ?? []).find((f) => String(f.filename) === options.path);
    if (!file) return undefined;
    const statusRaw = String(file.status ?? "modified");
    const status =
      statusRaw === "added" ||
      statusRaw === "removed" ||
      statusRaw === "renamed" ||
      statusRaw === "modified"
        ? statusRaw
        : ("modified" as const);
    return {
      path: options.path,
      baseRef: options.baseRef,
      headRef: options.headRef,
      patch: String(file.patch ?? ""),
      status,
    };
  }

  async createBranch(
    context: ScmProviderContext,
    fullName: string,
    input: ScmCreateBranchInput,
  ): Promise<ScmBranchRef> {
    if (this.forceOffline) {
      return this.offlineWorkspace.createBranch(fullName, input);
    }
    const refResponse = await this.gh(
      context,
      `/repos/${fullName}/git/ref/heads/${encodeURIComponent(input.fromRef)}`,
    );
    if (!refResponse.ok) {
      throw new Error(`GitHub resolve ref failed (${refResponse.status})`);
    }
    const refBody = (await refResponse.json()) as {
      object?: { sha?: string };
    };
    const sha = refBody.object?.sha;
    if (!sha) throw new Error("Missing base ref sha");
    const create = await this.gh(context, `/repos/${fullName}/git/refs`, {
      method: "POST",
      body: JSON.stringify({
        ref: `refs/heads/${input.name}`,
        sha,
      }),
    });
    if (!create.ok) {
      throw new Error(`GitHub create branch failed (${create.status})`);
    }
    return { name: input.name, sha, protected: false };
  }

  async commitFiles(
    context: ScmProviderContext,
    fullName: string,
    input: ScmCommitFilesInput,
  ): Promise<ScmCommitRef> {
    if (this.forceOffline) {
      return this.offlineWorkspace.commitFiles(fullName, input);
    }
    // Live Contents API upsert (single-file loop) — adequate for Phase E MVP.
    let lastSha = "";
    for (const file of input.files) {
      if (file.operation === "delete") {
        const existing = await this.getFileContent(context, fullName, {
          path: file.path,
          branch: input.branch,
        });
        if (!existing?.sha) continue;
        const del = await this.gh(context, `/repos/${fullName}/contents/${file.path}`, {
          method: "DELETE",
          body: JSON.stringify({
            message: input.message,
            sha: existing.sha,
            branch: input.branch,
          }),
        });
        if (!del.ok) {
          throw new Error(`GitHub delete file failed (${del.status})`);
        }
        continue;
      }
      const existing = await this.getFileContent(context, fullName, {
        path: file.path,
        branch: input.branch,
      });
      const put = await this.gh(context, `/repos/${fullName}/contents/${file.path}`, {
        method: "PUT",
        body: JSON.stringify({
          message: input.message,
          content: Buffer.from(file.content, "utf-8").toString("base64"),
          branch: input.branch,
          sha: existing?.sha,
        }),
      });
      if (!put.ok) {
        throw new Error(`GitHub commit file failed (${put.status})`);
      }
      const body = (await put.json()) as { commit?: { sha?: string } };
      lastSha = body.commit?.sha ?? lastSha;
    }
    return {
      sha: lastSha || `live-${randomUUID().slice(0, 10)}`,
      message: input.message,
      branch: input.branch,
      committedAt: new Date().toISOString(),
    };
  }

  async createPullRequest(
    context: ScmProviderContext,
    fullName: string,
    input: ScmCreatePullRequestInput,
  ): Promise<ScmPullRequestRef> {
    if (this.forceOffline) {
      return this.offlineWorkspace.createPullRequest(fullName, input);
    }
    const response = await this.gh(context, `/repos/${fullName}/pulls`, {
      method: "POST",
      body: JSON.stringify({
        title: input.title,
        body: input.body ?? "",
        head: input.sourceBranch,
        base: input.targetBranch,
      }),
    });
    if (!response.ok) {
      throw new Error(`GitHub create pull request failed (${response.status})`);
    }
    const item = (await response.json()) as Record<string, unknown>;
    return {
      externalId: String(item.id),
      number: Number(item.number),
      title: String(item.title ?? input.title),
      state: "open",
      sourceBranch: input.sourceBranch,
      targetBranch: input.targetBranch,
      authorLogin: String((item.user as { login?: string } | undefined)?.login ?? ""),
      htmlUrl: item.html_url ? String(item.html_url) : undefined,
      updatedAt: item.updated_at ? String(item.updated_at) : new Date().toISOString(),
    };
  }

  async registerWebhook(
    _context: ScmProviderContext,
    fullName: string,
    registration: ScmWebhookRegistration,
  ) {
    if (this.forceOffline) {
      return {
        ok: true,
        externalWebhookId: `offline-hook-${fullName}`,
        detail: `offline webhook registered → ${registration.callbackUrl}`,
      };
    }
    // Live webhook registration intentionally deferred — Wave 2 documents PAT + manual/ops path.
    return {
      ok: false,
      detail:
        "Live GitHub webhook registration requires ops-configured GitHub App/PAT flow",
    };
  }

  verifyWebhook(
    headers: Readonly<Record<string, string | undefined>>,
    rawBody: string,
    secret: string,
  ) {
    const signature = header(headers, "x-hub-signature-256");
    if (!signature) {
      return { ok: false, reason: "missing x-hub-signature-256" };
    }
    const expected = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
    const left = Buffer.from(signature);
    const right = Buffer.from(expected);
    if (left.length !== right.length || !timingSafeEqual(left, right)) {
      return { ok: false, reason: "invalid webhook signature" };
    }
    return { ok: true };
  }

  normalizeWebhook(
    headers: Readonly<Record<string, string | undefined>>,
    payload: unknown,
  ): ScmWebhookDelivery | undefined {
    const eventName = header(headers, "x-github-event") ?? "other";
    const deliveryId = header(headers, "x-github-delivery") ?? randomUUID();
    const body = (payload ?? {}) as Record<string, unknown>;
    const repository = body.repository as { full_name?: string } | undefined;
    const fullName = repository?.full_name;

    let eventKind: ScmWebhookDelivery["eventKind"] = "other";
    if (eventName === "push") eventKind = "push";
    else if (eventName === "pull_request") eventKind = "pull_request";
    else if (eventName === "create") eventKind = "create";
    else if (eventName === "delete") eventKind = "delete";
    else if (eventName === "release") eventKind = "release";
    else if (eventName === "ping") eventKind = "ping";
    else if (eventName === "workflow_run") eventKind = "workflow_run";
    else if (eventName === "check_suite") eventKind = "check_suite";

    const workflowRun = body.workflow_run as
      | {
          name?: string;
          conclusion?: string;
          status?: string;
          id?: number;
          html_url?: string;
        }
      | undefined;
    const checkSuite = body.check_suite as
      | { conclusion?: string; status?: string; id?: number; app?: { name?: string } }
      | undefined;

    const summary =
      eventKind === "push"
        ? `push ${String(body.ref ?? "")} ${String((body.head_commit as { id?: string } | undefined)?.id ?? "").slice(0, 7)}`
        : eventKind === "pull_request"
          ? `pull_request ${String(body.action ?? "")} #${String((body.pull_request as { number?: number } | undefined)?.number ?? "")}`
          : eventKind === "workflow_run"
            ? `workflow_run ${String(workflowRun?.name ?? "")} ${String(workflowRun?.conclusion ?? workflowRun?.status ?? "")}`
            : eventKind === "check_suite"
              ? `check_suite ${String(checkSuite?.app?.name ?? "checks")} ${String(checkSuite?.conclusion ?? checkSuite?.status ?? "")}`
              : `${eventName}`;

    return {
      deliveryId,
      providerId: "github",
      eventKind,
      externalEventName: eventName,
      repositoryFullName: fullName,
      receivedAt: new Date().toISOString(),
      signatureValid: true,
      idempotencyKey: `${deliveryId}:${eventName}`,
      payload: body,
      summary,
    };
  }

  private mapRepo(item: Record<string, unknown>): ScmRepositoryRef {
    return {
      providerId: "github",
      externalId: String(item.id),
      fullName: String(item.full_name),
      defaultBranch: item.default_branch ? String(item.default_branch) : "main",
      htmlUrl: item.html_url ? String(item.html_url) : undefined,
      visibility: item.private ? "private" : "public",
      cloneUrl: item.clone_url ? String(item.clone_url) : undefined,
    };
  }

  private async gh(
    context: ScmProviderContext,
    path: string,
    init?: { readonly method?: string; readonly body?: string },
  ): Promise<Response> {
    const token = context.credentials?.token;
    if (!token) {
      throw new Error("GitHub PAT required for live mode");
    }
    return fetch(`${this.apiBaseUrl}${path}`, {
      method: init?.method,
      body: init?.body,
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "user-agent": "apzhub-platform-scm",
        ...(init?.body ? { "content-type": "application/json" } : {}),
      },
      signal: context.signal,
    });
  }
}

export function createGitHubProvider(options?: GitHubProviderOptions): ScmProvider {
  return new GitHubScmProvider(options);
}
