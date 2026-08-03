import type {
  RegisteredRepository,
  ScmTraceabilityLink,
} from "../contracts/repository";
import type { WebhookAuditRecord } from "../contracts/webhook";

export class InMemoryRepositoryStore {
  private readonly repositories = new Map<string, RegisteredRepository>();
  private readonly webhookAudits: WebhookAuditRecord[] = [];
  private readonly idempotencyKeys = new Set<string>();
  private readonly links: ScmTraceabilityLink[] = [];

  upsert(repository: RegisteredRepository): RegisteredRepository {
    this.repositories.set(repository.repositoryId, repository);
    return repository;
  }

  get(repositoryId: string): RegisteredRepository | undefined {
    return this.repositories.get(repositoryId);
  }

  list(tenantId?: string): readonly RegisteredRepository[] {
    const all = [...this.repositories.values()];
    return tenantId
      ? all.filter((repository) => repository.tenantId === tenantId)
      : all;
  }

  findByFullName(
    tenantId: string,
    providerId: string,
    fullName: string,
  ): RegisteredRepository | undefined {
    return this.list(tenantId).find(
      (repository) =>
        repository.providerId === providerId &&
        repository.fullName.toLowerCase() === fullName.toLowerCase(),
    );
  }

  recordWebhook(audit: WebhookAuditRecord): void {
    this.webhookAudits.unshift(audit);
    if (this.webhookAudits.length > 500) {
      this.webhookAudits.length = 500;
    }
  }

  listWebhooks(tenantId?: string): readonly WebhookAuditRecord[] {
    return tenantId
      ? this.webhookAudits.filter((audit) => audit.tenantId === tenantId)
      : this.webhookAudits;
  }

  hasIdempotencyKey(key: string): boolean {
    return this.idempotencyKeys.has(key);
  }

  rememberIdempotencyKey(key: string): void {
    this.idempotencyKeys.add(key);
  }

  addLink(link: ScmTraceabilityLink): ScmTraceabilityLink {
    this.links.push(link);
    return link;
  }

  listLinks(repositoryId?: string): readonly ScmTraceabilityLink[] {
    return repositoryId
      ? this.links.filter((link) => link.repositoryId === repositoryId)
      : this.links;
  }
}
