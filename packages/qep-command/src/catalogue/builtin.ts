/**
 * Built-in command catalogue — registered deterministically via registry.
 * Not hard-coded into the execution engine.
 */

import type { CommandDefinition } from "../domain/types";
import type { CommandHandler } from "../handlers/contract";

export const BUILTIN_COMMAND_DEFINITIONS: readonly CommandDefinition[] = [
  {
    commandId: "qep.command.navigate.home",
    name: "Go Home",
    description: "Navigate to the APZQEP home workspace",
    kind: "navigation",
    category: "navigation",
    keywords: ["home", "workspace", "start"],
    requiredPermissions: [],
    requiredRoles: [],
    shortcut: "g h",
    enabled: true,
  },
  {
    commandId: "qep.command.navigate.evidence",
    name: "Open Evidence",
    description: "Navigate to Evidence workspace",
    kind: "navigation",
    category: "evidence",
    keywords: ["evidence", "navigate"],
    requiredPermissions: ["evidence.read"],
    requiredRoles: [],
    shortcut: "g e",
    enabled: true,
  },
  {
    commandId: "qep.command.search.knowledge",
    name: "Search Knowledge Index",
    description: "Discover entities via the Quality Knowledge Index",
    kind: "global",
    category: "search",
    keywords: ["search", "find", "knowledge", "qki"],
    requiredPermissions: ["search.read"],
    requiredRoles: [],
    shortcut: "/",
    enabled: true,
  },
  {
    commandId: "qep.command.evidence.open",
    name: "Open Evidence Entity",
    description: "Open an Evidence entity discovered via QKI",
    kind: "entity",
    category: "evidence",
    keywords: ["open", "evidence", "entity"],
    requiredPermissions: ["evidence.read"],
    requiredRoles: [],
    entityKind: "evidence",
    enabled: true,
  },
  {
    commandId: "qep.command.project.switch",
    name: "Switch Project",
    description: "Switch active project context",
    kind: "project",
    category: "project",
    keywords: ["project", "switch", "context"],
    requiredPermissions: ["project.execute"],
    requiredRoles: [],
    enabled: true,
  },
  {
    commandId: "qep.command.admin.diagnostics",
    name: "Command Diagnostics",
    description: "Show Command Platform diagnostics",
    kind: "administrative",
    category: "administration",
    keywords: ["admin", "diagnostics", "health"],
    requiredPermissions: ["admin.commands"],
    requiredRoles: ["admin"],
    enabled: true,
  },
  {
    commandId: "qep.command.system.noop",
    name: "No-op",
    description: "System no-op for smoke / regression",
    kind: "global",
    category: "system",
    keywords: ["noop", "ping"],
    requiredPermissions: [],
    requiredRoles: [],
    enabled: true,
  },
];

export function createBuiltinCommandHandlers(
  options: {
    readonly onNavigate?: (
      target: string,
      args?: Readonly<Record<string, unknown>>,
    ) => void;
    readonly onSearch?: (
      query: string,
      context: import("../domain/types").CommandContext,
    ) => Promise<Readonly<Record<string, unknown>>>;
    readonly onDiagnostics?: () => Readonly<Record<string, unknown>>;
  } = {},
): readonly CommandHandler[] {
  return [
    {
      commandId: "qep.command.navigate.home",
      async execute() {
        options.onNavigate?.("home");
        return { ok: true, message: "navigated.home", data: { target: "home" } };
      },
    },
    {
      commandId: "qep.command.navigate.evidence",
      async execute() {
        options.onNavigate?.("evidence");
        return {
          ok: true,
          message: "navigated.evidence",
          data: { target: "evidence" },
        };
      },
    },
    {
      commandId: "qep.command.search.knowledge",
      validate(input) {
        const q = input.args?.query;
        if (typeof q !== "string" || q.trim().length === 0) {
          return { ok: false, message: "validation.query_required" };
        }
        return { ok: true };
      },
      async execute(input) {
        const query = String(input.args?.query ?? "");
        const data = (await options.onSearch?.(query, input.context)) ?? { query };
        return { ok: true, message: "search.completed", data };
      },
    },
    {
      commandId: "qep.command.evidence.open",
      validate(input) {
        if (!input.context.entityId && !input.args?.entityId) {
          return { ok: false, message: "validation.entityId_required" };
        }
        return { ok: true };
      },
      async execute(input) {
        const entityId = String(input.args?.entityId ?? input.context.entityId ?? "");
        options.onNavigate?.("evidence.entity", { entityId });
        return {
          ok: true,
          message: "evidence.opened",
          data: { entityId },
        };
      },
    },
    {
      commandId: "qep.command.project.switch",
      validate(input) {
        if (typeof input.args?.projectId !== "string") {
          return { ok: false, message: "validation.projectId_required" };
        }
        return { ok: true };
      },
      async execute(input) {
        const projectId = String(input.args?.projectId);
        return {
          ok: true,
          message: "project.switched",
          data: { projectId },
        };
      },
    },
    {
      commandId: "qep.command.admin.diagnostics",
      async execute() {
        const data = options.onDiagnostics?.() ?? { ok: true };
        return { ok: true, message: "diagnostics", data };
      },
    },
    {
      commandId: "qep.command.system.noop",
      async execute() {
        return { ok: true, message: "noop", data: { ping: true } };
      },
    },
  ];
}
