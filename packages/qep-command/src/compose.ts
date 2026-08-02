/**
 * Compose Enterprise Command Platform.
 * Palette / AI / Dashboard are clients of this surface.
 */

import type { KnowledgeSearchService } from "@apzhub/qep-knowledge-index";
import {
  createQualityKnowledgeIndex,
  type QualityKnowledgeIndex,
} from "@apzhub/qep-knowledge-index";

import {
  BUILTIN_COMMAND_DEFINITIONS,
  createBuiltinCommandHandlers,
} from "./catalogue/builtin";
import {
  createCommandDiscoveryService,
  type CommandDiscoveryService,
} from "./discovery/discovery";
import {
  collectCommandDiagnostics,
  type CommandDiagnostics,
} from "./diagnostics/diagnostics";
import {
  createCommandExecutionEngine,
  type CommandExecutionEngine,
} from "./execution/engine";
import {
  createCommandHandlerRegistry,
  type CommandHandlerRegistry,
} from "./handlers/contract";
import { createCommandMetrics, type CommandMetrics } from "./metrics/metrics";
import {
  createInMemoryUserCommandPreferences,
  type UserCommandPreferences,
} from "./preferences/user-commands";
import { createCommandRanker, type CommandRanker } from "./ranking/ranking";
import {
  createCommandRegistry,
  type CommandRegistry,
} from "./registry/command-registry";
import {
  createDefaultPermissionResolver,
  type PermissionResolver,
} from "./security/permissions";
import type {
  CommandContext,
  CommandSuggestion,
  DiscoveredCommand,
} from "./domain/types";

export type EnterpriseCommandPlatform = {
  readonly commands: CommandRegistry;
  readonly handlers: CommandHandlerRegistry;
  readonly permissions: PermissionResolver;
  readonly preferences: UserCommandPreferences;
  readonly discovery: CommandDiscoveryService;
  readonly ranker: CommandRanker;
  readonly engine: CommandExecutionEngine;
  readonly metrics: CommandMetrics;
  readonly knowledgeIndex: QualityKnowledgeIndex;
  /** Unified client surface (palette is first consumer). */
  searchCommands(input: {
    readonly query: string;
    readonly context: CommandContext;
    readonly category?: DiscoveredCommand["command"]["category"];
    readonly limit?: number;
  }): Promise<readonly CommandSuggestion[]>;
  suggest(context: CommandContext, limit?: number): readonly CommandSuggestion[];
  execute: CommandExecutionEngine["execute"];
  diagnostics(): CommandDiagnostics;
};

export function createEnterpriseCommandPlatform(
  options: {
    readonly knowledgeIndex?: QualityKnowledgeIndex;
    readonly search?: KnowledgeSearchService;
    readonly registerBuiltins?: boolean;
  } = {},
): EnterpriseCommandPlatform {
  const knowledgeIndex = options.knowledgeIndex ?? createQualityKnowledgeIndex();
  const search = options.search ?? knowledgeIndex.search;

  const commands = createCommandRegistry();
  const handlers = createCommandHandlerRegistry();
  const permissions = createDefaultPermissionResolver();
  const preferences = createInMemoryUserCommandPreferences();
  const metrics = createCommandMetrics();
  const discovery = createCommandDiscoveryService({
    registry: commands,
    permissions,
    search,
  });
  const ranker = createCommandRanker(preferences);
  const engine = createCommandExecutionEngine({
    commands,
    handlers,
    permissions,
    preferences,
    metrics,
  });

  if (options.registerBuiltins !== false) {
    commands.registerBatch([...BUILTIN_COMMAND_DEFINITIONS]);
    handlers.registerBatch([
      ...createBuiltinCommandHandlers({
        onSearch: async (query, context) => {
          const result = await search.search({
            tenantId: context.tenantId,
            query,
            pageSize: 5,
          });
          return {
            query,
            total: result.total,
            projectionOnly: result.projectionOnly,
          };
        },
        onDiagnostics: () => collectCommandDiagnostics({ commands, handlers, metrics }),
      }),
    ]);
  }

  return {
    commands,
    handlers,
    permissions,
    preferences,
    discovery,
    ranker,
    engine,
    metrics,
    knowledgeIndex,
    async searchCommands(input) {
      const started = Date.now();
      const discoveries = await discovery.discover(input);
      metrics.recordDiscovery(Math.max(0, Date.now() - started));
      return ranker.rank({
        discoveries,
        context: input.context,
      });
    },
    suggest(context, limit) {
      return ranker.suggest({
        commands: commands.listEnabled(),
        context,
        limit,
      });
    },
    execute: (input) => engine.execute(input),
    diagnostics() {
      return collectCommandDiagnostics({ commands, handlers, metrics });
    },
  };
}
