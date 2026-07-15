/**
 * TestingSearchLifecycle — publication lifecycle helpers for Testing (APZSEARCH-013).
 */

import type { SearchEntityLifecycleState } from "@apzhub/search-integration";
import { SearchEntityLifecycle } from "@apzhub/search-integration";

import type { TestingSearchEntityType } from "../types/entity-types";

export class TestingSearchLifecycle {
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
   * Suggests a publication lifecycle from Testing domain status strings.
   */
  suggestFromDomainStatus(
    status: string | undefined,
  ): SearchEntityLifecycleState {
    if (!status) return "validated";
    const s = status.toLowerCase();
    if (
      s === "draft" ||
      s === "pending" ||
      s === "queued" ||
      s === "planned"
    ) {
      return "draft";
    }
    if (
      s === "active" ||
      s === "passed" ||
      s === "approved" ||
      s === "certified" ||
      s === "ready" ||
      s === "completed" ||
      s === "released" ||
      s === "published"
    ) {
      return "validated";
    }
    if (s === "archived" || s === "retired" || s === "expired") {
      return "archived";
    }
    if (
      s === "deleted" ||
      s === "removed" ||
      s === "cancelled" ||
      s === "withdrawn" ||
      s === "rejected"
    ) {
      return "removed";
    }
    return "validated";
  }

  /**
   * Entity-type-aware suggest (immutable snapshots stay validated when active).
   */
  suggestFromEntityStatus(
    entityType: TestingSearchEntityType,
    status: string | undefined,
  ): SearchEntityLifecycleState {
    if (
      entityType === "historical_snapshot" ||
      entityType === "release_manifest" ||
      entityType === "report_metadata"
    ) {
      if (status === "removed" || status === "deleted") return "removed";
      return "validated";
    }
    return this.suggestFromDomainStatus(status);
  }
}
