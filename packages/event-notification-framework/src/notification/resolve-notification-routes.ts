import { matchesEventPattern } from "../event/match-event-pattern";
import type {
  NotificationDescriptor,
  NotificationRegistry,
} from "./notification-descriptor";

export interface ResolveNotificationRoutesOptions {
  readonly includePlanned?: boolean;
  readonly includeDisabled?: boolean;
}

function isActiveRoute(
  descriptor: NotificationDescriptor,
  options: ResolveNotificationRoutesOptions,
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

/** Resolves notification routes whose eventPattern matches the published event id. */
export function resolveNotificationRoutes(
  registry: NotificationRegistry,
  eventId: string,
  options: ResolveNotificationRoutesOptions = {},
): readonly NotificationDescriptor[] {
  const matches: NotificationDescriptor[] = [];

  for (const descriptor of registry.list()) {
    if (!isActiveRoute(descriptor, options)) {
      continue;
    }

    if (matchesEventPattern(descriptor.eventPattern, eventId)) {
      matches.push(descriptor);
    }
  }

  return Object.freeze(
    [...matches].sort((left, right) => left.routeId.localeCompare(right.routeId)),
  );
}
