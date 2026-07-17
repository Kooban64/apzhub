/**
 * Notification Platform foundation composition (APZNOTIFY-001).
 * Wires validators + lifecycle with explicit repository ports — NO silent memory.
 */

import {
  assertNotificationLifecycleTransition,
  canTransitionNotificationLifecycle,
  listAllowedNotificationLifecycleTransitions,
} from "../lifecycle/transitions";
import type { NotificationFoundationRepos } from "../ports/repository-ports";
import { NotificationDomainError } from "../ports/repository-ports";
import {
  validateNotification,
  type ValidateNotificationInput,
} from "../validation/validate-notification";

export type CreateNotificationFoundationInput = {
  readonly repos: NotificationFoundationRepos;
};

export type NotificationFoundation = {
  readonly repos: NotificationFoundationRepos;
  readonly validate: typeof validateNotification;
  readonly canTransition: typeof canTransitionNotificationLifecycle;
  readonly assertTransition: typeof assertNotificationLifecycleTransition;
  readonly listAllowedTransitions: typeof listAllowedNotificationLifecycleTransitions;
};

function assertRepos(repos: NotificationFoundationRepos): void {
  const required: (keyof NotificationFoundationRepos)[] = [
    "notifications",
    "recipients",
    "templates",
    "categories",
    "channels",
    "preferences",
    "rules",
    "references",
    "attachments",
    "deliveryAttempts",
    "audits",
  ];
  for (const key of required) {
    if (repos[key] == null) {
      throw new NotificationDomainError(
        "missing_repository",
        `createNotificationFoundation requires explicit repos.${key} — silent in-memory defaults are forbidden`,
        { key },
      );
    }
  }
}

/**
 * Compose notification validation + lifecycle helpers with caller-supplied repos.
 */
export function createNotificationFoundation(
  input: CreateNotificationFoundationInput,
): NotificationFoundation {
  if (!input?.repos) {
    throw new NotificationDomainError(
      "missing_repos",
      "createNotificationFoundation requires explicit repos — silent in-memory defaults are forbidden",
    );
  }
  assertRepos(input.repos);
  return {
    repos: input.repos,
    validate: validateNotification,
    canTransition: canTransitionNotificationLifecycle,
    assertTransition: assertNotificationLifecycleTransition,
    listAllowedTransitions: listAllowedNotificationLifecycleTransitions,
  };
}

export type { ValidateNotificationInput };
