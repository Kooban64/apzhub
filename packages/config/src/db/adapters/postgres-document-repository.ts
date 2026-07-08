import type { Document } from "@apzhub/legal-business-core";
import { and, eq, isNull } from "drizzle-orm";

import { createDb, type DatabaseExecutor } from "../client";
import { lawDocument, lawMatter } from "../legal-schema";
import { documentToRow, rowToDocument } from "../law-mappers/document-row-mapper";
import {
  createDocumentOutboxDraft,
  type PostgresOutboxEventDraft,
} from "../law-mappers/outbox-drafts";

export interface PostgresDocumentListCriteria {
  readonly query?: string;
  readonly matterId?: string;
  readonly clientId?: string;
  readonly documentStatus?: Document["documentStatus"] | "all";
  readonly documentCategoryId?: string;
  readonly folderId?: string;
}

export interface PostgresDocumentRepositoryContract {
  list(criteria?: PostgresDocumentListCriteria): readonly Document[];
  getById(documentId: string): Document | undefined;
  create(document: Document): Document;
  update(documentId: string, document: Document): Document | undefined;
  softArchive(documentId: string): Document | undefined;
  count(includeArchived?: boolean): number;
  isSoftArchived(documentId: string): boolean;
}

export interface PostgresDocumentRepositoryOptions {
  readonly tenantId: string;
  readonly db?: DatabaseExecutor;
  readonly runSync: <T>(promise: Promise<T>) => T;
  readonly runInTransaction: <T>(
    operation: (db: DatabaseExecutor) => Promise<T>,
  ) => Promise<T>;
  readonly matchesCriteria: (
    document: Document,
    criteria?: PostgresDocumentListCriteria,
  ) => boolean;
  readonly sortDocuments: (documents: readonly Document[]) => Document[];
  readonly onOutboxEvent?: (
    db: DatabaseExecutor,
    draft: PostgresOutboxEventDraft,
  ) => Promise<void>;
}

/** PostgreSQL-backed document repository with tenant isolation (LAW-012-04). */
export class PostgresDocumentRepository implements PostgresDocumentRepositoryContract {
  constructor(private readonly options: PostgresDocumentRepositoryOptions) {}

  private get db() {
    return this.options.db ?? createDb();
  }

  list(criteria?: PostgresDocumentListCriteria): readonly Document[] {
    return this.options.runSync(this.listAsync(criteria));
  }

  getById(documentId: string): Document | undefined {
    return this.options.runSync(this.getByIdAsync(documentId));
  }

  create(document: Document): Document {
    this.options.runSync(
      this.options.runInTransaction(async (tx) => {
        await this.assertMatterExists(tx, document.matterId);
        await tx
          .insert(lawDocument)
          .values(documentToRow(document, this.options.tenantId));
        await this.options.onOutboxEvent?.(
          tx,
          createDocumentOutboxDraft("legal.document.created", document),
        );
      }),
    );
    return document;
  }

  update(documentId: string, document: Document): Document | undefined {
    return this.options.runSync(this.updateAsync(documentId, document));
  }

  softArchive(documentId: string): Document | undefined {
    return this.options.runSync(this.softArchiveAsync(documentId));
  }

  count(includeArchived = false): number {
    return this.options.runSync(this.countAsync(includeArchived));
  }

  isSoftArchived(documentId: string): boolean {
    return this.options.runSync(this.isSoftArchivedAsync(documentId));
  }

  private async assertMatterExists(
    db: DatabaseExecutor,
    matterId: string,
  ): Promise<void> {
    const rows = await db
      .select({ matterId: lawMatter.matterId })
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
      throw new Error(`Matter not found for tenant: ${matterId}`);
    }
  }

  private async listAsync(
    criteria?: PostgresDocumentListCriteria,
  ): Promise<readonly Document[]> {
    const rows = await this.db
      .select()
      .from(lawDocument)
      .where(
        and(
          eq(lawDocument.tenantId, this.options.tenantId),
          isNull(lawDocument.archivedAt),
        ),
      );

    const documents = rows
      .map(rowToDocument)
      .filter((document) => this.options.matchesCriteria(document, criteria));
    return this.options.sortDocuments(documents);
  }

  private async getByIdAsync(documentId: string): Promise<Document | undefined> {
    const rows = await this.db
      .select()
      .from(lawDocument)
      .where(
        and(
          eq(lawDocument.tenantId, this.options.tenantId),
          eq(lawDocument.documentId, documentId),
          isNull(lawDocument.archivedAt),
        ),
      )
      .limit(1);

    const row = rows[0];
    return row ? rowToDocument(row) : undefined;
  }

  private async updateAsync(
    documentId: string,
    document: Document,
  ): Promise<Document | undefined> {
    return this.options.runInTransaction(async (tx) => {
      await this.assertMatterExists(tx, document.matterId);

      const rows = await tx
        .select()
        .from(lawDocument)
        .where(
          and(
            eq(lawDocument.tenantId, this.options.tenantId),
            eq(lawDocument.documentId, documentId),
            isNull(lawDocument.archivedAt),
          ),
        )
        .limit(1);

      if (!rows[0]) {
        return undefined;
      }

      const result = await tx
        .update(lawDocument)
        .set({
          ...documentToRow(document, this.options.tenantId),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(lawDocument.tenantId, this.options.tenantId),
            eq(lawDocument.documentId, documentId),
          ),
        )
        .returning();

      const updated = result[0] ? rowToDocument(result[0]) : undefined;
      if (updated) {
        await this.options.onOutboxEvent?.(
          tx,
          createDocumentOutboxDraft("legal.document.updated", updated),
        );
      }

      return updated;
    });
  }

  private async softArchiveAsync(documentId: string): Promise<Document | undefined> {
    return this.options.runInTransaction(async (tx) => {
      const rows = await tx
        .select()
        .from(lawDocument)
        .where(
          and(
            eq(lawDocument.tenantId, this.options.tenantId),
            eq(lawDocument.documentId, documentId),
            isNull(lawDocument.archivedAt),
          ),
        )
        .limit(1);

      const existing = rows[0];
      if (!existing) {
        return undefined;
      }

      const now = new Date();
      const result = await tx
        .update(lawDocument)
        .set({
          documentStatus: "archived",
          archivedAt: now,
          updatedAt: now,
        })
        .where(
          and(
            eq(lawDocument.tenantId, this.options.tenantId),
            eq(lawDocument.documentId, documentId),
          ),
        )
        .returning();

      const archived = result[0] ? rowToDocument(result[0]) : undefined;
      if (archived) {
        await this.options.onOutboxEvent?.(
          tx,
          createDocumentOutboxDraft("legal.document.archived", archived),
        );
      }

      return archived;
    });
  }

  private async countAsync(includeArchived: boolean): Promise<number> {
    const rows = await this.db
      .select()
      .from(lawDocument)
      .where(eq(lawDocument.tenantId, this.options.tenantId));

    if (includeArchived) {
      return rows.length;
    }

    return rows.filter((row) => row.archivedAt === null).length;
  }

  private async isSoftArchivedAsync(documentId: string): Promise<boolean> {
    const rows = await this.db
      .select({ archivedAt: lawDocument.archivedAt })
      .from(lawDocument)
      .where(
        and(
          eq(lawDocument.tenantId, this.options.tenantId),
          eq(lawDocument.documentId, documentId),
        ),
      )
      .limit(1);

    return Boolean(rows[0]?.archivedAt);
  }
}
