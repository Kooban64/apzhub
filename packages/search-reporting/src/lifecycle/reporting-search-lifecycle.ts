/**
 * ReportingSearchLifecycle — publication lifecycle helpers for Reporting (APZSEARCH-014).
 */

import type { SearchEntityLifecycleState } from "@apzhub/search-integration";
import { SearchEntityLifecycle } from "@apzhub/search-integration";

import type { ReportingSearchEntityType } from "../types/entity-types";

export class ReportingSearchLifecycle {
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
   * Suggests a publication lifecycle from Reporting domain status markers.
   * Preview generations → draft; archived → archived; deleted → removed.
   */
  suggestFromReportingStatus(status: string | undefined): SearchEntityLifecycleState {
    if (!status) return "validated";
    const s = status.toLowerCase();
    if (s === "preview" || s === "draft") return "draft";
    if (s === "active" || s === "published" || s === "ready") return "validated";
    if (s === "archived") return "archived";
    if (s === "deleted" || s === "removed" || s === "expired") return "removed";
    return "validated";
  }

  suggestFromDomainStatus(
    entityType: ReportingSearchEntityType,
    status: string | undefined,
  ): SearchEntityLifecycleState {
    if (
      entityType === "report_generation" ||
      entityType === "report_generation_metadata" ||
      entityType === "report_output_metadata"
    ) {
      if (status === "preview") return "draft";
      if (status === "archived") return "archived";
      if (status === "deleted" || status === "removed") return "removed";
      return "validated";
    }
    return this.suggestFromReportingStatus(status);
  }
}
