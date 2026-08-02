export type UserCommandPreferences = {
  pin(userId: string, commandId: string): void;
  unpin(userId: string, commandId: string): void;
  favourite(userId: string, commandId: string): void;
  unfavourite(userId: string, commandId: string): void;
  recordRecent(userId: string, commandId: string, at: string): void;
  listPinned(userId: string): readonly string[];
  listFavourites(userId: string): readonly string[];
  listRecent(userId: string, limit?: number): readonly string[];
  usageCount(userId: string, commandId: string): number;
};

export function createInMemoryUserCommandPreferences(
  options: { readonly recentLimit?: number } = {},
): UserCommandPreferences {
  const recentLimit = options.recentLimit ?? 20;
  const pinned = new Map<string, Set<string>>();
  const favourites = new Map<string, Set<string>>();
  const recent = new Map<string, string[]>();
  const usage = new Map<string, number>();

  const usageKey = (userId: string, commandId: string): string =>
    `${userId}:${commandId}`;

  return {
    pin(userId, commandId) {
      const set = pinned.get(userId) ?? new Set();
      set.add(commandId);
      pinned.set(userId, set);
    },
    unpin(userId, commandId) {
      pinned.get(userId)?.delete(commandId);
    },
    favourite(userId, commandId) {
      const set = favourites.get(userId) ?? new Set();
      set.add(commandId);
      favourites.set(userId, set);
    },
    unfavourite(userId, commandId) {
      favourites.get(userId)?.delete(commandId);
    },
    recordRecent(userId, commandId, _at) {
      const list = recent.get(userId) ?? [];
      const next = [commandId, ...list.filter((id) => id !== commandId)].slice(
        0,
        recentLimit,
      );
      recent.set(userId, next);
      const key = usageKey(userId, commandId);
      usage.set(key, (usage.get(key) ?? 0) + 1);
    },
    listPinned(userId) {
      return [...(pinned.get(userId) ?? [])].sort();
    },
    listFavourites(userId) {
      return [...(favourites.get(userId) ?? [])].sort();
    },
    listRecent(userId, limit = recentLimit) {
      return (recent.get(userId) ?? []).slice(0, limit);
    },
    usageCount(userId, commandId) {
      return usage.get(usageKey(userId, commandId)) ?? 0;
    },
  };
}
