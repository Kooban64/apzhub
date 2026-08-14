import { createHash, randomUUID } from "node:crypto";

import type { ScmChangeEvent } from "../contracts/change-event";
import type { ScmDomainEvent, ScmEventPublisher } from "../contracts/events";
import { SCM_EVENT_TYPES } from "../contracts/events";
import type {
  RegisterRepositoryRequest,
  RegisteredRepository,
  ScmAuthCredentials,
  ScmCommitRef,
  ScmProviderId,
  ScmPullRequestRef,
  ScmTraceabilityLink,
} from "../contracts/repository";
import type { ScmWebhookDelivery, WebhookAuditRecord } from "../contracts/webhook";
import type { ScmProviderRegistry } from "../registry/provider-registry";
import { InMemoryRepositoryStore, type RepositoryStore } from "./repository-store";

/** Fired after durable change events are upserted (Flagship F9 hook). Soft-fail in callers. */
export type ScmChangeEventsPersistedHook = (input: {
  readonly tenantId: string;
  readonly correlationId: string;
  readonly source: "webhook" | "sync";
  readonly events: readonly ScmChangeEvent[];
}) => void | Promise<void>;

export interface ScmEngineOptions {
  readonly registry: ScmProviderRegistry;
  readonly store?: RepositoryStore;
  readonly publishEvent?: ScmEventPublisher;
  readonly webhookSecrets?: Readonly<Partial<Record<ScmProviderId, string>>>;
  readonly onChangeEventsPersisted?: ScmChangeEventsPersistedHook;
}

export class ScmEngine {
  private readonly registry: ScmProviderRegistry;
  private readonly store: RepositoryStore;
  private readonly publishEvent: ScmEventPublisher;
  private readonly webhookSecrets: Readonly<Partial<Record<ScmProviderId, string>>>;
  private readonly onChangeEventsPersisted?: ScmChangeEventsPersistedHook;
  private readonly credentials = new Map<string, ScmAuthCredentials>();

  constructor(options: ScmEngineOptions) {
    this.registry = options.registry;
    this.store = options.store ?? new InMemoryRepositoryStore();
    this.publishEvent = options.publishEvent ?? (async () => undefined);
    this.webhookSecrets = options.webhookSecrets ?? {};
    this.onChangeEventsPersisted = options.onChangeEventsPersisted;
  }

  listProviders() {
    return this.registry.list();
  }

  async listRepositories(tenantId?: string) {
    return this.store.list(tenantId);
  }

  async getRepository(repositoryId: string) {
    return this.store.get(repositoryId);
  }

  async listWebhookAudits(tenantId?: string) {
    return this.store.listWebhooks(tenantId);
  }

  async listTraceabilityLinks(repositoryId?: string) {
    return this.store.listLinks(repositoryId);
  }

  async listChangeEvents(filter: {
    readonly tenantId?: string;
    readonly repositoryId?: string;
    readonly limit?: number;
  }) {
    return this.store.listChangeEvents(filter);
  }

  /**
   * Seed provider credentials from server secrets (never from the browser).
   * Call once at runtime bootstrap for Flagship F1.
   */
  setDefaultCredentials(
    tenantId: string,
    providerId: ScmProviderId,
    credentials: ScmAuthCredentials,
  ): void {
    this.credentials.set(`${tenantId}:${providerId}`, credentials);
  }

  async connectProvider(
    tenantId: string,
    providerId: ScmProviderId,
    correlationId: string,
    credentials?: ScmAuthCredentials,
  ) {
    const provider = this.registry.require(providerId);
    if (provider.descriptor.status !== "active") {
      throw new Error(
        `Provider ${providerId} is a placeholder and cannot connect in APZQEP-162`,
      );
    }
    const result = await provider.connect({ tenantId, correlationId, credentials });
    if (!result.ok) {
      await this.emit({
        type: SCM_EVENT_TYPES.authenticationFailed,
        occurredAt: new Date().toISOString(),
        tenantId,
        correlationId,
        providerId,
        payload: { detail: result.detail ?? "connect failed" },
      });
      throw new Error(result.detail ?? `Failed to connect provider ${providerId}`);
    }
    if (credentials) {
      this.credentials.set(`${tenantId}:${providerId}`, credentials);
    }
    await this.emit({
      type: SCM_EVENT_TYPES.providerConnected,
      occurredAt: new Date().toISOString(),
      tenantId,
      correlationId,
      providerId,
      payload: { detail: result.detail ?? "connected" },
    });
    return result;
  }

  async registerRepository(
    request: RegisterRepositoryRequest,
  ): Promise<RegisteredRepository> {
    const provider = this.registry.require(request.providerId);
    if (provider.descriptor.status !== "active") {
      throw new Error(
        `Provider ${request.providerId} is a placeholder and cannot register repositories in APZQEP-162`,
      );
    }

    const existing = await this.store.findByFullName(
      request.tenantId,
      request.providerId,
      request.fullName,
    );
    const now = new Date().toISOString();
    const credentials =
      request.credentials ??
      this.credentials.get(`${request.tenantId}:${request.providerId}`);

    let remote = await provider.getRepository(
      {
        tenantId: request.tenantId,
        correlationId: randomUUID(),
        credentials,
      },
      request.fullName,
    );

    if (!remote && request.externalId) {
      remote = {
        providerId: request.providerId,
        externalId: request.externalId,
        fullName: request.fullName,
        defaultBranch: request.defaultBranch,
        htmlUrl: request.htmlUrl,
        visibility: request.visibility,
      };
    }

    if (!remote) {
      remote = {
        providerId: request.providerId,
        externalId: request.externalId ?? request.fullName,
        fullName: request.fullName,
        defaultBranch: request.defaultBranch ?? "main",
        htmlUrl: request.htmlUrl,
        visibility: request.visibility ?? "unknown",
      };
    }

    const repository: RegisteredRepository = {
      repositoryId: existing?.repositoryId ?? randomUUID(),
      tenantId: request.tenantId,
      providerId: request.providerId,
      externalId: remote.externalId,
      fullName: remote.fullName,
      defaultBranch: request.defaultBranch ?? remote.defaultBranch ?? "main",
      visibility: request.visibility ?? remote.visibility ?? "unknown",
      state: "enabled",
      htmlUrl: request.htmlUrl ?? remote.htmlUrl,
      selectedBranches: request.selectedBranches,
      metadata: request.metadata,
      registeredAt: existing?.registeredAt ?? now,
      updatedAt: now,
      registeredBy: request.registeredBy,
      health: { ok: true, detail: "registered", checkedAt: now },
    };

    await this.store.upsert(repository);
    await this.emit({
      type: existing
        ? SCM_EVENT_TYPES.repositoryUpdated
        : SCM_EVENT_TYPES.repositoryRegistered,
      occurredAt: now,
      tenantId: request.tenantId,
      correlationId: randomUUID(),
      providerId: request.providerId,
      repositoryId: repository.repositoryId,
      payload: { fullName: repository.fullName, state: repository.state },
    });
    return repository;
  }

  async setRepositoryState(
    repositoryId: string,
    state: RegisteredRepository["state"],
    actorId: string,
  ): Promise<RegisteredRepository> {
    const current = await this.store.get(repositoryId);
    if (!current) {
      throw new Error(`Repository not found: ${repositoryId}`);
    }
    const updated: RegisteredRepository = {
      ...current,
      state,
      updatedAt: new Date().toISOString(),
      metadata: { ...(current.metadata ?? {}), lastStateChangeBy: actorId },
    };
    await this.store.upsert(updated);
    await this.emit({
      type: SCM_EVENT_TYPES.repositoryUpdated,
      occurredAt: updated.updatedAt,
      tenantId: updated.tenantId,
      correlationId: randomUUID(),
      providerId: updated.providerId,
      repositoryId: updated.repositoryId,
      payload: { state, actorId },
    });
    return updated;
  }

  async validateConnection(
    tenantId: string,
    providerId: ScmProviderId,
    correlationId: string,
    credentials?: ScmAuthCredentials,
  ) {
    const provider = this.registry.require(providerId);
    if (provider.descriptor.status !== "active") {
      throw new Error(`Provider ${providerId} is a placeholder`);
    }
    const creds = credentials ?? this.credentials.get(`${tenantId}:${providerId}`);
    return provider.health({ tenantId, correlationId, credentials: creds });
  }

  async syncRepository(repositoryId: string, correlationId: string) {
    const current = await this.store.get(repositoryId);
    if (!current) {
      throw new Error(`Repository not found: ${repositoryId}`);
    }
    const provider = this.registry.require(current.providerId);
    const credentials = this.credentials.get(
      `${current.tenantId}:${current.providerId}`,
    );
    const context = {
      tenantId: current.tenantId,
      correlationId,
      credentials,
    };
    const [remote, branches, commits, pullRequests] = await Promise.all([
      provider.getRepository(context, current.fullName),
      provider.listBranches(context, current.fullName),
      provider.listCommits(context, current.fullName, {
        branch: current.defaultBranch,
        limit: 20,
      }),
      provider.listPullRequests(context, current.fullName, {
        state: "open",
        limit: 20,
      }),
    ]);
    const now = new Date().toISOString();
    const updated: RegisteredRepository = {
      ...current,
      defaultBranch: remote?.defaultBranch ?? current.defaultBranch,
      htmlUrl: remote?.htmlUrl ?? current.htmlUrl,
      visibility: remote?.visibility ?? current.visibility,
      updatedAt: now,
      health: { ok: true, detail: "synced", checkedAt: now },
      metadata: {
        ...(current.metadata ?? {}),
        lastSyncBranchCount: String(branches.length),
        lastSyncCommitCount: String(commits.length),
        lastSyncOpenPrCount: String(pullRequests.length),
      },
    };
    await this.store.upsert(updated);
    const syncedChangeEvents = [
      ...commits.map((commit) =>
        changeFromCommit(updated, commit, correlationId, "sync"),
      ),
      ...pullRequests.map((pullRequest) =>
        changeFromPullRequest(updated, pullRequest, correlationId, "sync"),
      ),
    ];
    await this.store.upsertChangeEvents(syncedChangeEvents);
    if (syncedChangeEvents.length > 0) {
      await this.notifyChangeEventsPersisted({
        tenantId: updated.tenantId,
        correlationId,
        source: "sync",
        events: syncedChangeEvents,
      });
    }
    await this.emit({
      type: SCM_EVENT_TYPES.repositoryUpdated,
      occurredAt: now,
      tenantId: updated.tenantId,
      correlationId,
      providerId: updated.providerId,
      repositoryId: updated.repositoryId,
      payload: {
        synced: true,
        branches: branches.length,
        commits: commits.length,
        pullRequests: pullRequests.length,
      },
    });
    return { repository: updated, branches, commits, pullRequests };
  }

  async ingestWebhook(input: {
    readonly tenantId: string;
    readonly providerId: ScmProviderId;
    readonly headers: Readonly<Record<string, string | undefined>>;
    readonly rawBody: string;
    readonly payload: unknown;
    readonly correlationId?: string;
  }): Promise<{
    readonly audit: WebhookAuditRecord;
    readonly delivery?: ScmWebhookDelivery;
  }> {
    const provider = this.registry.require(input.providerId);
    const secret = this.webhookSecrets[input.providerId] ?? "dev-scm-webhook-secret";
    const verification = provider.verifyWebhook(input.headers, input.rawBody, secret);
    const correlationId = input.correlationId ?? randomUUID();
    const now = new Date().toISOString();

    if (!verification.ok) {
      const audit: WebhookAuditRecord = {
        auditId: randomUUID(),
        tenantId: input.tenantId,
        providerId: input.providerId,
        deliveryId: input.headers["x-github-delivery"] ?? randomUUID(),
        state: "rejected",
        eventKind: "other",
        idempotencyKey: createHash("sha256").update(input.rawBody).digest("hex"),
        detail: verification.reason ?? "signature invalid",
        occurredAt: now,
      };
      await this.store.recordWebhook(audit);
      await this.emit({
        type: SCM_EVENT_TYPES.webhookFailed,
        occurredAt: now,
        tenantId: input.tenantId,
        correlationId,
        providerId: input.providerId,
        payload: { reason: audit.detail ?? "rejected" },
      });
      return { audit };
    }

    const delivery = provider.normalizeWebhook(input.headers, input.payload);
    if (!delivery) {
      const audit: WebhookAuditRecord = {
        auditId: randomUUID(),
        tenantId: input.tenantId,
        providerId: input.providerId,
        deliveryId: randomUUID(),
        state: "failed",
        eventKind: "other",
        idempotencyKey: createHash("sha256").update(input.rawBody).digest("hex"),
        detail: "unsupported or empty webhook payload",
        occurredAt: now,
      };
      await this.store.recordWebhook(audit);
      return { audit };
    }

    if (await this.store.hasIdempotencyKey(delivery.idempotencyKey)) {
      const audit: WebhookAuditRecord = {
        auditId: randomUUID(),
        tenantId: input.tenantId,
        providerId: input.providerId,
        deliveryId: delivery.deliveryId,
        state: "replayed",
        eventKind: delivery.eventKind,
        repositoryFullName: delivery.repositoryFullName,
        idempotencyKey: delivery.idempotencyKey,
        detail: "duplicate delivery ignored",
        occurredAt: now,
      };
      await this.store.recordWebhook(audit);
      return { audit, delivery };
    }

    await this.store.rememberIdempotencyKey(delivery.idempotencyKey, input.tenantId);
    const audit: WebhookAuditRecord = {
      auditId: randomUUID(),
      tenantId: input.tenantId,
      providerId: input.providerId,
      deliveryId: delivery.deliveryId,
      state: "processed",
      eventKind: delivery.eventKind,
      repositoryFullName: delivery.repositoryFullName,
      idempotencyKey: delivery.idempotencyKey,
      detail: delivery.summary,
      occurredAt: now,
    };
    await this.store.recordWebhook(audit);

    const repository = delivery.repositoryFullName
      ? await this.store.findByFullName(
          input.tenantId,
          input.providerId,
          delivery.repositoryFullName,
        )
      : undefined;

    await this.emit({
      type: SCM_EVENT_TYPES.webhookReceived,
      occurredAt: now,
      tenantId: input.tenantId,
      correlationId,
      providerId: input.providerId,
      repositoryId: repository?.repositoryId,
      payload: {
        eventKind: delivery.eventKind,
        deliveryId: delivery.deliveryId,
        summary: delivery.summary,
      },
    });

    await this.publishDomainFromWebhook(
      input.tenantId,
      correlationId,
      delivery,
      repository,
    );

    const changeEvents = extractChangeEventsFromDelivery(
      input.tenantId,
      correlationId,
      delivery,
      repository,
    );
    if (changeEvents.length > 0) {
      await this.store.upsertChangeEvents(changeEvents);
      await this.notifyChangeEventsPersisted({
        tenantId: input.tenantId,
        correlationId,
        source: "webhook",
        events: changeEvents,
      });
    }

    return { audit, delivery };
  }

  private async notifyChangeEventsPersisted(input: {
    readonly tenantId: string;
    readonly correlationId: string;
    readonly source: "webhook" | "sync";
    readonly events: readonly ScmChangeEvent[];
  }): Promise<void> {
    if (!this.onChangeEventsPersisted) return;
    try {
      await this.onChangeEventsPersisted(input);
    } catch {
      // Soft-fail — never break webhook/sync persistence.
    }
  }

  async addTraceabilityLink(
    input: Omit<ScmTraceabilityLink, "linkId" | "createdAt"> & {
      readonly createdAt?: string;
    },
  ): Promise<ScmTraceabilityLink> {
    const repository = await this.store.get(input.repositoryId);
    if (!repository) {
      throw new Error(`Repository not found: ${input.repositoryId}`);
    }
    return this.store.addLink({
      linkId: randomUUID(),
      createdAt: input.createdAt ?? new Date().toISOString(),
      tenantId: input.tenantId,
      repositoryId: input.repositoryId,
      kind: input.kind,
      externalRef: input.externalRef,
      platformRef: input.platformRef,
      createdBy: input.createdBy,
      note: input.note,
    });
  }

  private async publishDomainFromWebhook(
    tenantId: string,
    correlationId: string,
    delivery: ScmWebhookDelivery,
    repository?: RegisteredRepository,
  ): Promise<void> {
    const base = {
      occurredAt: delivery.receivedAt,
      tenantId,
      correlationId,
      providerId: delivery.providerId,
      repositoryId: repository?.repositoryId,
    };

    switch (delivery.eventKind) {
      case "push":
        await this.emit({
          ...base,
          type: SCM_EVENT_TYPES.commitReceived,
          payload: { summary: delivery.summary },
        });
        break;
      case "pull_request": {
        const action = String(delivery.payload.action ?? "updated");
        const type =
          action === "opened"
            ? SCM_EVENT_TYPES.pullRequestOpened
            : action === "closed"
              ? SCM_EVENT_TYPES.pullRequestClosed
              : SCM_EVENT_TYPES.pullRequestUpdated;
        await this.emit({
          ...base,
          type,
          payload: { action, summary: delivery.summary },
        });
        break;
      }
      case "create":
        await this.emit({
          ...base,
          type:
            String(delivery.payload.ref_type ?? "") === "tag"
              ? SCM_EVENT_TYPES.tagCreated
              : SCM_EVENT_TYPES.branchCreated,
          payload: { summary: delivery.summary },
        });
        break;
      case "delete":
        await this.emit({
          ...base,
          type: SCM_EVENT_TYPES.branchDeleted,
          payload: { summary: delivery.summary },
        });
        break;
      case "release":
        await this.emit({
          ...base,
          type: SCM_EVENT_TYPES.releasePublished,
          payload: { summary: delivery.summary },
        });
        break;
      case "workflow_run":
      case "check_suite":
        await this.emit({
          ...base,
          type: SCM_EVENT_TYPES.commitReceived,
          payload: {
            summary: delivery.summary,
            ci: true,
            eventKind: delivery.eventKind,
          },
        });
        break;
      default:
        break;
    }
  }

  private async emit(event: ScmDomainEvent): Promise<void> {
    await this.publishEvent(event);
  }
}

function changeEventId(
  providerId: string,
  repositoryKey: string,
  kind: string,
  externalKey: string,
): string {
  return `chg-${providerId}-${repositoryKey}-${kind}-${externalKey}`.replace(
    /[^a-zA-Z0-9._:-]+/g,
    "_",
  );
}

function changeFromCommit(
  repository: RegisteredRepository,
  commit: ScmCommitRef,
  correlationId: string,
  source: ScmChangeEvent["source"],
): ScmChangeEvent {
  return {
    changeEventId: changeEventId(
      repository.providerId,
      repository.repositoryId,
      "commit",
      commit.sha,
    ),
    tenantId: repository.tenantId,
    repositoryId: repository.repositoryId,
    providerId: repository.providerId,
    kind: "commit",
    externalKey: commit.sha,
    sha: commit.sha,
    branch: commit.branch,
    title: commit.message,
    authorName: commit.authorName,
    htmlUrl: commit.htmlUrl,
    occurredAt: commit.committedAt ?? new Date().toISOString(),
    correlationId,
    source,
    summary: commit.message.slice(0, 200),
  };
}

function changeFromPullRequest(
  repository: RegisteredRepository,
  pullRequest: ScmPullRequestRef,
  correlationId: string,
  source: ScmChangeEvent["source"],
): ScmChangeEvent {
  return {
    changeEventId: changeEventId(
      repository.providerId,
      repository.repositoryId,
      "pr",
      String(pullRequest.number),
    ),
    tenantId: repository.tenantId,
    repositoryId: repository.repositoryId,
    providerId: repository.providerId,
    kind: "pull_request",
    externalKey: `pr:${pullRequest.number}`,
    prNumber: pullRequest.number,
    branch: pullRequest.sourceBranch,
    title: pullRequest.title,
    authorLogin: pullRequest.authorLogin,
    htmlUrl: pullRequest.htmlUrl,
    occurredAt: pullRequest.updatedAt ?? new Date().toISOString(),
    correlationId,
    source,
    summary: `PR #${pullRequest.number} ${pullRequest.title}`.slice(0, 200),
  };
}

function extractChangeEventsFromDelivery(
  tenantId: string,
  correlationId: string,
  delivery: ScmWebhookDelivery,
  repository?: RegisteredRepository,
): ScmChangeEvent[] {
  const repositoryKey =
    repository?.repositoryId ?? delivery.repositoryFullName ?? "unknown";
  const providerId = delivery.providerId;
  const base = {
    tenantId,
    repositoryId: repository?.repositoryId,
    providerId,
    correlationId,
    source: "webhook" as const,
    occurredAt: delivery.receivedAt,
  };

  if (delivery.eventKind === "push") {
    const ref = String(delivery.payload.ref ?? "");
    const branch = ref.startsWith("refs/heads/")
      ? ref.slice("refs/heads/".length)
      : ref || undefined;
    const commits = Array.isArray(delivery.payload.commits)
      ? (delivery.payload.commits as Array<Record<string, unknown>>)
      : [];
    const pusher = delivery.payload.pusher as
      { name?: string; email?: string } | undefined;
    const head = delivery.payload.head_commit as
      | { id?: string; message?: string; author?: { name?: string; username?: string } }
      | undefined;

    const fromCommits = commits.slice(0, 50).map((commit) => {
      const sha = String(commit.id ?? commit.sha ?? "");
      const author = commit.author as
        { name?: string; username?: string; email?: string } | undefined;
      const added = Array.isArray(commit.added) ? (commit.added as string[]) : [];
      const modified = Array.isArray(commit.modified)
        ? (commit.modified as string[])
        : [];
      const removed = Array.isArray(commit.removed) ? (commit.removed as string[]) : [];
      return {
        ...base,
        changeEventId: changeEventId(
          providerId,
          repositoryKey,
          "commit",
          sha || delivery.deliveryId,
        ),
        kind: "commit" as const,
        externalKey: sha || delivery.deliveryId,
        sha: sha || undefined,
        branch,
        title: String(commit.message ?? delivery.summary).slice(0, 500),
        authorLogin: author?.username,
        authorName: author?.name ?? pusher?.name,
        filesChanged: [...added, ...modified, ...removed].slice(0, 200),
        htmlUrl: commit.url ? String(commit.url) : undefined,
        summary: String(commit.message ?? delivery.summary).slice(0, 200),
      } satisfies ScmChangeEvent;
    });

    if (fromCommits.length > 0) {
      return fromCommits;
    }

    const sha = head?.id ? String(head.id) : delivery.deliveryId;
    return [
      {
        ...base,
        changeEventId: changeEventId(providerId, repositoryKey, "push", sha),
        kind: "push",
        externalKey: sha,
        sha: head?.id ? String(head.id) : undefined,
        branch,
        title: head?.message ? String(head.message) : delivery.summary,
        authorLogin: head?.author?.username ?? pusher?.name,
        authorName: head?.author?.name ?? pusher?.name,
        summary: delivery.summary,
      },
    ];
  }

  if (delivery.eventKind === "pull_request") {
    const pr = delivery.payload.pull_request as
      | {
          number?: number;
          title?: string;
          html_url?: string;
          user?: { login?: string };
          head?: { ref?: string; sha?: string };
          updated_at?: string;
        }
      | undefined;
    const number = Number(pr?.number ?? 0);
    const filePaths = Array.isArray(delivery.payload.changed_files)
      ? (delivery.payload.changed_files as string[]).slice(0, 200)
      : undefined;

    return [
      {
        ...base,
        changeEventId: changeEventId(
          providerId,
          repositoryKey,
          "pr",
          String(number || delivery.deliveryId),
        ),
        kind: "pull_request",
        externalKey: number ? `pr:${number}` : delivery.deliveryId,
        prNumber: number || undefined,
        sha: pr?.head?.sha,
        branch: pr?.head?.ref,
        title: pr?.title,
        authorLogin: pr?.user?.login,
        htmlUrl: pr?.html_url,
        filesChanged: filePaths,
        occurredAt: pr?.updated_at ?? delivery.receivedAt,
        summary: delivery.summary,
      },
    ];
  }

  if (delivery.eventKind === "workflow_run" || delivery.eventKind === "check_suite") {
    const workflowRun = delivery.payload.workflow_run as
      | {
          id?: number;
          name?: string;
          conclusion?: string;
          status?: string;
          html_url?: string;
          head_sha?: string;
          head_branch?: string;
          updated_at?: string;
        }
      | undefined;
    const checkSuite = delivery.payload.check_suite as
      | {
          id?: number;
          conclusion?: string;
          status?: string;
          head_sha?: string;
          head_branch?: string;
          updated_at?: string;
          app?: { name?: string };
        }
      | undefined;
    const runId = String(workflowRun?.id ?? checkSuite?.id ?? delivery.deliveryId);
    const sha = workflowRun?.head_sha ?? checkSuite?.head_sha;
    const branch = workflowRun?.head_branch ?? checkSuite?.head_branch;
    const title =
      workflowRun?.name ??
      checkSuite?.app?.name ??
      (delivery.eventKind === "workflow_run" ? "workflow_run" : "check_suite");
    return [
      {
        ...base,
        changeEventId: changeEventId(providerId, repositoryKey, "ci", runId),
        kind: "ci_run",
        externalKey: `ci:${runId}`,
        sha,
        branch,
        title: String(title),
        htmlUrl: workflowRun?.html_url,
        occurredAt:
          workflowRun?.updated_at ?? checkSuite?.updated_at ?? delivery.receivedAt,
        summary: delivery.summary,
      },
    ];
  }

  return [
    {
      ...base,
      changeEventId: changeEventId(
        providerId,
        repositoryKey,
        "other",
        delivery.deliveryId,
      ),
      kind: "other",
      externalKey: delivery.deliveryId,
      summary: delivery.summary,
    },
  ];
}
