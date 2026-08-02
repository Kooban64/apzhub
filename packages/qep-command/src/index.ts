export { QEP_COMMAND_VERSION, QEP_COMMAND_PLATFORM_VERSION } from "./version";

export {
  COMMAND_KINDS,
  COMMAND_CATEGORIES,
  type CommandKind,
  type CommandCategory,
  type CommandDefinition,
  type CommandContext,
  type CommandInput,
  type CommandExecutionOutcome,
  type CommandExecutionResult,
  type DiscoveredCommand,
  type CommandSuggestion,
} from "./domain/types";

export {
  createCommandRegistry,
  type CommandRegistry,
} from "./registry/command-registry";

export {
  createCommandHandlerRegistry,
  successResult,
  outcomeResult,
  type CommandHandler,
  type CommandHandlerRegistry,
} from "./handlers/contract";

export {
  createDefaultPermissionResolver,
  filterVisibleCommands,
  type PermissionResolver,
  type PermissionDecision,
} from "./security/permissions";

export {
  createCommandDiscoveryService,
  type CommandDiscoveryService,
  type CommandDiscoveryRequest,
} from "./discovery/discovery";

export {
  createInMemoryUserCommandPreferences,
  type UserCommandPreferences,
} from "./preferences/user-commands";

export { createCommandRanker, type CommandRanker } from "./ranking/ranking";

export {
  createCommandMetrics,
  type CommandMetrics,
  type CommandMetricsSnapshot,
} from "./metrics/metrics";

export {
  createCommandExecutionEngine,
  type CommandExecutionEngine,
} from "./execution/engine";

export {
  collectCommandDiagnostics,
  type CommandDiagnostics,
} from "./diagnostics/diagnostics";

export {
  BUILTIN_COMMAND_DEFINITIONS,
  createBuiltinCommandHandlers,
} from "./catalogue/builtin";

export {
  createEnterpriseCommandPlatform,
  type EnterpriseCommandPlatform,
} from "./compose";
