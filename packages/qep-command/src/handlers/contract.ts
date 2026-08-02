import type {
  CommandContext,
  CommandExecutionResult,
  CommandInput,
} from "../domain/types";

/**
 * Handler knows WHAT to execute.
 * Engine knows HOW (validate → authorise → invoke → metric).
 */
export type CommandHandler = {
  readonly commandId: string;
  validate?(
    input: CommandInput,
  ): { readonly ok: true } | { readonly ok: false; readonly message: string };
  execute(input: CommandInput): Promise<{
    readonly ok: boolean;
    readonly message?: string;
    readonly data?: Readonly<Record<string, unknown>>;
  }>;
};

export type CommandHandlerRegistry = {
  register(handler: CommandHandler): void;
  unregister(commandId: string): void;
  get(commandId: string): CommandHandler | undefined;
  list(): readonly CommandHandler[];
  registerBatch(handlers: readonly CommandHandler[]): void;
};

export function createCommandHandlerRegistry(
  initial: readonly CommandHandler[] = [],
): CommandHandlerRegistry {
  const byId = new Map<string, CommandHandler>();
  for (const h of initial) {
    byId.set(h.commandId, h);
  }
  return {
    register(handler) {
      byId.set(handler.commandId, handler);
    },
    unregister(commandId) {
      byId.delete(commandId);
    },
    get(commandId) {
      return byId.get(commandId);
    },
    list() {
      return [...byId.values()].sort((a, b) => a.commandId.localeCompare(b.commandId));
    },
    registerBatch(handlers) {
      const ordered = [...handlers].sort((a, b) =>
        a.commandId.localeCompare(b.commandId),
      );
      for (const h of ordered) {
        byId.set(h.commandId, h);
      }
    },
  };
}

export function successResult(
  commandId: string,
  durationMs: number,
  options: {
    readonly message?: string;
    readonly data?: Readonly<Record<string, unknown>>;
    readonly correlationId?: string;
  } = {},
): CommandExecutionResult {
  return {
    outcome: "success",
    commandId,
    durationMs,
    ...(options.message ? { message: options.message } : {}),
    ...(options.data ? { data: options.data } : {}),
    ...(options.correlationId ? { correlationId: options.correlationId } : {}),
  };
}

export function outcomeResult(
  outcome: CommandExecutionResult["outcome"],
  commandId: string,
  durationMs: number,
  message: string,
  correlationId?: string,
): CommandExecutionResult {
  return {
    outcome,
    commandId,
    durationMs,
    message,
    ...(correlationId ? { correlationId } : {}),
  };
}

export type { CommandContext };
