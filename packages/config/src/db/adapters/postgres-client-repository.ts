import type { Client, ClientSearchCriteria } from "@apzhub/legal-business-core";
import { and, eq, isNull } from "drizzle-orm";

import { createDb, type DatabaseExecutor } from "../client";
import { lawClient } from "../legal-schema";
import { clientToRow, rowToClient } from "../law-mappers/client-row-mapper";
import {
  createClientOutboxDraft,
  type PostgresOutboxEventDraft,
} from "../law-mappers/outbox-drafts";

export interface PostgresClientRepositoryContract {
  list(criteria?: ClientSearchCriteria): readonly Client[];
  getById(clientId: string): Client | undefined;
  create(client: Client): Client;
  update(clientId: string, client: Client): Client | undefined;
  softDelete(clientId: string): Client | undefined;
  count(includeDeleted?: boolean): number;
  isSoftDeleted(clientId: string): boolean;
}

export interface PostgresClientRepositoryOptions {
  readonly tenantId: string;
  readonly db?: DatabaseExecutor;
  readonly runSync: <T>(promise: Promise<T>) => T;
  readonly runInTransaction: <T>(
    operation: (db: DatabaseExecutor) => Promise<T>,
  ) => Promise<T>;
  readonly matchesCriteria: (
    client: Client,
    criteria?: ClientSearchCriteria,
  ) => boolean;
  readonly sortClients: (clients: readonly Client[]) => Client[];
  readonly onOutboxEvent?: (
    db: DatabaseExecutor,
    draft: PostgresOutboxEventDraft,
  ) => Promise<void>;
}

/** PostgreSQL-backed client repository with tenant isolation (LAW-012-02). */
export class PostgresClientRepository implements PostgresClientRepositoryContract {
  constructor(private readonly options: PostgresClientRepositoryOptions) {}

  private get db() {
    return this.options.db ?? createDb();
  }

  list(criteria?: ClientSearchCriteria): readonly Client[] {
    return this.options.runSync(this.listAsync(criteria));
  }

  getById(clientId: string): Client | undefined {
    return this.options.runSync(this.getByIdAsync(clientId));
  }

  create(client: Client): Client {
    this.options.runSync(
      this.options.runInTransaction(async (tx) => {
        await tx.insert(lawClient).values(clientToRow(client, this.options.tenantId));
        await this.options.onOutboxEvent?.(
          tx,
          createClientOutboxDraft("legal.client.created", client),
        );
      }),
    );
    return client;
  }

  update(clientId: string, client: Client): Client | undefined {
    return this.options.runSync(this.updateAsync(clientId, client));
  }

  softDelete(clientId: string): Client | undefined {
    return this.options.runSync(this.softDeleteAsync(clientId));
  }

  count(includeDeleted = false): number {
    return this.options.runSync(this.countAsync(includeDeleted));
  }

  isSoftDeleted(clientId: string): boolean {
    return this.options.runSync(this.isSoftDeletedAsync(clientId));
  }

  private async listAsync(criteria?: ClientSearchCriteria): Promise<readonly Client[]> {
    const rows = await this.db
      .select()
      .from(lawClient)
      .where(
        and(eq(lawClient.tenantId, this.options.tenantId), isNull(lawClient.deletedAt)),
      );

    const clients = rows
      .map(rowToClient)
      .filter((client) => this.options.matchesCriteria(client, criteria));
    return this.options.sortClients(clients);
  }

  private async getByIdAsync(clientId: string): Promise<Client | undefined> {
    const rows = await this.db
      .select()
      .from(lawClient)
      .where(
        and(
          eq(lawClient.tenantId, this.options.tenantId),
          eq(lawClient.clientId, clientId),
          isNull(lawClient.deletedAt),
        ),
      )
      .limit(1);

    const row = rows[0];
    return row ? rowToClient(row) : undefined;
  }

  private async updateAsync(
    clientId: string,
    client: Client,
  ): Promise<Client | undefined> {
    return this.options.runInTransaction(async (tx) => {
      const rows = await tx
        .select()
        .from(lawClient)
        .where(
          and(
            eq(lawClient.tenantId, this.options.tenantId),
            eq(lawClient.clientId, clientId),
            isNull(lawClient.deletedAt),
          ),
        )
        .limit(1);

      if (!rows[0]) {
        return undefined;
      }

      const nextVersion = (rows[0].version ?? 1) + 1;
      const result = await tx
        .update(lawClient)
        .set({
          ...clientToRow(client, this.options.tenantId),
          version: nextVersion,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(lawClient.tenantId, this.options.tenantId),
            eq(lawClient.clientId, clientId),
          ),
        )
        .returning();

      const updated = result[0] ? rowToClient(result[0]) : undefined;
      if (updated) {
        await this.options.onOutboxEvent?.(
          tx,
          createClientOutboxDraft("legal.client.updated", updated),
        );
      }

      return updated;
    });
  }

  private async softDeleteAsync(clientId: string): Promise<Client | undefined> {
    return this.options.runInTransaction(async (tx) => {
      const rows = await tx
        .select()
        .from(lawClient)
        .where(
          and(
            eq(lawClient.tenantId, this.options.tenantId),
            eq(lawClient.clientId, clientId),
            isNull(lawClient.deletedAt),
          ),
        )
        .limit(1);

      const existing = rows[0];
      if (!existing) {
        return undefined;
      }

      const now = new Date();
      const result = await tx
        .update(lawClient)
        .set({
          status: "archived",
          deletedAt: now,
          updatedAt: now,
          version: (existing.version ?? 1) + 1,
        })
        .where(
          and(
            eq(lawClient.tenantId, this.options.tenantId),
            eq(lawClient.clientId, clientId),
          ),
        )
        .returning();

      const deleted = result[0] ? rowToClient(result[0]) : undefined;
      if (deleted) {
        await this.options.onOutboxEvent?.(
          tx,
          createClientOutboxDraft("legal.client.deleted", deleted),
        );
      }

      return deleted;
    });
  }

  private async countAsync(includeDeleted: boolean): Promise<number> {
    const rows = await this.db
      .select()
      .from(lawClient)
      .where(eq(lawClient.tenantId, this.options.tenantId));

    if (includeDeleted) {
      return rows.length;
    }

    return rows.filter((row) => row.deletedAt === null).length;
  }

  private async isSoftDeletedAsync(clientId: string): Promise<boolean> {
    const rows = await this.db
      .select({ deletedAt: lawClient.deletedAt })
      .from(lawClient)
      .where(
        and(
          eq(lawClient.tenantId, this.options.tenantId),
          eq(lawClient.clientId, clientId),
        ),
      )
      .limit(1);

    return Boolean(rows[0]?.deletedAt);
  }
}
