import { useCallback, useMemo } from "react";

import type {
  ClientTimelineDefinition,
  ClientTimelineRegistryDiagnostics,
  ReadOnlyTimelineRegistry,
} from "../client";
import type { TimelineRegistrationIssue } from "../types/timeline-metadata";
import type { TimelineRegistryDto } from "../server/filter/map-timeline-registry-dto";
import type { TimelineScopeId } from "../types/timeline-scope";
import { useActivityTimelineContext } from "./activity-timeline-context";

export interface UseTimelineRegistryResult {
  readonly isReady: boolean;
  readonly timelines: readonly ClientTimelineDefinition[];
  readonly schemaVersion: TimelineRegistryDto["schemaVersion"];
  readonly frameworkVersion?: string;
  readonly has: (timelineId: string) => boolean;
  readonly get: (timelineId: string) => ClientTimelineDefinition | undefined;
  readonly list: () => readonly ClientTimelineDefinition[];
  readonly listByScope: (scope: TimelineScopeId) => readonly ClientTimelineDefinition[];
  readonly registry: ReadOnlyTimelineRegistry;
  readonly diagnostics: ClientTimelineRegistryDiagnostics;
  readonly importErrors: readonly TimelineRegistrationIssue[];
}

/** Access the hydrated read-only timeline registry from React context. */
export function useTimelineRegistry(): UseTimelineRegistryResult {
  const {
    ok,
    timelineRegistry,
    timelineRegistryDto,
    timelineRegistryDiagnostics,
    timelineErrors,
    bundleErrors,
  } = useActivityTimelineContext();

  const timelines = useMemo(() => timelineRegistry.list(), [timelineRegistry]);

  const has = useCallback(
    (timelineId: string) => timelineRegistry.has(timelineId),
    [timelineRegistry],
  );

  const get = useCallback(
    (timelineId: string) => timelineRegistry.get(timelineId),
    [timelineRegistry],
  );

  const list = useCallback(() => timelineRegistry.list(), [timelineRegistry]);

  const listByScope = useCallback(
    (scope: TimelineScopeId) => timelineRegistry.listByScope(scope),
    [timelineRegistry],
  );

  return {
    isReady: ok,
    timelines,
    schemaVersion: timelineRegistryDto.schemaVersion,
    frameworkVersion: timelineRegistryDto.frameworkVersion,
    has,
    get,
    list,
    listByScope,
    registry: timelineRegistry,
    diagnostics: timelineRegistryDiagnostics,
    importErrors: Object.freeze([...bundleErrors, ...timelineErrors]),
  };
}
