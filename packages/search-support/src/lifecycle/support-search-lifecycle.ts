/**
 * SupportSearchLifecycle — publication lifecycle helpers for Support (APZSEARCH-011).
 */

import type { SearchEntityLifecycleState } from "@apzhub/search-integration";
import { SearchEntityLifecycle } from "@apzhub/search-integration";

import type { SupportSearchEntityType } from "../types/entity-types";

export class SupportSearchLifecycle {
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
   * Suggests a publication lifecycle from Support domain status signals.
   * Does not schedule transitions.
   */
  suggestFromDomainStatus(
    entityType: SupportSearchEntityType,
    status: string | undefined,
    inactive?: boolean,
  ): SearchEntityLifecycleState {
    if (inactive) return "archived";
    if (!status) return "validated";
    const s = status.toLowerCase();
    if (s === "archived" || s === "closed" || s === "merged" || s === "false") {
      return "archived";
    }
    if (s === "draft" || s === "new") return "draft";
    if (entityType === "support_request" && s === "pending") return "validated";
    return "validated";
  }
}
