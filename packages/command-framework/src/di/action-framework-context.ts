import type { ActionExecutor } from "../executor";
import { createPlaceholderActionExecutor } from "../executor";
import {
  createDefaultInvocationGatewayRegistry,
  type InvocationGatewayRegistry,
} from "../gateways";
import type { ActionRegistry } from "../registry";
import { createDefaultActionRegistry } from "../registry";
import type { ShortcutRegistry } from "../shortcuts";
import { createDefaultShortcutRegistry } from "../shortcuts";
import type { ActionAuditHook } from "../types";
import { noOpActionAuditHook } from "../types";
import type { CommandFrameworkStatus } from "../status";
import { COMMAND_FRAMEWORK_STATUS } from "../status";

/** Dependency injection root for Action Framework consumers. */
export interface ActionFrameworkContext {
  readonly status: CommandFrameworkStatus;
  readonly registry: ActionRegistry;
  readonly shortcuts: ShortcutRegistry;
  readonly executor: ActionExecutor;
  readonly auditHook: ActionAuditHook;
  readonly gateways: InvocationGatewayRegistry;
}

export interface CreateActionFrameworkContextOptions {
  readonly registry?: ActionRegistry;
  readonly shortcuts?: ShortcutRegistry;
  readonly executor?: ActionExecutor;
  readonly auditHook?: ActionAuditHook;
  readonly gateways?: InvocationGatewayRegistry;
}

/**
 * Composition root — inject custom registry/executor in tests and AF-020 app wiring.
 * Defaults to DefaultActionRegistry and placeholder executor until wired with
 * {@link createDefaultActionExecutor} dependencies.
 */
export function createActionFrameworkContext(
  options: CreateActionFrameworkContextOptions = {},
): ActionFrameworkContext {
  return {
    status: COMMAND_FRAMEWORK_STATUS,
    registry: options.registry ?? createDefaultActionRegistry(),
    shortcuts: options.shortcuts ?? createDefaultShortcutRegistry(),
    executor: options.executor ?? createPlaceholderActionExecutor(),
    auditHook: options.auditHook ?? noOpActionAuditHook,
    gateways: options.gateways ?? createDefaultInvocationGatewayRegistry(),
  };
}

/** Minimal permission gate for server filter — aligned with Workbench adapter shape (AF-005). */
export interface ActionPermissionAdapter {
  can(permission: string | undefined): boolean;
}

export interface ActionFrameworkServerDependencies {
  readonly permissionAdapter?: ActionPermissionAdapter;
}
