/**
 * DocumentsSearchLifecycle — publication lifecycle helpers for Documents (APZSEARCH-012).
 */

import type { DocumentStatus } from "@apzhub/document-contracts";
import type { SearchEntityLifecycleState } from "@apzhub/search-integration";
import { SearchEntityLifecycle } from "@apzhub/search-integration";

import type { DocumentsSearchEntityType } from "../types/entity-types";

export class DocumentsSearchLifecycle {
  private readonly base = new SearchEntityLifecycle();

  canTransition(
    from: SearchEntityLifecycleState,
    to: SearchEntityLifecycleState,
  ): boolean {
    return this.base.canTransition(from, to);
  }

  assertTransition(
    from: SearchEntityLifecycleState,
    to: SearchEntityLifecycleState,
  ): void {
    this.base.assertTransition(from, to);
  }

  /**
   * Suggests a publication lifecycle from DocumentStatus.
   * Draft publish is allowed (validator does not block draft).
   * deleted/expired → removed for suggest only — actual removal uses remove op.
   */
  suggestFromDocumentStatus(
    status: DocumentStatus | string | undefined,
  ): SearchEntityLifecycleState {
    if (!status) return "validated";
    const s = status.toLowerCase();
    if (s === "draft") return "draft";
    if (s === "active" || s === "restored") return "validated";
    if (s === "archived" || s === "retained") return "archived";
    if (s === "deleted" || s === "expired") return "removed";
    return "validated";
  }

  /**
   * Entity-type-aware suggest (versions are always immutable → validated when active).
   */
  suggestFromDomainStatus(
    entityType: DocumentsSearchEntityType,
    status: string | undefined,
  ): SearchEntityLifecycleState {
    if (entityType === "document_version") {
      if (status === "removed" || status === "deleted") return "removed";
      return "validated";
    }
    return this.suggestFromDocumentStatus(status);
  }
}
