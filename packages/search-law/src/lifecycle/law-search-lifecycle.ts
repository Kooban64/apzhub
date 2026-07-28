/**
 * LawSearchLifecycle — publication lifecycle helpers for Law (R12-SEARCH-02).
 */

import type { SearchEntityLifecycleState } from "@apzhub/search-integration";
import { SearchEntityLifecycle } from "@apzhub/search-integration";

import type { LawSearchEntityType } from "../types/entity-types";

export class LawSearchLifecycle {
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
   * Suggests a publication lifecycle from Law domain status signals.
   * Does not schedule transitions.
   */
  suggestFromDomainStatus(
    _entityType: LawSearchEntityType,
    status: string | undefined,
    inactive?: boolean,
  ): SearchEntityLifecycleState {
    if (inactive) return "archived";
    if (!status) return "validated";
    const s = status.toLowerCase();
    if (s === "archived" || s === "closed" || s === "cancelled") {
      return "archived";
    }
    if (s === "draft" || s === "prospect" || s === "not_started") return "draft";
    return "validated";
  }
}
