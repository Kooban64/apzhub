import type { CommandHandlerRegistry } from "../handlers/contract";
import type { CommandMetrics } from "../metrics/metrics";
import type { CommandRegistry } from "../registry/command-registry";

export type CommandDiagnostics = {
  readonly health: "healthy" | "degraded" | "unhealthy";
  readonly registeredCommands: number;
  readonly enabledCommands: number;
  readonly registeredHandlers: number;
  readonly orphanCommands: number;
  readonly orphanHandlers: number;
  readonly metrics: ReturnType<CommandMetrics["snapshot"]>;
};

export function collectCommandDiagnostics(input: {
  readonly commands: CommandRegistry;
  readonly handlers: CommandHandlerRegistry;
  readonly metrics: CommandMetrics;
}): CommandDiagnostics {
  const commands = input.commands.list();
  const handlers = input.handlers.list();
  const handlerIds = new Set(handlers.map((h) => h.commandId));
  const commandIds = new Set(commands.map((c) => c.commandId));
  const orphanCommands = commands.filter((c) => !handlerIds.has(c.commandId)).length;
  const orphanHandlers = handlers.filter((h) => !commandIds.has(h.commandId)).length;
  const metrics = input.metrics.snapshot();

  let health: CommandDiagnostics["health"] = "healthy";
  if (orphanCommands > 0 || orphanHandlers > 0) health = "degraded";
  if (metrics.successRate < 0.5 && metrics.commandsExecuted > 5) {
    health = "unhealthy";
  }

  return {
    health,
    registeredCommands: commands.length,
    enabledCommands: input.commands.listEnabled().length,
    registeredHandlers: handlers.length,
    orphanCommands,
    orphanHandlers,
    metrics,
  };
}
