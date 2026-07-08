import type { Matter } from "@apzhub/legal-business-core";
import { and, eq, isNull } from "drizzle-orm";

import { createDb, type DatabaseExecutor } from "../client";
import { lawMatter } from "../legal-schema";
import { matterToRow, rowToMatter } from "../law-mappers/matter-row-mapper";
import {
  createMatterOutboxDraft,
  type PostgresOutboxEventDraft,
} from "../law-mappers/outbox-drafts";

export interface PostgresMatterListCriteria {
  readonly query?: string;
  readonly status?: Matter["matterStatus"] | "all";
  readonly clientId?: string | "all";
  readonly priority?: Matter["priority"] | "all";
}

export interface PostgresMatterRepositoryContract {
  list(criteria?: PostgresMatterListCriteria): readonly Matter[];
  getById(matterId: string): Matter | undefined;
  create(matter: Matter): Matter;
  update(matterId: string, matter: Matter): Matter | undefined;
  softArchive(matterId: string): Matter | undefined;
  count(includeArchived?: boolean): number;
  isSoftArchived(matterId: string): boolean;
}

export interface PostgresMatterRepositoryOptions {
  readonly tenantId: string;
  readonly db?: DatabaseExecutor;
  readonly runSync: <T>(promise: Promise<T>) => T;
  readonly runInTransaction: <T>(
    operation: (db: DatabaseExecutor) => Promise<T>,
  ) => Promise<T>;
  readonly matchesCriteria: (
    matter: Matter,
    criteria?: PostgresMatterListCriteria,
  ) => boolean;
  readonly sortMatters: (matters: readonly Matter[]) => Matter[];
  readonly onOutboxEvent?: (
    db: DatabaseExecutor,
    draft: PostgresOutboxEventDraft,
  ) => Promise<void>;
}

/** PostgreSQL-backed matter repository with tenant isolation (LAW-012-02). */
export class PostgresMatterRepository implements PostgresMatterRepositoryContract {
  constructor(private readonly options: PostgresMatterRepositoryOptions) {}

  private get db() {
    return this.options.db ?? createDb();
  }

  list(criteria?: PostgresMatterListCriteria): readonly Matter[] {
    return this.options.runSync(this.listAsync(criteria));
  }

  getById(matterId: string): Matter | undefined {
    return this.options.runSync(this.getByIdAsync(matterId));
  }

  create(matter: Matter): Matter {
    this.options.runSync(
      this.options.runInTransaction(async (tx) => {
        await tx.insert(lawMatter).values(matterToRow(matter, this.options.tenantId));
        await this.options.onOutboxEvent?.(
          tx,
          createMatterOutboxDraft("legal.matter.created", matter),
        );
      }),
    );
    return matter;
  }

  update(matterId: string, matter: Matter): Matter | undefined {
    return this.options.runSync(this.updateAsync(matterId, matter));
  }

  softArchive(matterId: string): Matter | undefined {
    return this.options.runSync(this.softArchiveAsync(matterId));
  }

  count(includeArchived = false): number {
    return this.options.runSync(this.countAsync(includeArchived));
  }

  isSoftArchived(matterId: string): boolean {
    return this.options.runSync(this.isSoftArchivedAsync(matterId));
  }

  private async listAsync(
    criteria?: PostgresMatterListCriteria,
  ): Promise<readonly Matter[]> {
    const rows = await this.db
      .select()
      .from(lawMatter)
      .where(
        and(
          eq(lawMatter.tenantId, this.options.tenantId),
          isNull(lawMatter.archivedAt),
        ),
      );

    const matters = rows
      .map(rowToMatter)
      .filter((matter) => this.options.matchesCriteria(matter, criteria));
    return this.options.sortMatters(matters);
  }

  private async getByIdAsync(matterId: string): Promise<Matter | undefined> {
    const rows = await this.db
      .select()
      .from(lawMatter)
      .where(
        and(
          eq(lawMatter.tenantId, this.options.tenantId),
          eq(lawMatter.matterId, matterId),
          isNull(lawMatter.archivedAt),
        ),
      )
      .limit(1);

    const row = rows[0];
    return row ? rowToMatter(row) : undefined;
  }

  private async updateAsync(
    matterId: string,
    matter: Matter,
  ): Promise<Matter | undefined> {
    return this.options.runInTransaction(async (tx) => {
      const rows = await tx
        .select()
        .from(lawMatter)
        .where(
          and(
            eq(lawMatter.tenantId, this.options.tenantId),
            eq(lawMatter.matterId, matterId),
            isNull(lawMatter.archivedAt),
          ),
        )
        .limit(1);

      if (!rows[0]) {
        return undefined;
      }

      const nextVersion = (rows[0].version ?? 1) + 1;
      const result = await tx
        .update(lawMatter)
        .set({
          ...matterToRow(matter, this.options.tenantId),
          version: nextVersion,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(lawMatter.tenantId, this.options.tenantId),
            eq(lawMatter.matterId, matterId),
          ),
        )
        .returning();

      const updated = result[0] ? rowToMatter(result[0]) : undefined;
      if (updated) {
        await this.options.onOutboxEvent?.(
          tx,
          createMatterOutboxDraft("legal.matter.updated", updated),
        );
      }

      return updated;
    });
  }

  private async softArchiveAsync(matterId: string): Promise<Matter | undefined> {
    return this.options.runInTransaction(async (tx) => {
      const rows = await tx
        .select()
        .from(lawMatter)
        .where(
          and(
            eq(lawMatter.tenantId, this.options.tenantId),
            eq(lawMatter.matterId, matterId),
            isNull(lawMatter.archivedAt),
          ),
        )
        .limit(1);

      const existing = rows[0];
      if (!existing) {
        return undefined;
      }

      const now = new Date();
      const closedAt = now.toISOString();
      const result = await tx
        .update(lawMatter)
        .set({
          matterStatus: "archived",
          closedAt: now,
          archivedAt: now,
          updatedAt: now,
          version: (existing.version ?? 1) + 1,
        })
        .where(
          and(
            eq(lawMatter.tenantId, this.options.tenantId),
            eq(lawMatter.matterId, matterId),
          ),
        )
        .returning();

      const archived = result[0] ? rowToMatter(result[0]) : undefined;
      if (archived) {
        const withClosedAt = { ...archived, closedAt };
        await this.options.onOutboxEvent?.(
          tx,
          createMatterOutboxDraft("legal.matter.archived", withClosedAt),
        );
        return withClosedAt;
      }

      return undefined;
    });
  }

  private async countAsync(includeArchived: boolean): Promise<number> {
    const rows = await this.db
      .select()
      .from(lawMatter)
      .where(eq(lawMatter.tenantId, this.options.tenantId));

    if (includeArchived) {
      return rows.length;
    }

    return rows.filter((row) => row.archivedAt === null).length;
  }

  private async isSoftArchivedAsync(matterId: string): Promise<boolean> {
    const rows = await this.db
      .select({ archivedAt: lawMatter.archivedAt })
      .from(lawMatter)
      .where(
        and(
          eq(lawMatter.tenantId, this.options.tenantId),
          eq(lawMatter.matterId, matterId),
        ),
      )
      .limit(1);

    return Boolean(rows[0]?.archivedAt);
  }
}
