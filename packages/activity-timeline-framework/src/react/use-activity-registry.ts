import { useCallback, useMemo } from "react";

import type {
  ClientActivityRegistryDiagnostics,
  ClientActivityType,
  ReadOnlyActivityRegistry,
} from "../client";
import type { ActivityRegistrationIssue } from "../types/activity-metadata";
import type { ActivityRegistryDto } from "../server/filter/map-activity-registry-dto";
import { useActivityTimelineContext } from "./activity-timeline-context";

export interface UseActivityRegistryResult {
  readonly isReady: boolean;
  readonly types: readonly ClientActivityType[];
  readonly schemaVersion: ActivityRegistryDto["schemaVersion"];
  readonly frameworkVersion?: string;
  readonly has: (activityTypeId: string) => boolean;
  readonly get: (activityTypeId: string) => ClientActivityType | undefined;
  readonly list: () => readonly ClientActivityType[];
  readonly registry: ReadOnlyActivityRegistry;
  readonly diagnostics: ClientActivityRegistryDiagnostics;
  readonly importErrors: readonly ActivityRegistrationIssue[];
}

/** Access the hydrated read-only activity registry from React context. */
export function useActivityRegistry(): UseActivityRegistryResult {
  const {
    ok,
    activityRegistry,
    activityRegistryDto,
    activityRegistryDiagnostics,
    activityErrors,
    bundleErrors,
  } = useActivityTimelineContext();

  const types = useMemo(() => activityRegistry.list(), [activityRegistry]);

  const has = useCallback(
    (activityTypeId: string) => activityRegistry.has(activityTypeId),
    [activityRegistry],
  );

  const get = useCallback(
    (activityTypeId: string) => activityRegistry.get(activityTypeId),
    [activityRegistry],
  );

  const list = useCallback(() => activityRegistry.list(), [activityRegistry]);

  return {
    isReady: ok,
    types,
    schemaVersion: activityRegistryDto.schemaVersion,
    frameworkVersion: activityRegistryDto.frameworkVersion,
    has,
    get,
    list,
    registry: activityRegistry,
    diagnostics: activityRegistryDiagnostics,
    importErrors: Object.freeze([...bundleErrors, ...activityErrors]),
  };
}
