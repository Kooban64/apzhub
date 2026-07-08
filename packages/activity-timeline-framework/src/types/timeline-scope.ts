import type { ActivityCategory } from "./activity-category";

/** Default personal timeline scope — canonical identifier (SPR-007 locked decision). */
export const TIMELINE_SCOPE_PERSONAL = "timeline.personal" as const;

/** Reserved scope identifiers — documentation and registry stubs only until later stories. */
export const TIMELINE_SCOPE_TEAM = "timeline.team" as const;
export const TIMELINE_SCOPE_ORGANIZATION = "timeline.organization" as const;
export const TIMELINE_SCOPE_SYSTEM = "timeline.system" as const;

export const RESERVED_TIMELINE_SCOPE_IDS = [
  TIMELINE_SCOPE_PERSONAL,
  TIMELINE_SCOPE_TEAM,
  TIMELINE_SCOPE_ORGANIZATION,
  TIMELINE_SCOPE_SYSTEM,
] as const;

export type TimelineScopeId = (typeof RESERVED_TIMELINE_SCOPE_IDS)[number];

/** Timeline scope descriptor — registry population deferred to AT-004. */
export interface TimelineScope {
  readonly id: TimelineScopeId;
  readonly label: string;
  readonly status: "active" | "planned";
}

/** Query input for timeline listing and activity service reads. */
export interface TimelineQuery {
  readonly scopeId: TimelineScopeId;
  readonly category?: ActivityCategory;
  readonly activityTypeId?: string;
  readonly limit?: number;
  readonly cursor?: string;
}

/** Timeline query result envelope — activity ids for the requested scope. */
export interface TimelineResult {
  readonly scopeId: TimelineScopeId;
  readonly items: readonly string[];
  readonly status: "ok" | "empty";
}
