import type { ScmChangeEvent } from "../contracts/change-event";
import type {
  RegisteredRepository,
  ScmTraceabilityLink,
} from "../contracts/repository";
import type { WebhookAuditRecord } from "../contracts/webhook";

/**
 * SCM Source of Record port (QX-PR-02 + Flagship F1).
 * Production implementations must survive process restart.
 */
export interface RepositoryStore {
  upsert(repository: RegisteredRepository): Promise<RegisteredRepository>;
  get(repositoryId: string): Promise<RegisteredRepository | undefined>;
  list(tenantId?: string): Promise<readonly RegisteredRepository[]>;
  findByFullName(
    tenantId: string,
    providerId: string,
    fullName: string,
  ): Promise<RegisteredRepository | undefined>;
  recordWebhook(audit: WebhookAuditRecord): Promise<void>;
  listWebhooks(tenantId?: string): Promise<readonly WebhookAuditRecord[]>;
  hasIdempotencyKey(key: string): Promise<boolean>;
  rememberIdempotencyKey(key: string, tenantId: string): Promise<void>;
  addLink(link: ScmTraceabilityLink): Promise<ScmTraceabilityLink>;
  listLinks(repositoryId?: string): Promise<readonly ScmTraceabilityLink[]>;
  /** Upsert durable change heartbeat records (commit / PR / push). */
  upsertChangeEvents(events: readonly ScmChangeEvent[]): Promise<void>;
  listChangeEvents(filter: {
    readonly tenantId?: string;
    readonly repositoryId?: string;
    readonly limit?: number;
  }): Promise<readonly ScmChangeEvent[]>;
}

/** Process-local store — allowed in development/tests only. */
export class InMemoryRepositoryStore implements RepositoryStore {
  private readonly repositories = new Map<string, RegisteredRepository>();
  private readonly webhookAudits: WebhookAuditRecord[] = [];
  private readonly idempotencyKeys = new Set<string>();
  private readonly links: ScmTraceabilityLink[] = [];
  private readonly changeEvents = new Map<string, ScmChangeEvent>();

  async upsert(repository: RegisteredRepository): Promise<RegisteredRepository> {
    this.repositories.set(repository.repositoryId, repository);
    return repository;
  }

  async get(repositoryId: string): Promise<RegisteredRepository | undefined> {
    return this.repositories.get(repositoryId);
  }

  async list(tenantId?: string): Promise<readonly RegisteredRepository[]> {
    const all = [...this.repositories.values()];
    return tenantId
      ? all.filter((repository) => repository.tenantId === tenantId)
      : all;
  }

  async findByFullName(
    tenantId: string,
    providerId: string,
    fullName: string,
  ): Promise<RegisteredRepository | undefined> {
    const all = await this.list(tenantId);
    return all.find(
      (repository) =>
        repository.providerId === providerId &&
        repository.fullName.toLowerCase() === fullName.toLowerCase(),
    );
  }

  async recordWebhook(audit: WebhookAuditRecord): Promise<void> {
    this.webhookAudits.unshift(audit);
    if (this.webhookAudits.length > 500) {
      this.webhookAudits.length = 500;
    }
  }

  async listWebhooks(tenantId?: string): Promise<readonly WebhookAuditRecord[]> {
    return tenantId
      ? this.webhookAudits.filter((audit) => audit.tenantId === tenantId)
      : this.webhookAudits;
  }

  async hasIdempotencyKey(key: string): Promise<boolean> {
    return this.idempotencyKeys.has(key);
  }

  async rememberIdempotencyKey(key: string, _tenantId: string): Promise<void> {
    this.idempotencyKeys.add(key);
  }

  async addLink(link: ScmTraceabilityLink): Promise<ScmTraceabilityLink> {
    this.links.push(link);
    return link;
  }

  async listLinks(repositoryId?: string): Promise<readonly ScmTraceabilityLink[]> {
    return repositoryId
      ? this.links.filter((link) => link.repositoryId === repositoryId)
      : this.links;
  }

  async upsertChangeEvents(events: readonly ScmChangeEvent[]): Promise<void> {
    for (const event of events) {
      this.changeEvents.set(event.changeEventId, event);
    }
  }

  async listChangeEvents(filter: {
    readonly tenantId?: string;
    readonly repositoryId?: string;
    readonly limit?: number;
  }): Promise<readonly ScmChangeEvent[]> {
    let all = [...this.changeEvents.values()];
    if (filter.tenantId) {
      all = all.filter((event) => event.tenantId === filter.tenantId);
    }
    if (filter.repositoryId) {
      all = all.filter((event) => event.repositoryId === filter.repositoryId);
    }
    all.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
    const limit = filter.limit ?? 100;
    return all.slice(0, limit);
  }
}
