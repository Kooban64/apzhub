import { createHash, randomUUID } from "node:crypto";

import type { ScmDomainEvent, ScmEventPublisher } from "../contracts/events";
import { SCM_EVENT_TYPES } from "../contracts/events";
import type {
  RegisterRepositoryRequest,
  RegisteredRepository,
  ScmAuthCredentials,
  ScmProviderId,
  ScmTraceabilityLink,
} from "../contracts/repository";
import type { ScmWebhookDelivery, WebhookAuditRecord } from "../contracts/webhook";
import type { ScmProviderRegistry } from "../registry/provider-registry";
import { InMemoryRepositoryStore, type RepositoryStore } from "./repository-store";

export interface ScmEngineOptions {
  readonly registry: ScmProviderRegistry;
  readonly store?: RepositoryStore;
  readonly publishEvent?: ScmEventPublisher;
  readonly webhookSecrets?: Readonly<Partial<Record<ScmProviderId, string>>>;
}

export class ScmEngine {
  private readonly registry: ScmProviderRegistry;
  private readonly store: RepositoryStore;
  private readonly publishEvent: ScmEventPublisher;
  private readonly webhookSecrets: Readonly<Partial<Record<ScmProviderId, string>>>;
  private readonly credentials = new Map<string, ScmAuthCredentials>();

  constructor(options: ScmEngineOptions) {
    this.registry = options.registry;
    this.store = options.store ?? new InMemoryRepositoryStore();
    this.publishEvent = options.publishEvent ?? (async () => undefined);
    this.webhookSecrets = options.webhookSecrets ?? {};
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

    return { audit, delivery };
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
      default:
        break;
    }
  }

  private async emit(event: ScmDomainEvent): Promise<void> {
    await this.publishEvent(event);
  }
}
