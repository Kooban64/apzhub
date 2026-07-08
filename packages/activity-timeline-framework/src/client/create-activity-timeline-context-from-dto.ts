import type { ActivityRegistrationIssue } from "../types/activity-metadata";
import type { TimelineRegistrationIssue } from "../types/timeline-metadata";
import type { ActivityRegistryDto } from "../server/filter/map-activity-registry-dto";
import type { TimelineRegistryDto } from "../server/filter/map-timeline-registry-dto";
import {
  validateActivityTimelineHydrationBundle,
  type ActivityTimelineHydrationBundle,
  type ActivityTimelineHydrationBundleValidationIssue,
} from "./activity-timeline-hydration-bundle";
import {
  buildActivityTimelineHydrationDiagnostics,
  type ActivityTimelineHydrationDiagnostics,
} from "./activity-timeline-hydration-diagnostics";
import type { ClientActivityRegistryDiagnostics } from "./client-activity-registry-diagnostics";
import type { ClientTimelineRegistryDiagnostics } from "./client-timeline-registry-diagnostics";
import {
  createInvalidClientActivityRegistry,
  createEmptyClientActivityRegistry,
} from "./client-activity-registry";
import {
  createInvalidClientTimelineRegistry,
  createEmptyClientTimelineRegistry,
} from "./client-timeline-registry";
import {
  createActivityRegistryFromDto,
  createEmptyActivityRegistryDto,
} from "./create-activity-registry-from-dto";
import {
  createTimelineRegistryFromDto,
  createEmptyTimelineRegistryDto,
} from "./create-timeline-registry-from-dto";
import type { ReadOnlyActivityRegistry } from "./read-only-activity-registry";
import type { ReadOnlyTimelineRegistry } from "./read-only-timeline-registry";
import type { ClientRegistrySynchronisationState } from "./synchronisation";

export interface CreateActivityTimelineContextFromDtoOptions {
  readonly validate?: boolean;
  readonly hydratedAt?: string;
  readonly synchronisation?: ClientRegistrySynchronisationState;
}

export interface ActivityTimelineClientContext {
  readonly ok: boolean;
  readonly activityRegistry: ReadOnlyActivityRegistry;
  readonly timelineRegistry: ReadOnlyTimelineRegistry;
  readonly activityRegistryDto: ActivityRegistryDto;
  readonly timelineRegistryDto: TimelineRegistryDto;
  readonly diagnostics: ActivityTimelineHydrationDiagnostics;
  readonly activityRegistryDiagnostics: ClientActivityRegistryDiagnostics;
  readonly timelineRegistryDiagnostics: ClientTimelineRegistryDiagnostics;
  readonly activityErrors: readonly ActivityRegistrationIssue[];
  readonly timelineErrors: readonly TimelineRegistrationIssue[];
  readonly bundleErrors: readonly ActivityTimelineHydrationBundleValidationIssue[];
}

export type CreateActivityTimelineContextFromDtoResult = ActivityTimelineClientContext;

/**
 * Hydrate read-only client registries from a server ActivityTimelineHydrationBundle.
 *
 * No partial hydration — invalid activity or timeline DTOs produce invalid shells for both.
 * Activity Service remains server/runtime owned; no ActivityDocuments are hydrated here.
 */
export function createActivityTimelineContextFromDto(
  bundle: unknown,
  options: CreateActivityTimelineContextFromDtoOptions = {},
): CreateActivityTimelineContextFromDtoResult {
  const validate = options.validate ?? true;
  const hydratedAt = options.hydratedAt ?? new Date().toISOString();

  if (!validate) {
    const payload = bundle as ActivityTimelineHydrationBundle;
    const synchronisation = options.synchronisation ?? payload.synchronisation;
    const activityResult = createActivityRegistryFromDto(payload.activityRegistry, {
      validate: false,
      hydratedAt,
      synchronisation,
    });
    const timelineResult = createTimelineRegistryFromDto(payload.timelineRegistry, {
      validate: false,
      hydratedAt,
      synchronisation,
    });
    const ok = activityResult.ok && timelineResult.ok;

    return buildContextResult({
      ok,
      activityResult,
      timelineResult,
      frameworkVersion: payload.frameworkVersion,
      hydratedAt,
      synchronisation,
      bundleErrors: [],
    });
  }

  const bundleValidation = validateActivityTimelineHydrationBundle(bundle);
  if (!bundleValidation.ok) {
    return buildFailedContext({
      activityRegistryDto: bundleValidation.bundle.activityRegistry,
      timelineRegistryDto: bundleValidation.bundle.timelineRegistry,
      bundleErrors: bundleValidation.errors,
      hydratedAt,
      synchronisation: options.synchronisation,
    });
  }

  const validatedBundle = bundleValidation.bundle;
  const synchronisation = options.synchronisation ?? validatedBundle.synchronisation;

  const activityResult = createActivityRegistryFromDto(
    validatedBundle.activityRegistry,
    {
      hydratedAt,
      synchronisation,
    },
  );
  const timelineResult = createTimelineRegistryFromDto(
    validatedBundle.timelineRegistry,
    {
      hydratedAt,
      synchronisation,
    },
  );

  if (!activityResult.ok || !timelineResult.ok) {
    return buildFailedContext({
      activityRegistryDto: activityResult.dto,
      timelineRegistryDto: timelineResult.dto,
      activityErrors: activityResult.errors,
      timelineErrors: timelineResult.errors,
      bundleErrors: [],
      hydratedAt,
      synchronisation,
      frameworkVersion: validatedBundle.frameworkVersion,
    });
  }

  return buildContextResult({
    ok: true,
    activityResult,
    timelineResult,
    frameworkVersion: validatedBundle.frameworkVersion,
    hydratedAt,
    synchronisation,
    bundleErrors: [],
  });
}

function buildFailedContext(input: {
  readonly activityRegistryDto: ActivityRegistryDto;
  readonly timelineRegistryDto: TimelineRegistryDto;
  readonly activityErrors?: readonly ActivityRegistrationIssue[];
  readonly timelineErrors?: readonly TimelineRegistrationIssue[];
  readonly bundleErrors: readonly ActivityTimelineHydrationBundleValidationIssue[];
  readonly frameworkVersion?: string;
  readonly hydratedAt: string;
  readonly synchronisation?: ClientRegistrySynchronisationState;
}): ActivityTimelineClientContext {
  const activityRegistry = createInvalidClientActivityRegistry();
  const timelineRegistry = createInvalidClientTimelineRegistry();

  return {
    ok: false,
    activityRegistry,
    timelineRegistry,
    activityRegistryDto: input.activityRegistryDto,
    timelineRegistryDto: input.timelineRegistryDto,
    activityRegistryDiagnostics: activityRegistry.getDiagnostics(),
    timelineRegistryDiagnostics: timelineRegistry.getDiagnostics(),
    activityErrors: Object.freeze([...(input.activityErrors ?? [])]),
    timelineErrors: Object.freeze([...(input.timelineErrors ?? [])]),
    bundleErrors: Object.freeze([...input.bundleErrors]),
    diagnostics: buildActivityTimelineHydrationDiagnostics({
      ok: false,
      activityDiagnostics: activityRegistry.getDiagnostics(),
      timelineDiagnostics: timelineRegistry.getDiagnostics(),
      frameworkVersion: input.frameworkVersion,
      hydratedAt: input.hydratedAt,
      synchronisation: input.synchronisation,
    }),
  };
}

function buildContextResult(input: {
  readonly ok: boolean;
  readonly activityResult: ReturnType<typeof createActivityRegistryFromDto>;
  readonly timelineResult: ReturnType<typeof createTimelineRegistryFromDto>;
  readonly frameworkVersion?: string;
  readonly hydratedAt: string;
  readonly synchronisation?: ClientRegistrySynchronisationState;
  readonly bundleErrors: readonly ActivityTimelineHydrationBundleValidationIssue[];
}): ActivityTimelineClientContext {
  const activityRegistry = input.ok
    ? input.activityResult.registry
    : createInvalidClientActivityRegistry();
  const timelineRegistry = input.ok
    ? input.timelineResult.registry
    : createInvalidClientTimelineRegistry();

  return {
    ok: input.ok,
    activityRegistry,
    timelineRegistry,
    activityRegistryDto: input.activityResult.dto,
    timelineRegistryDto: input.timelineResult.dto,
    activityRegistryDiagnostics: activityRegistry.getDiagnostics(),
    timelineRegistryDiagnostics: timelineRegistry.getDiagnostics(),
    activityErrors: input.activityResult.errors,
    timelineErrors: input.timelineResult.errors,
    bundleErrors: input.bundleErrors,
    diagnostics: buildActivityTimelineHydrationDiagnostics({
      ok: input.ok,
      activityDiagnostics: activityRegistry.getDiagnostics(),
      timelineDiagnostics: timelineRegistry.getDiagnostics(),
      frameworkVersion: input.frameworkVersion,
      hydratedAt: input.hydratedAt,
      synchronisation: input.synchronisation,
    }),
  };
}

export function createEmptyActivityTimelineClientContext(): ActivityTimelineClientContext {
  const activityRegistry = createEmptyClientActivityRegistry();
  const timelineRegistry = createEmptyClientTimelineRegistry();

  return {
    ok: true,
    activityRegistry,
    timelineRegistry,
    activityRegistryDto: createEmptyActivityRegistryDto(),
    timelineRegistryDto: createEmptyTimelineRegistryDto(),
    activityRegistryDiagnostics: activityRegistry.getDiagnostics(),
    timelineRegistryDiagnostics: timelineRegistry.getDiagnostics(),
    activityErrors: [],
    timelineErrors: [],
    bundleErrors: [],
    diagnostics: buildActivityTimelineHydrationDiagnostics({
      ok: true,
      activityDiagnostics: activityRegistry.getDiagnostics(),
      timelineDiagnostics: timelineRegistry.getDiagnostics(),
    }),
  };
}
