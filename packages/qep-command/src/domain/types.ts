/**
 * Enterprise Command Platform domain — APZQEP-120-S13.
 * UI-independent. Palette / AI / Dashboard are clients.
 */

export const COMMAND_KINDS = [
  "global",
  "context",
  "entity",
  "project",
  "administrative",
  "navigation",
  "ai",
] as const;
export type CommandKind = (typeof COMMAND_KINDS)[number];

export const COMMAND_CATEGORIES = [
  "navigation",
  "evidence",
  "search",
  "administration",
  "project",
  "system",
  "ai",
  "other",
] as const;
export type CommandCategory = (typeof COMMAND_CATEGORIES)[number];

/** Registered command metadata — discovery surface. */
export type CommandDefinition = {
  readonly commandId: string;
  readonly name: string;
  readonly description: string;
  readonly kind: CommandKind;
  readonly category: CommandCategory;
  readonly keywords: readonly string[];
  /** Permission keys required to see and execute. Empty = authenticated only. */
  readonly requiredPermissions: readonly string[];
  readonly requiredRoles: readonly string[];
  /** When set, command applies to this QKI entity kind. */
  readonly entityKind?: string;
  readonly shortcut?: string;
  readonly enabled: boolean;
  readonly metadata?: Readonly<Record<string, unknown>>;
};

export type CommandContext = {
  readonly tenantId: string;
  readonly userId: string;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
  readonly projectId?: string;
  readonly entityKind?: string;
  readonly entityId?: string;
  readonly locale?: string;
  readonly now: string;
  readonly correlationId?: string;
  readonly extras?: Readonly<Record<string, unknown>>;
};

export type CommandInput = {
  readonly commandId: string;
  readonly context: CommandContext;
  readonly args?: Readonly<Record<string, unknown>>;
};

export type CommandExecutionOutcome =
  "success" | "failure" | "validation_error" | "permission_denied";

export type CommandExecutionResult = {
  readonly outcome: CommandExecutionOutcome;
  readonly commandId: string;
  readonly message?: string;
  readonly data?: Readonly<Record<string, unknown>>;
  readonly durationMs: number;
  readonly correlationId?: string;
};

export type DiscoveredCommand = {
  readonly command: CommandDefinition;
  readonly score: number;
  readonly reason: readonly string[];
  /** When discovery was driven by a QKI hit. */
  readonly projectionEntityId?: string;
  readonly projectionTitle?: string;
};

export type CommandSuggestion = {
  readonly commandId: string;
  readonly label: string;
  readonly score: number;
  readonly source: "rank" | "recent" | "favourite" | "pinned" | "discovery";
};
