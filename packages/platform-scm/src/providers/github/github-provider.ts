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
  ScmWebhookDelivery,
  ScmWebhookRegistration,
} from "../../contracts/webhook";

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
      return [
        { name: "main", sha: "offline-main", protected: true },
        { name: "develop", sha: "offline-develop", protected: false },
      ] satisfies ScmBranchRef[];
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
      return [
        {
          sha: "offline-commit-1",
          message: "chore: offline seed commit",
          authorName: "APZQEP",
          authorEmail: "dev@apzhub.local",
          committedAt: new Date().toISOString(),
          branch: options?.branch ?? "main",
          htmlUrl: `https://github.com/${fullName}/commit/offline-commit-1`,
        },
      ] satisfies ScmCommitRef[];
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

  private async gh(context: ScmProviderContext, path: string): Promise<Response> {
    const token = context.credentials?.token;
    if (!token) {
      throw new Error("GitHub PAT required for live mode");
    }
    return fetch(`${this.apiBaseUrl}${path}`, {
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "user-agent": "apzhub-platform-scm",
      },
      signal: context.signal,
    });
  }
}

export function createGitHubProvider(options?: GitHubProviderOptions): ScmProvider {
  return new GitHubScmProvider(options);
}
