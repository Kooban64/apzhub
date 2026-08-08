/**
 * PostgreSQL RepositoryStore — QX-PR-02.
 * Production Source of Record for SCM artefacts.
 */
import {
  getDatabaseExecutor,
  qepScmRepository,
  qepScmTraceabilityLink,
  qepScmWebhookAudit,
  qepScmWebhookIdempotency,
  type DatabaseExecutor,
} from "@apzhub/config";
import type {
  RegisteredRepository,
  RepositoryStore,
  ScmTraceabilityLink,
} from "@apzhub/platform-scm";
import type { WebhookAuditRecord } from "@apzhub/platform-scm";
import { and, desc, eq } from "drizzle-orm";

function toRepository(row: typeof qepScmRepository.$inferSelect): RegisteredRepository {
  return row.repositoryJson as unknown as RegisteredRepository;
}

function toWebhookAudit(
  row: typeof qepScmWebhookAudit.$inferSelect,
): WebhookAuditRecord {
  return row.auditJson as unknown as WebhookAuditRecord;
}

function toTraceabilityLink(
  row: typeof qepScmTraceabilityLink.$inferSelect,
): ScmTraceabilityLink {
  return row.linkJson as unknown as ScmTraceabilityLink;
}

export function createPostgresRepositoryStore(db: DatabaseExecutor): RepositoryStore {
  const exec = () => getDatabaseExecutor(db);

  return {
    async upsert(repository: RegisteredRepository): Promise<RegisteredRepository> {
      const values = {
        id: repository.repositoryId,
        tenantId: repository.tenantId,
        providerId: repository.providerId,
        fullName: repository.fullName,
        repositoryJson: repository as unknown as Record<string, unknown>,
        revision: 1,
        registeredAt: new Date(repository.registeredAt),
        updatedAt: new Date(repository.updatedAt),
      };

      const existing = await exec()
        .select({
          id: qepScmRepository.id,
          revision: qepScmRepository.revision,
        })
        .from(qepScmRepository)
        .where(eq(qepScmRepository.id, repository.repositoryId))
        .limit(1);

      if (existing[0]) {
        await exec()
          .update(qepScmRepository)
          .set({
            providerId: values.providerId,
            fullName: values.fullName,
            repositoryJson: values.repositoryJson,
            revision: existing[0].revision + 1,
            updatedAt: values.updatedAt,
          })
          .where(eq(qepScmRepository.id, repository.repositoryId));
        return repository;
      }

      await exec().insert(qepScmRepository).values(values);
      return repository;
    },

    async get(repositoryId: string): Promise<RegisteredRepository | undefined> {
      const rows = await exec()
        .select()
        .from(qepScmRepository)
        .where(eq(qepScmRepository.id, repositoryId))
        .limit(1);
      return rows[0] ? toRepository(rows[0]) : undefined;
    },

    async list(tenantId?: string): Promise<readonly RegisteredRepository[]> {
      const rows = tenantId
        ? await exec()
            .select()
            .from(qepScmRepository)
            .where(eq(qepScmRepository.tenantId, tenantId))
            .orderBy(desc(qepScmRepository.updatedAt))
        : await exec()
            .select()
            .from(qepScmRepository)
            .orderBy(desc(qepScmRepository.updatedAt));
      return rows.map(toRepository);
    },

    async findByFullName(
      tenantId: string,
      providerId: string,
      fullName: string,
    ): Promise<RegisteredRepository | undefined> {
      const rows = await exec()
        .select()
        .from(qepScmRepository)
        .where(
          and(
            eq(qepScmRepository.tenantId, tenantId),
            eq(qepScmRepository.providerId, providerId),
            eq(qepScmRepository.fullName, fullName),
          ),
        )
        .limit(1);
      if (rows[0]) {
        return toRepository(rows[0]);
      }
      const all = await this.list(tenantId);
      return all.find(
        (repository) =>
          repository.providerId === providerId &&
          repository.fullName.toLowerCase() === fullName.toLowerCase(),
      );
    },

    async recordWebhook(audit: WebhookAuditRecord): Promise<void> {
      await exec()
        .insert(qepScmWebhookAudit)
        .values({
          id: audit.auditId,
          tenantId: audit.tenantId,
          providerId: audit.providerId,
          idempotencyKey: audit.idempotencyKey,
          auditJson: audit as unknown as Record<string, unknown>,
          occurredAt: new Date(audit.occurredAt),
        });
    },

    async listWebhooks(tenantId?: string): Promise<readonly WebhookAuditRecord[]> {
      const rows = tenantId
        ? await exec()
            .select()
            .from(qepScmWebhookAudit)
            .where(eq(qepScmWebhookAudit.tenantId, tenantId))
            .orderBy(desc(qepScmWebhookAudit.occurredAt))
            .limit(500)
        : await exec()
            .select()
            .from(qepScmWebhookAudit)
            .orderBy(desc(qepScmWebhookAudit.occurredAt))
            .limit(500);
      return rows.map(toWebhookAudit);
    },

    async hasIdempotencyKey(key: string): Promise<boolean> {
      const rows = await exec()
        .select({ idempotencyKey: qepScmWebhookIdempotency.idempotencyKey })
        .from(qepScmWebhookIdempotency)
        .where(eq(qepScmWebhookIdempotency.idempotencyKey, key))
        .limit(1);
      return rows.length > 0;
    },

    async rememberIdempotencyKey(key: string, tenantId: string): Promise<void> {
      const existing = await exec()
        .select({ idempotencyKey: qepScmWebhookIdempotency.idempotencyKey })
        .from(qepScmWebhookIdempotency)
        .where(eq(qepScmWebhookIdempotency.idempotencyKey, key))
        .limit(1);
      if (existing[0]) {
        return;
      }
      await exec()
        .insert(qepScmWebhookIdempotency)
        .values({ idempotencyKey: key, tenantId, seenAt: new Date() });
    },

    async addLink(link: ScmTraceabilityLink): Promise<ScmTraceabilityLink> {
      await exec()
        .insert(qepScmTraceabilityLink)
        .values({
          id: link.linkId,
          tenantId: link.tenantId,
          repositoryId: link.repositoryId,
          linkJson: link as unknown as Record<string, unknown>,
          createdAt: new Date(link.createdAt),
        });
      return link;
    },

    async listLinks(repositoryId?: string): Promise<readonly ScmTraceabilityLink[]> {
      const rows = repositoryId
        ? await exec()
            .select()
            .from(qepScmTraceabilityLink)
            .where(eq(qepScmTraceabilityLink.repositoryId, repositoryId))
            .orderBy(desc(qepScmTraceabilityLink.createdAt))
        : await exec()
            .select()
            .from(qepScmTraceabilityLink)
            .orderBy(desc(qepScmTraceabilityLink.createdAt));
      return rows.map(toTraceabilityLink);
    },
  };
}

/** Test helper — delete all SCM rows for a tenant. */
export async function deleteScmDataForTenant(
  tenantId: string,
  db: DatabaseExecutor,
): Promise<void> {
  const exec = getDatabaseExecutor(db);
  await exec
    .delete(qepScmTraceabilityLink)
    .where(eq(qepScmTraceabilityLink.tenantId, tenantId));
  await exec
    .delete(qepScmWebhookAudit)
    .where(eq(qepScmWebhookAudit.tenantId, tenantId));
  await exec
    .delete(qepScmWebhookIdempotency)
    .where(eq(qepScmWebhookIdempotency.tenantId, tenantId));
  await exec.delete(qepScmRepository).where(eq(qepScmRepository.tenantId, tenantId));
}
