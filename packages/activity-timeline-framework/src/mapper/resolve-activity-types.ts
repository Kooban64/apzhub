import type { ActivityRegistry } from "../registry/activity-registry";
import type { ActivityDescriptor } from "../types/activity-descriptor";
import { matchesActivityEventPattern } from "./match-activity-event-pattern";

export interface ResolveActivityTypesOptions {
  readonly includePlanned?: boolean;
  readonly includeDisabled?: boolean;
}

function isActiveActivityType(
  descriptor: ActivityDescriptor,
  options: ResolveActivityTypesOptions,
): boolean {
  const status = descriptor.status ?? "active";

  if (status === "disabled") {
    return options.includeDisabled ?? false;
  }

  if (status === "planned") {
    return options.includePlanned ?? false;
  }

  return true;
}

/** Resolves activity types whose sourceEventPattern matches the published event id. */
export function resolveActivityTypes(
  registry: ActivityRegistry,
  eventId: string,
  options: ResolveActivityTypesOptions = {},
): readonly ActivityDescriptor[] {
  const matches: ActivityDescriptor[] = [];

  for (const descriptor of registry.list()) {
    if (!isActiveActivityType(descriptor, options)) {
      continue;
    }

    if (matchesActivityEventPattern(descriptor.sourceEventPattern, eventId)) {
      matches.push(descriptor);
    }
  }

  return Object.freeze(
    [...matches].sort((left, right) =>
      left.activityTypeId.localeCompare(right.activityTypeId),
    ),
  );
}
