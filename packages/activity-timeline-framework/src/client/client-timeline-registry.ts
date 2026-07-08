import {
  buildClientTimelineRegistryDiagnostics,
  type ClientTimelineRegistryDiagnostics,
  type ClientTimelineRegistryStatus,
} from "./client-timeline-registry-diagnostics";
import {
  freezeClientTimelineDefinition,
  type ClientTimelineDefinition,
} from "./client-timeline-definition";
import type { ReadOnlyTimelineRegistry } from "./read-only-timeline-registry";
import type { TimelineScopeId } from "../types/timeline-scope";
import type { ClientRegistrySynchronisationState } from "./synchronisation";
import { CLIENT_REGISTRY_HYDRATION_SYNC_STATE } from "./synchronisation";

export interface ClientTimelineRegistrySnapshot {
  readonly timelines: readonly ClientTimelineDefinition[];
  readonly schemaVersion?: ClientTimelineRegistryDiagnostics["schemaVersion"];
  readonly frameworkVersion?: string;
  readonly status?: ClientTimelineRegistryStatus;
  readonly hydratedAt?: string;
  readonly synchronisation?: ClientRegistrySynchronisationState;
}

/**
 * In-memory read-only timeline definition index hydrated from a server DTO.
 * Definitions are deep-frozen — callers cannot mutate registry contents.
 */
export class ClientTimelineRegistry implements ReadOnlyTimelineRegistry {
  private readonly timelines = new Map<string, ClientTimelineDefinition>();
  private readonly diagnosticsSnapshot: ClientTimelineRegistryDiagnostics;

  constructor(snapshot: ClientTimelineRegistrySnapshot = { timelines: [] }) {
    for (const timeline of snapshot.timelines) {
      this.timelines.set(timeline.timelineId, freezeClientTimelineDefinition(timeline));
    }

    this.diagnosticsSnapshot = buildClientTimelineRegistryDiagnostics(
      [...this.timelines.values()],
      {
        status: snapshot.status,
        schemaVersion: snapshot.schemaVersion,
        frameworkVersion: snapshot.frameworkVersion,
        hydratedAt: snapshot.hydratedAt,
        synchronisation:
          snapshot.synchronisation ?? CLIENT_REGISTRY_HYDRATION_SYNC_STATE,
      },
    );
  }

  has(timelineId: string): boolean {
    return this.timelines.has(timelineId);
  }

  get(timelineId: string): ClientTimelineDefinition | undefined {
    const timeline = this.timelines.get(timelineId);
    return timeline ? freezeClientTimelineDefinition(timeline) : undefined;
  }

  list(): readonly ClientTimelineDefinition[] {
    return Object.freeze(
      [...this.timelines.values()]
        .map((timeline) => freezeClientTimelineDefinition(timeline))
        .sort((left, right) => left.timelineId.localeCompare(right.timelineId)),
    );
  }

  listByScope(scope: TimelineScopeId): readonly ClientTimelineDefinition[] {
    return Object.freeze(
      [...this.timelines.values()]
        .filter((timeline) => timeline.scope === scope)
        .map((timeline) => freezeClientTimelineDefinition(timeline))
        .sort((left, right) => left.timelineId.localeCompare(right.timelineId)),
    );
  }

  getDiagnostics(): ClientTimelineRegistryDiagnostics {
    return this.diagnosticsSnapshot;
  }
}

export function createEmptyClientTimelineRegistry(): ReadOnlyTimelineRegistry {
  return new ClientTimelineRegistry({
    timelines: [],
    status: "empty",
  });
}

export function createInvalidClientTimelineRegistry(): ReadOnlyTimelineRegistry {
  return new ClientTimelineRegistry({
    timelines: [],
    status: "invalid",
  });
}
