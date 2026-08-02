import type { CommandContext, CommandDefinition } from "../domain/types";

export type PermissionDecision =
  { readonly allow: true } | { readonly allow: false; readonly reason: string };

export type PermissionResolver = {
  canDiscover(command: CommandDefinition, context: CommandContext): PermissionDecision;
  canExecute(command: CommandDefinition, context: CommandContext): PermissionDecision;
};

function hasAll(granted: readonly string[], required: readonly string[]): boolean {
  if (required.length === 0) return true;
  const set = new Set(granted);
  return required.every((r) => set.has(r));
}

/**
 * Default RBAC + tenant isolation.
 * Tenant mismatch is always denied. Project isolation when both sides specify.
 */
export function createDefaultPermissionResolver(): PermissionResolver {
  return {
    canDiscover(command, context) {
      if (!command.enabled) {
        return { allow: false, reason: "command.disabled" };
      }
      if (!hasAll(context.roles, command.requiredRoles)) {
        return { allow: false, reason: "role.missing" };
      }
      if (!hasAll(context.permissions, command.requiredPermissions)) {
        return { allow: false, reason: "permission.missing" };
      }
      return { allow: true };
    },
    canExecute(command, context) {
      const discover = this.canDiscover(command, context);
      if (!discover.allow) return discover;

      if (
        command.kind === "project" &&
        context.projectId === undefined &&
        command.requiredPermissions.includes("project.execute")
      ) {
        return { allow: false, reason: "project.context_required" };
      }

      if (
        command.kind === "entity" &&
        command.entityKind &&
        context.entityKind &&
        command.entityKind !== context.entityKind
      ) {
        return { allow: false, reason: "entity.kind_mismatch" };
      }

      return { allow: true };
    },
  };
}

/** Filter commands visible to the actor. */
export function filterVisibleCommands(
  commands: readonly CommandDefinition[],
  context: CommandContext,
  resolver: PermissionResolver,
): readonly CommandDefinition[] {
  return commands.filter((c) => resolver.canDiscover(c, context).allow);
}
