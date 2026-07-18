import type {
  PlatformAuthorizationEventId,
  RoleAssignment,
  PlatformRole,
} from "./authorization-types";
import { PLATFORM_AUTHORIZATION_EVENTS } from "./authorization-types";

export interface AuthorizationEventPublisher {
  publishRoleCreated(role: PlatformRole): void;
  publishRoleUpdated(role: PlatformRole): void;
  publishAssignmentCreated(assignment: RoleAssignment): void;
  publishAssignmentRemoved(assignment: RoleAssignment): void;
  listEvents(): readonly Record<string, unknown>[];
}

export class InMemoryAuthorizationEventPublisher implements AuthorizationEventPublisher {
  private readonly events: Record<string, unknown>[] = [];

  publishRoleCreated(role: PlatformRole): void {
    this.record(PLATFORM_AUTHORIZATION_EVENTS.roleCreated, {
      roleId: role.roleId,
      slug: role.slug,
    });
  }

  publishRoleUpdated(role: PlatformRole): void {
    this.record(PLATFORM_AUTHORIZATION_EVENTS.roleUpdated, {
      roleId: role.roleId,
      slug: role.slug,
    });
  }

  publishAssignmentCreated(assignment: RoleAssignment): void {
    this.record(PLATFORM_AUTHORIZATION_EVENTS.assignmentCreated, {
      assignmentId: assignment.assignmentId,
      userId: assignment.userId,
      roleId: assignment.roleId,
    });
  }

  publishAssignmentRemoved(assignment: RoleAssignment): void {
    this.record(PLATFORM_AUTHORIZATION_EVENTS.assignmentRemoved, {
      assignmentId: assignment.assignmentId,
      userId: assignment.userId,
      roleId: assignment.roleId,
    });
  }

  listEvents(): readonly Record<string, unknown>[] {
    return [...this.events];
  }

  private record(
    eventId: PlatformAuthorizationEventId,
    payload: Record<string, unknown>,
  ): void {
    this.events.push({
      eventId,
      occurredAt: new Date().toISOString(),
      payload,
    });
  }
}

export function createNoopAuthorizationEventPublisher(): AuthorizationEventPublisher {
  return {
    publishRoleCreated: () => undefined,
    publishRoleUpdated: () => undefined,
    publishAssignmentCreated: () => undefined,
    publishAssignmentRemoved: () => undefined,
    listEvents: () => [],
  };
}
