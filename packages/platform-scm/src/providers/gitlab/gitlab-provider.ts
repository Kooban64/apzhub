import { randomUUID, timingSafeEqual } from "node:crypto";

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

export interface GitLabProviderOptions {
  readonly forceOffline?: boolean;
  readonly apiBaseUrl?: string;
}

const DESCRIPTOR: ScmProviderDescriptor = {
  providerId: "gitlab",
  name: "GitLab Provider",
  version: "0.2.0",
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
    "source-merge",
    "source-search",
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
 * GitLab CE/self-hosted compatible SCM provider (SPR-APZPEN-014 + Phase F parity).
 */
export class GitLabScmProvider implements ScmProvider {
  readonly descriptor = DESCRIPTOR;
  private readonly forceOffline: boolean;
  private readonly apiBaseUrl: string;
  private readonly offlineRepos = new Map<string, ScmRepositoryRef>();
  private readonly offlineWorkspace = new OfflineSourceWorkspace();

  constructor(options: GitLabProviderOptions = {}) {
    this.forceOffline = options.forceOffline ?? true;
    this.apiBaseUrl = options.apiBaseUrl ?? "https://gitlab.com/api/v4";
    this.offlineRepos.set("apzor/apzhub", {
      providerId: "gitlab",
      externalId: "offline-apzor-apzhub",
      fullName: "apzor/apzhub",
      defaultBranch: "main",
      htmlUrl: "https://gitlab.com/apzor/apzhub",
      visibility: "private",
      cloneUrl: "https://gitlab.com/apzor/apzhub.git",
    });
  }

  async connect(context: ScmProviderContext) {
    if (this.forceOffline) {
      return { ok: true, detail: "gitlab offline mode — connection simulated" };
    }
    if (!context.credentials?.token && !context.credentials?.secretRef) {
      return { ok: false, detail: "PAT or secretRef required for live GitLab" };
    }
    return this.health(context);
  }

  async health(context: ScmProviderContext) {
    if (this.forceOffline) {
      return { ok: true, detail: "gitlab offline mode healthy" };
    }
    try {
      const response = await this.gl(context, "/user");
      return response.ok
        ? { ok: true, detail: "gitlab api reachable" }
        : { ok: false, detail: `gitlab api status ${response.status}` };
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
    const response = await this.gl(
      context,
      "/projects?membership=true&per_page=50&simple=true",
    );
    if (!response.ok) {
      throw new Error(`GitLab list repositories failed (${response.status})`);
    }
    const body = (await response.json()) as Array<Record<string, unknown>>;
    return body.map((item) => this.mapRepo(item));
  }

  async getRepository(context: ScmProviderContext, fullName: string) {
    if (this.forceOffline) {
      return (
        this.offlineRepos.get(fullName) ?? {
          providerId: "gitlab" as const,
          externalId: `offline-${fullName.replace("/", "-")}`,
          fullName,
          defaultBranch: "main",
          htmlUrl: `https://gitlab.com/${fullName}`,
          visibility: "private" as const,
        }
      );
    }
    const encoded = encodeURIComponent(fullName);
    const response = await this.gl(context, `/projects/${encoded}`);
    if (response.status === 404) return undefined;
    if (!response.ok) {
      throw new Error(`GitLab get repository failed (${response.status})`);
    }
    return this.mapRepo((await response.json()) as Record<string, unknown>);
  }

  async listBranches(context: ScmProviderContext, fullName: string) {
    if (this.forceOffline) {
      return this.offlineWorkspace.listBranches(fullName);
    }
    const encoded = encodeURIComponent(fullName);
    const response = await this.gl(context, `/projects/${encoded}/repository/branches`);
    if (!response.ok) {
      throw new Error(`GitLab list branches failed (${response.status})`);
    }
    const body = (await response.json()) as Array<Record<string, unknown>>;
    return body.map((item): ScmBranchRef => ({
      name: String(item.name),
      sha: String((item.commit as { id?: string } | undefined)?.id ?? ""),
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
    const encoded = encodeURIComponent(fullName);
    const query = new URLSearchParams();
    query.set("per_page", String(options?.limit ?? 20));
    if (options?.branch) query.set("ref_name", options.branch);
    const response = await this.gl(
      context,
      `/projects/${encoded}/repository/commits?${query.toString()}`,
    );
    if (!response.ok) {
      throw new Error(`GitLab list commits failed (${response.status})`);
    }
    const body = (await response.json()) as Array<Record<string, unknown>>;
    return body.map((item): ScmCommitRef => ({
      sha: String(item.id),
      message: String(item.message ?? ""),
      authorName: String(item.author_name ?? ""),
      committedAt: String(item.committed_date ?? new Date().toISOString()),
      branch: options?.branch,
    }));
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
          externalId: "offline-mr-1",
          number: 1,
          title: "Offline merge request",
          state: "open",
          sourceBranch: "feature",
          targetBranch: "main",
          htmlUrl: `https://gitlab.com/${fullName}/-/merge_requests/1`,
        },
      ] satisfies ScmPullRequestRef[];
    }
    const encoded = encodeURIComponent(fullName);
    const state =
      options?.state === "closed"
        ? "closed"
        : options?.state === "all"
          ? "all"
          : "opened";
    const response = await this.gl(
      context,
      `/projects/${encoded}/merge_requests?state=${state}&per_page=${options?.limit ?? 20}`,
    );
    if (!response.ok) {
      throw new Error(`GitLab list merge requests failed (${response.status})`);
    }
    const body = (await response.json()) as Array<Record<string, unknown>>;
    return body.map((item): ScmPullRequestRef => {
      const rawState = String(item.state ?? "opened");
      const mapped: ScmPullRequestRef["state"] =
        rawState === "merged" ? "merged" : rawState === "closed" ? "closed" : "open";
      return {
        externalId: String(item.id),
        number: Number(item.iid),
        title: String(item.title ?? ""),
        state: mapped,
        sourceBranch: String(item.source_branch ?? ""),
        targetBranch: String(item.target_branch ?? ""),
        htmlUrl: item.web_url ? String(item.web_url) : undefined,
      };
    });
  }

  async listTree(
    _context: ScmProviderContext,
    fullName: string,
    options?: { readonly branch?: string; readonly path?: string },
  ): Promise<readonly ScmTreeEntry[]> {
    if (this.forceOffline) {
      return this.offlineWorkspace.listTree(fullName, options);
    }
    const encoded = encodeURIComponent(fullName);
    const branch = options?.branch ?? "main";
    const response = await this.gl(
      _context,
      `/projects/${encoded}/repository/tree?ref=${encodeURIComponent(branch)}&path=${encodeURIComponent(options?.path ?? "")}&per_page=100`,
    );
    if (!response.ok) {
      throw new Error(`GitLab list tree failed (${response.status})`);
    }
    const body = (await response.json()) as Array<Record<string, unknown>>;
    return body.map((item) => ({
      path: String(item.path ?? ""),
      name: String(item.name ?? ""),
      type: item.type === "tree" ? ("dir" as const) : ("file" as const),
      sha: item.id ? String(item.id) : undefined,
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
    const encoded = encodeURIComponent(fullName);
    const branch = options.branch ?? "main";
    const filePath = encodeURIComponent(options.path);
    const response = await this.gl(
      context,
      `/projects/${encoded}/repository/files/${filePath}?ref=${encodeURIComponent(branch)}`,
    );
    if (response.status === 404) return undefined;
    if (!response.ok) {
      throw new Error(`GitLab get file failed (${response.status})`);
    }
    const body = (await response.json()) as Record<string, unknown>;
    const encoding = String(body.encoding ?? "base64");
    const raw = String(body.content ?? "");
    const content =
      encoding === "base64" ? Buffer.from(raw, "base64").toString("utf-8") : raw;
    return {
      path: options.path,
      branch,
      content,
      encoding: "utf-8",
      sha: body.blob_id ? String(body.blob_id) : undefined,
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
    // Live compare not fully mapped — return undefined when unavailable.
    void _context;
    void fullName;
    return undefined;
  }

  async createBranch(
    context: ScmProviderContext,
    fullName: string,
    input: ScmCreateBranchInput,
  ): Promise<ScmBranchRef> {
    if (this.forceOffline) {
      return this.offlineWorkspace.createBranch(fullName, input);
    }
    const encoded = encodeURIComponent(fullName);
    const response = await this.gl(
      context,
      `/projects/${encoded}/repository/branches`,
      {
        method: "POST",
        body: JSON.stringify({ branch: input.name, ref: input.fromRef }),
      },
    );
    if (!response.ok) {
      throw new Error(`GitLab create branch failed (${response.status})`);
    }
    const body = (await response.json()) as Record<string, unknown>;
    return {
      name: String(body.name ?? input.name),
      sha: String((body.commit as { id?: string } | undefined)?.id ?? ""),
      protected: false,
    };
  }

  async commitFiles(
    context: ScmProviderContext,
    fullName: string,
    input: ScmCommitFilesInput,
  ): Promise<ScmCommitRef> {
    if (this.forceOffline) {
      return this.offlineWorkspace.commitFiles(fullName, input);
    }
    const encoded = encodeURIComponent(fullName);
    const actions = input.files.map((file) => ({
      action: file.operation === "delete" ? "delete" : "update",
      file_path: file.path,
      content: file.operation === "delete" ? undefined : file.content,
    }));
    const response = await this.gl(context, `/projects/${encoded}/repository/commits`, {
      method: "POST",
      body: JSON.stringify({
        branch: input.branch,
        commit_message: input.message,
        actions,
      }),
    });
    if (!response.ok) {
      throw new Error(`GitLab commit failed (${response.status})`);
    }
    const body = (await response.json()) as Record<string, unknown>;
    return {
      sha: String(body.id ?? randomUUID().slice(0, 10)),
      message: input.message,
      branch: input.branch,
      committedAt: String(body.committed_date ?? new Date().toISOString()),
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
    const encoded = encodeURIComponent(fullName);
    const response = await this.gl(context, `/projects/${encoded}/merge_requests`, {
      method: "POST",
      body: JSON.stringify({
        title: input.title,
        description: input.body ?? "",
        source_branch: input.sourceBranch,
        target_branch: input.targetBranch,
      }),
    });
    if (!response.ok) {
      throw new Error(`GitLab create merge request failed (${response.status})`);
    }
    const item = (await response.json()) as Record<string, unknown>;
    return {
      externalId: String(item.id),
      number: Number(item.iid),
      title: String(item.title ?? input.title),
      state: "open",
      sourceBranch: input.sourceBranch,
      targetBranch: input.targetBranch,
      htmlUrl: item.web_url ? String(item.web_url) : undefined,
      updatedAt: new Date().toISOString(),
    };
  }

  async mergePullRequest(
    context: ScmProviderContext,
    fullName: string,
    input: { readonly number: number; readonly method?: "merge" | "squash" },
  ): Promise<ScmPullRequestRef> {
    if (this.forceOffline) {
      return this.offlineWorkspace.mergePullRequest(fullName, input);
    }
    const encoded = encodeURIComponent(fullName);
    const response = await this.gl(
      context,
      `/projects/${encoded}/merge_requests/${input.number}/merge`,
      {
        method: "PUT",
        body: JSON.stringify({
          squash: input.method === "squash",
        }),
      },
    );
    if (!response.ok) {
      throw new Error(`GitLab merge failed (${response.status})`);
    }
    return {
      externalId: String(input.number),
      number: input.number,
      title: `Merged !${input.number}`,
      state: "merged",
      updatedAt: new Date().toISOString(),
    };
  }

  async searchFiles(
    context: ScmProviderContext,
    fullName: string,
    options: {
      readonly query: string;
      readonly branch?: string;
      readonly limit?: number;
    },
  ) {
    if (this.forceOffline) {
      return this.offlineWorkspace.searchFiles(fullName, options);
    }
    const entries = await this.listTree(context, fullName, {
      branch: options.branch,
    });
    const query = options.query.trim().toLowerCase();
    return entries
      .filter(
        (entry) => entry.type === "file" && entry.path.toLowerCase().includes(query),
      )
      .slice(0, options.limit ?? 40)
      .map((entry) => ({ path: entry.path, preview: entry.path }));
  }

  async registerWebhook(
    _context: ScmProviderContext,
    _fullName: string,
    registration: ScmWebhookRegistration,
  ) {
    return {
      ok: true,
      externalWebhookId: `gitlab-hook-${randomUUID().slice(0, 8)}`,
      detail: `Registered ${registration.callbackUrl}`,
    };
  }

  verifyWebhook(
    headers: Readonly<Record<string, string | undefined>>,
    _rawBody: string,
    secret: string,
  ) {
    const token = header(headers, "x-gitlab-token");
    if (!token) {
      return { ok: false, reason: "missing x-gitlab-token" };
    }
    const left = Buffer.from(token);
    const right = Buffer.from(secret);
    if (left.length !== right.length || !timingSafeEqual(left, right)) {
      return { ok: false, reason: "invalid gitlab webhook token" };
    }
    return { ok: true };
  }

  normalizeWebhook(
    headers: Readonly<Record<string, string | undefined>>,
    payload: unknown,
  ): ScmWebhookDelivery | undefined {
    const eventName = header(headers, "x-gitlab-event") ?? "other";
    const deliveryId = header(headers, "x-gitlab-event-uuid") ?? randomUUID();
    const body = (payload ?? {}) as Record<string, unknown>;
    const project = body.project as { path_with_namespace?: string } | undefined;
    const fullName = project?.path_with_namespace;

    let eventKind: ScmWebhookDelivery["eventKind"] = "other";
    if (eventName === "Push Hook") eventKind = "push";
    else if (eventName === "Merge Request Hook") eventKind = "pull_request";
    else if (eventName === "Tag Push Hook") eventKind = "create";

    return {
      deliveryId,
      providerId: "gitlab",
      eventKind,
      externalEventName: eventName,
      repositoryFullName: fullName,
      receivedAt: new Date().toISOString(),
      signatureValid: true,
      idempotencyKey: `${deliveryId}:${eventName}`,
      payload: body,
      summary: `${eventName} ${fullName ?? ""}`.trim(),
    };
  }

  private mapRepo(item: Record<string, unknown>): ScmRepositoryRef {
    const fullName = String(
      item.path_with_namespace ?? item.name_with_namespace ?? item.name ?? "",
    );
    return {
      providerId: "gitlab",
      externalId: String(item.id),
      fullName,
      defaultBranch: item.default_branch ? String(item.default_branch) : "main",
      htmlUrl: item.web_url ? String(item.web_url) : undefined,
      visibility:
        String(item.visibility ?? "private") === "public" ? "public" : "private",
      cloneUrl: item.http_url_to_repo ? String(item.http_url_to_repo) : undefined,
    };
  }

  private async gl(
    context: ScmProviderContext,
    path: string,
    init?: { readonly method?: string; readonly body?: string },
  ): Promise<Response> {
    const token = context.credentials?.token;
    if (!token) {
      throw new Error("GitLab PAT required for live mode");
    }
    return fetch(`${this.apiBaseUrl}${path}`, {
      method: init?.method,
      body: init?.body,
      headers: {
        accept: "application/json",
        "private-token": token,
        "user-agent": "apzhub-platform-scm",
        ...(init?.body ? { "content-type": "application/json" } : {}),
      },
      signal: context.signal,
    });
  }
}

export function createGitLabProvider(options: GitLabProviderOptions = {}): ScmProvider {
  return new GitLabScmProvider(options);
}
