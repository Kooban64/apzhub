/**
 * Platform Document metadata schema (APZDOCS-001).
 * Canonical metadata only — no binary blob columns.
 */
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const platformDocument = pgTable(
  "platform_document",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    documentType: varchar("document_type", { length: 64 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    classificationCode: varchar("classification_code", { length: 64 }).notNull(),
    classificationLabel: text("classification_label"),
    classificationCustomCode: varchar("classification_custom_code", {
      length: 128,
    }),
    title: text("title").notNull(),
    description: text("description"),
    ownerUserId: text("owner_user_id"),
    creatorUserId: text("creator_user_id").notNull(),
    mimeType: varchar("mime_type", { length: 255 }),
    byteLength: integer("byte_length"),
    checksumAlgorithm: varchar("checksum_algorithm", { length: 32 }),
    checksumHex: varchar("checksum_hex", { length: 128 }),
    storageProviderId: text("storage_provider_id"),
    storageKey: text("storage_key"),
    categoryId: text("category_id"),
    folderId: text("folder_id"),
    retentionId: text("retention_id"),
    currentVersionId: text("current_version_id"),
    tagIdsJson: jsonb("tag_ids_json")
      .$type<string[]>()
      .notNull()
      .default([]),
    permissionsJson: jsonb("permissions_json")
      .$type<Record<string, unknown>[]>()
      .notNull()
      .default([]),
    lifecycleState: varchar("lifecycle_state", { length: 32 }).notNull(),
    lifecycleChangedAt: timestamp("lifecycle_changed_at", {
      withTimezone: true,
    }).notNull(),
    lifecycleChangedBy: text("lifecycle_changed_by").notNull(),
    lifecycleReason: text("lifecycle_reason"),
    templateRefJson: jsonb("template_ref_json").$type<Record<string, unknown>>(),
    generationRefJson: jsonb("generation_ref_json").$type<
      Record<string, unknown>
    >(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    revision: integer("revision").notNull().default(1),
  },
  (table) => [
    uniqueIndex("platform_document_tenant_id_uidx").on(table.tenantId, table.id),
  ],
);

export const platformDocumentMetadata = pgTable("platform_document_metadata", {
  id: text("id").primaryKey(),
  documentId: text("document_id").notNull(),
  tenantId: text("tenant_id").notNull(),
  organisationId: text("organisation_id"),
  title: text("title").notNull(),
  description: text("description"),
  mimeType: varchar("mime_type", { length: 255 }),
  byteLength: integer("byte_length"),
  language: varchar("language", { length: 32 }),
  customJson: jsonb("custom_json")
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const platformDocumentTag = pgTable(
  "platform_document_tag",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("platform_document_tag_tenant_name_uidx").on(
      table.tenantId,
      table.name,
    ),
  ],
);

export const platformDocumentCategory = pgTable("platform_document_category", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  parentCategoryId: text("parent_category_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const platformDocumentRelationship = pgTable(
  "platform_document_relationship",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    sourceDocumentId: text("source_document_id").notNull(),
    targetDocumentId: text("target_document_id"),
    kind: varchar("kind", { length: 64 }).notNull(),
    referenceProduct: varchar("reference_product", { length: 64 }),
    referenceExternalId: text("reference_external_id"),
    referenceLabel: text("reference_label"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: text("created_by").notNull(),
  },
);

export const platformDocumentRetention = pgTable("platform_document_retention", {
  id: text("id").primaryKey(),
  documentId: text("document_id").notNull(),
  tenantId: text("tenant_id").notNull(),
  policyKey: text("policy_key").notNull(),
  retainUntil: timestamp("retain_until", { withTimezone: true }),
  legalHold: boolean("legal_hold").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const platformDocumentAudit = pgTable("platform_document_audit", {
  id: text("id").primaryKey(),
  documentId: text("document_id").notNull(),
  tenantId: text("tenant_id").notNull(),
  action: text("action").notNull(),
  actorUserId: text("actor_user_id").notNull(),
  correlationId: text("correlation_id"),
  detailsJson: jsonb("details_json")
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Immutable content version metadata (APZDOCS-002) — no binary columns. */
export const platformDocumentVersion = pgTable(
  "platform_document_version",
  {
    id: text("id").primaryKey(),
    documentId: text("document_id").notNull(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    versionNumber: integer("version_number").notNull(),
    mimeType: varchar("mime_type", { length: 255 }).notNull(),
    byteLength: integer("byte_length").notNull(),
    checksumAlgorithm: varchar("checksum_algorithm", { length: 32 }).notNull(),
    checksumHex: varchar("checksum_hex", { length: 128 }).notNull(),
    storageProviderId: text("storage_provider_id").notNull(),
    storageKey: text("storage_key").notNull(),
    storageStatus: varchar("storage_status", { length: 64 }).notNull(),
    etag: text("etag"),
    encryptionKeyRef: text("encryption_key_ref"),
    immutable: boolean("immutable").notNull().default(true),
    displayFilename: text("display_filename"),
    declaredMimeType: varchar("declared_mime_type", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdBy: text("created_by").notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    revision: integer("revision").notNull().default(1),
  },
  (table) => [
    uniqueIndex("platform_document_version_doc_num_uidx").on(
      table.tenantId,
      table.documentId,
      table.versionNumber,
    ),
  ],
);

/** Storage object metadata — opaque keys only, never credentials or blobs. */
export const platformDocumentStorageObject = pgTable(
  "platform_document_storage_object",
  {
    id: text("id").primaryKey(),
    tenantId: text("tenant_id").notNull(),
    organisationId: text("organisation_id"),
    documentId: text("document_id").notNull(),
    versionId: text("version_id").notNull(),
    providerId: text("provider_id").notNull(),
    storageKey: text("storage_key").notNull(),
    byteLength: integer("byte_length").notNull(),
    mimeType: varchar("mime_type", { length: 255 }).notNull(),
    checksumHex: varchar("checksum_hex", { length: 128 }).notNull(),
    checksumAlgorithm: varchar("checksum_algorithm", { length: 32 }).notNull(),
    status: varchar("status", { length: 64 }).notNull(),
    etag: text("etag"),
    encryptionKeyRef: text("encryption_key_ref"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    revision: integer("revision").notNull().default(1),
  },
);

export const platformDocumentSchema = {
  platformDocument,
  platformDocumentMetadata,
  platformDocumentTag,
  platformDocumentCategory,
  platformDocumentRelationship,
  platformDocumentRetention,
  platformDocumentAudit,
  platformDocumentVersion,
  platformDocumentStorageObject,
};
