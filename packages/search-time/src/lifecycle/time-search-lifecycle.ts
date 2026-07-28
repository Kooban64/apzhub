/**
 * TimeSearchLifecycle — publication lifecycle helpers for Time (R12-SEARCH-01).
 */

import type { SearchEntityLifecycleState } from "@apzhub/search-integration";
import { SearchEntityLifecycle } from "@apzhub/search-integration";

import type { TimeSearchEntityType } from "../types/entity-types";

export class TimeSearchLifecycle {
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
   * Suggests a publication lifecycle from Time domain status signals.
   * Does not schedule transitions.
   */
  suggestFromDomainStatus(
    _entityType: TimeSearchEntityType,
    status: string | undefined,
    inactive?: boolean,
  ): SearchEntityLifecycleState {
    if (inactive) return "archived";
    if (!status) return "validated";
    const s = status.toLowerCase();
    if (s === "archived" || s === "stopped") {
      return s === "archived" ? "archived" : "validated";
    }
    if (s === "draft" || s === "new") return "draft";
    if (s === "running" || s === "active") return "validated";
    return "validated";
  }
}
