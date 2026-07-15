/**
 * Synchronous publication hooks for Documents lifecycle events (APZSEARCH-012).
 * No listeners, webhooks, polling, Event Bus, or OCR — call sites invoke explicitly.
 */

import type {
  Document,
  DocumentCategory,
  DocumentCollection,
  DocumentFolder,
  DocumentRelationship,
  DocumentRetention,
  DocumentTag,
  DocumentVersion,
} from "@apzhub/document-contracts";
import type { SearchPublicationResult } from "@apzhub/search-integration";

import type { DocumentsSearchPublicationContext } from "../context/documents-search-publication-context";
import type { DocumentsSearchMappingExtras } from "../mapper/documents-search-entity-mapper";
import type { DocumentsSearchPublisher } from "../publisher/documents-search-publisher";

export type DocumentsSearchLifecycleHooks = {
  onDocumentCreated(
    context: DocumentsSearchPublicationContext,
    document: Document,
    extras?: DocumentsSearchMappingExtras,
  ): SearchPublicationResult;
  onDocumentMetadataUpdated(
    context: DocumentsSearchPublicationContext,
    document: Document,
    extras?: DocumentsSearchMappingExtras,
  ): SearchPublicationResult;
  onDocumentClassified(
    context: DocumentsSearchPublicationContext,
    document: Document,
    extras?: DocumentsSearchMappingExtras,
  ): SearchPublicationResult;
  onDocumentTagged(
    context: DocumentsSearchPublicationContext,
    document: Document,
    extras?: DocumentsSearchMappingExtras,
  ): SearchPublicationResult;
  onDocumentFolderAssigned(
    context: DocumentsSearchPublicationContext,
    document: Document,
    extras?: DocumentsSearchMappingExtras,
  ): SearchPublicationResult;
  onDocumentCollectionAssigned(
    context: DocumentsSearchPublicationContext,
    document: Document,
    extras?: DocumentsSearchMappingExtras,
  ): SearchPublicationResult;
  onDocumentVersionCommitted(
    context: DocumentsSearchPublicationContext,
    version: DocumentVersion,
    parentDocument: Document,
    extras?: DocumentsSearchMappingExtras,
  ): SearchPublicationResult;
  onDocumentArchived(
    context: DocumentsSearchPublicationContext,
    document: Document,
    extras?: DocumentsSearchMappingExtras,
  ): SearchPublicationResult;
  onDocumentRestored(
    context: DocumentsSearchPublicationContext,
    document: Document,
    extras?: DocumentsSearchMappingExtras,
  ): SearchPublicationResult;
  onDocumentDeleted(
    context: DocumentsSearchPublicationContext,
    documentId: string,
  ): SearchPublicationResult;
  onDocumentRetentionChanged(
    context: DocumentsSearchPublicationContext,
    document: Document,
    retention: DocumentRetention,
  ): SearchPublicationResult;
  onGeneratedReportLinked(
    context: DocumentsSearchPublicationContext,
    document: Document,
    extras?: DocumentsSearchMappingExtras,
  ): SearchPublicationResult;
  onDocumentRelationshipChanged(
    context: DocumentsSearchPublicationContext,
    document: Document,
    _relationship: DocumentRelationship,
    extras?: DocumentsSearchMappingExtras,
  ): SearchPublicationResult;

  onDocumentCollectionUpserted(
    context: DocumentsSearchPublicationContext,
    collection: DocumentCollection,
  ): SearchPublicationResult;
  onDocumentCollectionRemoved(
    context: DocumentsSearchPublicationContext,
    collectionId: string,
  ): SearchPublicationResult;
  onDocumentFolderUpserted(
    context: DocumentsSearchPublicationContext,
    folder: DocumentFolder,
  ): SearchPublicationResult;
  onDocumentFolderRemoved(
    context: DocumentsSearchPublicationContext,
    folderId: string,
  ): SearchPublicationResult;
  onDocumentCategoryUpserted(
    context: DocumentsSearchPublicationContext,
    category: DocumentCategory,
  ): SearchPublicationResult;
  onDocumentCategoryRemoved(
    context: DocumentsSearchPublicationContext,
    categoryId: string,
  ): SearchPublicationResult;
  onDocumentTagUpserted(
    context: DocumentsSearchPublicationContext,
    tag: DocumentTag,
  ): SearchPublicationResult;
  onDocumentTagRemoved(
    context: DocumentsSearchPublicationContext,
    tagId: string,
  ): SearchPublicationResult;
};

/**
 * Creates explicit hooks that call publish-or-update based on existence in the sink.
 * No background subscription.
 */
export function createDocumentsSearchLifecycleHooks(
  publisher: DocumentsSearchPublisher,
): DocumentsSearchLifecycleHooks {
  const upsertDocument = (
    context: DocumentsSearchPublicationContext,
    document: Document,
    extras?: DocumentsSearchMappingExtras,
  ): SearchPublicationResult => {
    const input = {
      entityType: "document" as const,
      entity: document,
      extras,
    };
    const prior = publisher.getIntegrationPublisher().getSink().get(document.id);
    if (prior && prior.lifecycleState !== "removed") {
      return publisher.update(context, input);
    }
    return publisher.publish(context, input);
  };

  const upsert = (
    context: DocumentsSearchPublicationContext,
    input: Parameters<DocumentsSearchPublisher["publish"]>[1],
  ): SearchPublicationResult => {
    const entityId = (input.entity as { id: string }).id;
    const prior = publisher.getIntegrationPublisher().getSink().get(entityId);
    if (prior && prior.lifecycleState !== "removed") {
      return publisher.update(context, input);
    }
    return publisher.publish(context, input);
  };

  return {
    onDocumentCreated: (c, d, e) => upsertDocument(c, d, e),
    onDocumentMetadataUpdated: (c, d, e) => upsertDocument(c, d, e),
    onDocumentClassified: (c, d, e) => upsertDocument(c, d, e),
    onDocumentTagged: (c, d, e) => upsertDocument(c, d, e),
    onDocumentFolderAssigned: (c, d, e) => upsertDocument(c, d, e),
    onDocumentCollectionAssigned: (c, d, e) => upsertDocument(c, d, e),
    onDocumentVersionCommitted: (c, version, parent, extras) => {
      // Preferred: refresh primary document with current-version metadata.
      const docResult = upsertDocument(c, parent, {
        ...extras,
        currentVersion: version,
        parentDocument: parent,
      });
      // Optional: publish independent document_version entity for version discovery.
      const versionResult = upsert(c, {
        entityType: "document_version",
        entity: version,
        extras: { ...extras, parentDocument: parent, currentVersion: version },
      });
      return versionResult.ok ? versionResult : docResult;
    },
    // Upsert with status metadata only — search lifecycle "archived" is a separate
    // publisher.lifecycle call (archived → updated is not a valid framework transition).
    onDocumentArchived: (c, d, e) => upsertDocument(c, d, e),
    onDocumentRestored: (c, d, e) => upsertDocument(c, d, e),
    onDocumentDeleted: (c, id) => publisher.remove(c, "document", id),
    onDocumentRetentionChanged: (c, d, retention) =>
      upsertDocument(c, d, { retention }),
    onGeneratedReportLinked: (c, d, e) => upsertDocument(c, d, e),
    onDocumentRelationshipChanged: (c, d, _rel, e) => upsertDocument(c, d, e),

    onDocumentCollectionUpserted: (c, e) =>
      upsert(c, { entityType: "document_collection", entity: e }),
    onDocumentCollectionRemoved: (c, id) =>
      publisher.remove(c, "document_collection", id),
    onDocumentFolderUpserted: (c, e) =>
      upsert(c, { entityType: "document_folder", entity: e }),
    onDocumentFolderRemoved: (c, id) =>
      publisher.remove(c, "document_folder", id),
    onDocumentCategoryUpserted: (c, e) =>
      upsert(c, { entityType: "document_category", entity: e }),
    onDocumentCategoryRemoved: (c, id) =>
      publisher.remove(c, "document_category", id),
    onDocumentTagUpserted: (c, e) =>
      upsert(c, { entityType: "document_tag", entity: e }),
    onDocumentTagRemoved: (c, id) => publisher.remove(c, "document_tag", id),
  };
}
