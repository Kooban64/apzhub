import type {
  CommandContext,
  CommandDefinition,
  CommandSuggestion,
  DiscoveredCommand,
} from "../domain/types";
import type { UserCommandPreferences } from "../preferences/user-commands";

export type CommandRanker = {
  rank(input: {
    readonly discoveries: readonly DiscoveredCommand[];
    readonly context: CommandContext;
  }): readonly CommandSuggestion[];
  suggest(input: {
    readonly commands: readonly CommandDefinition[];
    readonly context: CommandContext;
    readonly limit?: number;
  }): readonly CommandSuggestion[];
};

export function createCommandRanker(
  preferences: UserCommandPreferences,
): CommandRanker {
  return {
    rank(input) {
      const userId = input.context.userId;
      const pinned = new Set(preferences.listPinned(userId));
      const favourites = new Set(preferences.listFavourites(userId));
      const recent = preferences.listRecent(userId);
      const recentIndex = new Map(recent.map((id, i) => [id, i]));

      return [...input.discoveries]
        .map((d) => {
          let score = d.score;
          let source: CommandSuggestion["source"] = "discovery";
          if (pinned.has(d.command.commandId)) {
            score += 50;
            source = "pinned";
          } else if (favourites.has(d.command.commandId)) {
            score += 30;
            source = "favourite";
          } else if (recentIndex.has(d.command.commandId)) {
            score += 20 - (recentIndex.get(d.command.commandId) ?? 0);
            source = "recent";
          }
          score += preferences.usageCount(userId, d.command.commandId);
          if (
            input.context.entityKind &&
            d.command.entityKind === input.context.entityKind
          ) {
            score += 8;
          }
          return {
            commandId: d.command.commandId,
            label: d.projectionTitle
              ? `${d.command.name}: ${d.projectionTitle}`
              : d.command.name,
            score,
            source: source === "discovery" ? "rank" : source,
          } satisfies CommandSuggestion;
        })
        .sort((a, b) => b.score - a.score || a.commandId.localeCompare(b.commandId));
    },
    suggest(input) {
      const limit = input.limit ?? 10;
      const userId = input.context.userId;
      const suggestions: CommandSuggestion[] = [];

      for (const id of preferences.listPinned(userId)) {
        const cmd = input.commands.find((c) => c.commandId === id);
        if (cmd) {
          suggestions.push({
            commandId: id,
            label: cmd.name,
            score: 100,
            source: "pinned",
          });
        }
      }
      for (const id of preferences.listFavourites(userId)) {
        if (suggestions.some((s) => s.commandId === id)) continue;
        const cmd = input.commands.find((c) => c.commandId === id);
        if (cmd) {
          suggestions.push({
            commandId: id,
            label: cmd.name,
            score: 80,
            source: "favourite",
          });
        }
      }
      for (const id of preferences.listRecent(userId)) {
        if (suggestions.some((s) => s.commandId === id)) continue;
        const cmd = input.commands.find((c) => c.commandId === id);
        if (cmd) {
          suggestions.push({
            commandId: id,
            label: cmd.name,
            score: 60,
            source: "recent",
          });
        }
      }

      return suggestions
        .sort((a, b) => b.score - a.score || a.commandId.localeCompare(b.commandId))
        .slice(0, limit);
    },
  };
}
