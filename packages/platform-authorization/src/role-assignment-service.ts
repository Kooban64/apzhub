import type { AssignRoleInput, RoleAssignment } from "./authorization-types";
import type { RoleAssignmentRepository, RoleRepository } from "./repositories/repository-interfaces";
import type { AuthorizationEventPublisher } from "./authorization-events";

export class RoleAssignmentService {
  constructor(
    private readonly assignments: RoleAssignmentRepository,
    private readonly roles: RoleRepository,
    private readonly events: AuthorizationEventPublisher,
  ) {}

  assignRole(input: AssignRoleInput): RoleAssignment {
    const role = this.roles.get(input.roleId);
    if (!role) {
      throw new Error(`Role not found: ${input.roleId}`);
    }

    if (role.scope === "tenant" && input.tenantId && role.tenantId && role.tenantId !== input.tenantId) {
      throw new Error("Tenant mismatch for tenant-scoped role assignment.");
    }

    if (role.scope === "product" && input.productKey && role.productKey && role.productKey !== input.productKey) {
      throw new Error("Product mismatch for product-scoped role assignment.");
    }

    const assignment = this.assignments.assign(input);
    this.events.publishAssignmentCreated(assignment);
    return assignment;
  }

  removeAssignment(assignmentId: string): RoleAssignment | undefined {
    const removed = this.assignments.remove(assignmentId);
    if (removed) {
      this.events.publishAssignmentRemoved(removed);
    }
    return removed;
  }

  listAssignmentsForUser(
    userId: string,
    filter?: Parameters<RoleAssignmentRepository["listByUser"]>[1],
  ): readonly RoleAssignment[] {
    return this.assignments.listByUser(userId, filter);
  }

  listAssignmentsForRole(roleId: string): readonly RoleAssignment[] {
    return this.assignments.listByRole(roleId);
  }
}
