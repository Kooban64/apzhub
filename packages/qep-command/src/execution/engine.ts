/**
 * Command Execution Engine — knows HOW to execute.
 * Handlers know WHAT. No switch-based routing.
 */

import type { CommandExecutionResult, CommandInput } from "../domain/types";
import {
  outcomeResult,
  successResult,
  type CommandHandlerRegistry,
} from "../handlers/contract";
import type { CommandMetrics } from "../metrics/metrics";
import type { UserCommandPreferences } from "../preferences/user-commands";
import type { CommandRegistry } from "../registry/command-registry";
import type { PermissionResolver } from "../security/permissions";

export type CommandExecutionEngine = {
  execute(input: CommandInput): Promise<CommandExecutionResult>;
};

export function createCommandExecutionEngine(deps: {
  readonly commands: CommandRegistry;
  readonly handlers: CommandHandlerRegistry;
  readonly permissions: PermissionResolver;
  readonly preferences: UserCommandPreferences;
  readonly metrics: CommandMetrics;
}): CommandExecutionEngine {
  return {
    async execute(input) {
      const started = Date.now();
      const command = deps.commands.get(input.commandId);

      if (!command || !command.enabled) {
        const durationMs = Math.max(0, Date.now() - started);
        const result = outcomeResult(
          "failure",
          input.commandId,
          durationMs,
          "command.not_found",
          input.context.correlationId,
        );
        deps.metrics.recordExecution({
          commandId: input.commandId,
          outcome: result.outcome,
          durationMs,
        });
        return result;
      }

      const authz = deps.permissions.canExecute(command, input.context);
      if (!authz.allow) {
        const durationMs = Math.max(0, Date.now() - started);
        const result = outcomeResult(
          "permission_denied",
          input.commandId,
          durationMs,
          authz.reason,
          input.context.correlationId,
        );
        deps.metrics.recordExecution({
          commandId: input.commandId,
          outcome: result.outcome,
          durationMs,
        });
        return result;
      }

      const handler = deps.handlers.get(input.commandId);
      if (!handler) {
        const durationMs = Math.max(0, Date.now() - started);
        const result = outcomeResult(
          "failure",
          input.commandId,
          durationMs,
          "handler.not_registered",
          input.context.correlationId,
        );
        deps.metrics.recordExecution({
          commandId: input.commandId,
          outcome: result.outcome,
          durationMs,
        });
        return result;
      }

      if (handler.validate) {
        const validation = handler.validate(input);
        if (!validation.ok) {
          const durationMs = Math.max(0, Date.now() - started);
          const result = outcomeResult(
            "validation_error",
            input.commandId,
            durationMs,
            validation.message,
            input.context.correlationId,
          );
          deps.metrics.recordExecution({
            commandId: input.commandId,
            outcome: result.outcome,
            durationMs,
          });
          return result;
        }
      }

      try {
        const outcome = await handler.execute(input);
        const durationMs = Math.max(0, Date.now() - started);
        if (!outcome.ok) {
          const result = outcomeResult(
            "failure",
            input.commandId,
            durationMs,
            outcome.message ?? "handler.failed",
            input.context.correlationId,
          );
          deps.metrics.recordExecution({
            commandId: input.commandId,
            outcome: result.outcome,
            durationMs,
          });
          return result;
        }

        deps.preferences.recordRecent(
          input.context.userId,
          input.commandId,
          input.context.now,
        );

        const result = successResult(input.commandId, durationMs, {
          ...(outcome.message ? { message: outcome.message } : {}),
          ...(outcome.data ? { data: outcome.data } : {}),
          ...(input.context.correlationId
            ? { correlationId: input.context.correlationId }
            : {}),
        });
        deps.metrics.recordExecution({
          commandId: input.commandId,
          outcome: result.outcome,
          durationMs,
        });
        return result;
      } catch (error) {
        const durationMs = Math.max(0, Date.now() - started);
        const result = outcomeResult(
          "failure",
          input.commandId,
          durationMs,
          error instanceof Error ? error.message : "handler.exception",
          input.context.correlationId,
        );
        deps.metrics.recordExecution({
          commandId: input.commandId,
          outcome: result.outcome,
          durationMs,
        });
        return result;
      }
    },
  };
}
