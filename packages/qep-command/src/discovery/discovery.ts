/**
 * Command Discovery — consumes Quality Knowledge Index only.
 * MUST NOT query business services.
 */

import type { KnowledgeSearchService } from "@apzhub/qep-knowledge-index";

import type {
  CommandContext,
  CommandDefinition,
  DiscoveredCommand,
} from "../domain/types";
import type { CommandRegistry } from "../registry/command-registry";
import {
  filterVisibleCommands,
  type PermissionResolver,
} from "../security/permissions";

export type CommandDiscoveryRequest = {
  readonly query: string;
  readonly context: CommandContext;
  readonly category?: CommandDefinition["category"];
  readonly limit?: number;
};

export type CommandDiscoveryService = {
  discover(request: CommandDiscoveryRequest): Promise<readonly DiscoveredCommand[]>;
};

function scoreCommand(
  command: CommandDefinition,
  query: string,
): { readonly score: number; readonly reason: string[] } {
  if (!query.trim()) {
    return { score: 1, reason: ["default"] };
  }
  const q = query.toLowerCase();
  const reason: string[] = [];
  let score = 0;
  if (command.name.toLowerCase() === q) {
    score += 20;
    reason.push("name_exact");
  } else if (command.name.toLowerCase().includes(q)) {
    score += 10;
    reason.push("name");
  }
  if (command.commandId.toLowerCase().includes(q)) {
    score += 8;
    reason.push("id");
  }
  if (command.description.toLowerCase().includes(q)) {
    score += 4;
    reason.push("description");
  }
  for (const kw of command.keywords) {
    if (kw.toLowerCase() === q) {
      score += 12;
      reason.push("keyword_exact");
    } else if (kw.toLowerCase().includes(q)) {
      score += 6;
      reason.push("keyword");
    }
  }
  if (command.category.toLowerCase().includes(q)) {
    score += 3;
    reason.push("category");
  }
  return { score, reason: [...new Set(reason)] };
}

export function createCommandDiscoveryService(deps: {
  readonly registry: CommandRegistry;
  readonly permissions: PermissionResolver;
  readonly search: KnowledgeSearchService;
}): CommandDiscoveryService {
  return {
    async discover(request) {
      const limit = Math.min(50, Math.max(1, request.limit ?? 20));
      let commands = filterVisibleCommands(
        deps.registry.listEnabled(),
        request.context,
        deps.permissions,
      );
      if (request.category) {
        commands = commands.filter((c) => c.category === request.category);
      }

      const local: DiscoveredCommand[] = [];
      for (const command of commands) {
        const { score, reason } = scoreCommand(command, request.query);
        if (score > 0 || !request.query.trim()) {
          local.push({ command, score, reason });
        }
      }

      // QKI projection discovery — entity commands enriched by search hits
      const projectionHits =
        request.query.trim().length > 0
          ? await deps.search.search({
              tenantId: request.context.tenantId,
              query: request.query,
              pageSize: 10,
            })
          : {
              hits: [],
              total: 0,
              page: 1,
              pageSize: 10,
              projectionOnly: true as const,
            };

      for (const hit of projectionHits.hits) {
        const entityCommands = commands.filter(
          (c) =>
            c.kind === "entity" &&
            (!c.entityKind || c.entityKind === hit.document.entityKind),
        );
        for (const command of entityCommands) {
          local.push({
            command,
            score: hit.score + 5,
            reason: ["qki_projection", ...hit.highlights],
            projectionEntityId: hit.document.entityId,
            projectionTitle: hit.document.title,
          });
        }
      }

      // Deduplicate by commandId+entity, keep highest score
      const best = new Map<string, DiscoveredCommand>();
      for (const item of local) {
        const key = `${item.command.commandId}:${item.projectionEntityId ?? ""}`;
        const prev = best.get(key);
        if (!prev || item.score > prev.score) {
          best.set(key, item);
        }
      }

      return [...best.values()]
        .sort(
          (a, b) =>
            b.score - a.score || a.command.commandId.localeCompare(b.command.commandId),
        )
        .slice(0, limit);
    },
  };
}
