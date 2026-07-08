import type { ClientTimelineDefinition } from "./client-timeline-definition";
import type { ClientTimelineRegistryDiagnostics } from "./client-timeline-registry-diagnostics";
import type { TimelineScopeId } from "../types/timeline-scope";

/**
 * Read-only timeline definition index for browser consumers.
 *
 * The server remains authoritative — clients must not register timelines.
 */
export interface ReadOnlyTimelineRegistry {
  has(timelineId: string): boolean;
  get(timelineId: string): ClientTimelineDefinition | undefined;
  list(): readonly ClientTimelineDefinition[];
  listByScope(scope: TimelineScopeId): readonly ClientTimelineDefinition[];
  getDiagnostics(): ClientTimelineRegistryDiagnostics;
}
