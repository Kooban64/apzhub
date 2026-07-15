/**
 * ProjectsSearchLifecycle — publication lifecycle helpers for Projects (APZSEARCH-010).
 */

import type { SearchEntityLifecycleState } from "@apzhub/search-integration";
import { SearchEntityLifecycle } from "@apzhub/search-integration";

import type { ProjectsSearchEntityType } from "../types/entity-types";

export class ProjectsSearchLifecycle {
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
   * Suggests a publication lifecycle from Projects domain status signals.
   * Does not schedule transitions.
   */
  suggestFromDomainStatus(
    entityType: ProjectsSearchEntityType,
    status: string | undefined,
    archived?: boolean,
  ): SearchEntityLifecycleState {
    if (archived) return "archived";
    if (!status) return "validated";
    const s = status.toLowerCase();
    if (s === "archived" || s === "cancelled") return "archived";
    if (s === "draft" || s === "planned") return "draft";
    if (entityType === "project" && s === "completed") return "archived";
    return "validated";
  }
}
