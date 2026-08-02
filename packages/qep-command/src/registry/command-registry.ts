import type { CommandCategory, CommandDefinition, CommandKind } from "../domain/types";

export type CommandRegistry = {
  register(definition: CommandDefinition): void;
  unregister(commandId: string): void;
  get(commandId: string): CommandDefinition | undefined;
  list(): readonly CommandDefinition[];
  listEnabled(): readonly CommandDefinition[];
  listByCategory(category: CommandCategory): readonly CommandDefinition[];
  listByKind(kind: CommandKind): readonly CommandDefinition[];
  /** Deterministic registration of a batch (sorted by commandId). */
  registerBatch(definitions: readonly CommandDefinition[]): void;
};

export function createCommandRegistry(
  initial: readonly CommandDefinition[] = [],
): CommandRegistry {
  const byId = new Map<string, CommandDefinition>();

  const registerOne = (definition: CommandDefinition): void => {
    if (!definition.commandId) {
      throw new Error("command.commandId required");
    }
    byId.set(definition.commandId, definition);
  };

  for (const def of initial) {
    registerOne(def);
  }

  return {
    register: registerOne,
    unregister(commandId) {
      byId.delete(commandId);
    },
    get(commandId) {
      return byId.get(commandId);
    },
    list() {
      return [...byId.values()].sort((a, b) => a.commandId.localeCompare(b.commandId));
    },
    listEnabled() {
      return this.list().filter((c) => c.enabled);
    },
    listByCategory(category) {
      return this.listEnabled().filter((c) => c.category === category);
    },
    listByKind(kind) {
      return this.listEnabled().filter((c) => c.kind === kind);
    },
    registerBatch(definitions) {
      const ordered = [...definitions].sort((a, b) =>
        a.commandId.localeCompare(b.commandId),
      );
      for (const def of ordered) {
        registerOne(def);
      }
    },
  };
}
