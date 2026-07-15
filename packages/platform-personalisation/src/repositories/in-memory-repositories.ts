import type {
  AddFavoriteInput,
  FavoriteItem,
  PreferenceRecord,
  RecentItem,
  TrackRecentItemInput,
  UpsertPreferenceInput,
  WorkbenchLayoutRecord,
} from "../personalisation-types";
import type {
  FavoritesRepository,
  PersonalisationRepositoryBundle,
  PreferenceRepository,
  RecentItemsRepository,
  WorkbenchLayoutRepository,
} from "./repository-interfaces";

function nowIso(): string {
  return new Date().toISOString();
}

function randomId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export class InMemoryPreferenceRepository implements PreferenceRepository {
  private readonly items = new Map<string, PreferenceRecord>();

  private key(userId: string, category: string, preferenceKey: string): string {
    return `${userId}:${category}:${preferenceKey}`;
  }

  async get(
    userId: string,
    category: string,
    preferenceKey: string,
  ): Promise<PreferenceRecord | undefined> {
    return this.items.get(this.key(userId, category, preferenceKey));
  }

  async listByUser(userId: string): Promise<readonly PreferenceRecord[]> {
    return [...this.items.values()].filter((item) => item.userId === userId);
  }

  async upsert(input: UpsertPreferenceInput): Promise<PreferenceRecord> {
    const existing = await this.get(input.userId, input.category, input.preferenceKey);
    const timestamp = nowIso();
    const record: PreferenceRecord = {
      preferenceId: existing?.preferenceId ?? randomId("pref"),
      userId: input.userId,
      category: input.category,
      preferenceKey: input.preferenceKey,
      value: input.value,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };
    this.items.set(this.key(input.userId, input.category, input.preferenceKey), record);
    return record;
  }

  async delete(userId: string, category: string, preferenceKey: string): Promise<boolean> {
    return this.items.delete(this.key(userId, category, preferenceKey));
  }

  async count(): Promise<number> {
    return this.items.size;
  }
}

export class InMemoryFavoritesRepository implements FavoritesRepository {
  private readonly items = new Map<string, FavoriteItem>();

  private key(userId: string, itemType: string, itemKey: string): string {
    return `${userId}:${itemType}:${itemKey}`;
  }

  async listByUser(userId: string): Promise<readonly FavoriteItem[]> {
    return [...this.items.values()].filter((item) => item.userId === userId);
  }

  async get(
    userId: string,
    itemType: string,
    itemKey: string,
  ): Promise<FavoriteItem | undefined> {
    return this.items.get(this.key(userId, itemType, itemKey));
  }

  async add(input: AddFavoriteInput): Promise<FavoriteItem> {
    const existing = await this.get(input.userId, input.itemType, input.itemKey);
    if (existing) {
      return existing;
    }

    const favorite: FavoriteItem = {
      favoriteId: randomId("fav"),
      userId: input.userId,
      itemType: input.itemType,
      itemKey: input.itemKey,
      label: input.label,
      metadata: input.metadata ?? {},
      createdAt: nowIso(),
    };
    this.items.set(this.key(input.userId, input.itemType, input.itemKey), favorite);
    return favorite;
  }

  async remove(userId: string, favoriteId: string): Promise<boolean> {
    const target = [...this.items.values()].find(
      (item) => item.userId === userId && item.favoriteId === favoriteId,
    );
    if (!target) {
      return false;
    }
    return this.items.delete(this.key(target.userId, target.itemType, target.itemKey));
  }

  async count(): Promise<number> {
    return this.items.size;
  }
}

export class InMemoryRecentItemsRepository implements RecentItemsRepository {
  private readonly items = new Map<string, RecentItem>();

  private key(userId: string, itemType: string, itemKey: string): string {
    return `${userId}:${itemType}:${itemKey}`;
  }

  async listByUser(userId: string, limit = 25): Promise<readonly RecentItem[]> {
    return [...this.items.values()]
      .filter((item) => item.userId === userId)
      .sort((a, b) => Date.parse(b.accessedAt) - Date.parse(a.accessedAt))
      .slice(0, limit);
  }

  async track(input: TrackRecentItemInput): Promise<RecentItem> {
    const existing = await this.get(input.userId, input.itemType, input.itemKey);
    const record: RecentItem = {
      recentId: existing?.recentId ?? randomId("recent"),
      userId: input.userId,
      itemType: input.itemType,
      itemKey: input.itemKey,
      label: input.label,
      accessedAt: nowIso(),
    };
    this.items.set(this.key(input.userId, input.itemType, input.itemKey), record);
    return record;
  }

  private async get(
    userId: string,
    itemType: string,
    itemKey: string,
  ): Promise<RecentItem | undefined> {
    return this.items.get(this.key(userId, itemType, itemKey));
  }

  async clear(userId: string): Promise<void> {
    for (const [key, item] of this.items.entries()) {
      if (item.userId === userId) {
        this.items.delete(key);
      }
    }
  }

  async count(): Promise<number> {
    return this.items.size;
  }
}

export class InMemoryWorkbenchLayoutRepository implements WorkbenchLayoutRepository {
  private readonly items = new Map<string, WorkbenchLayoutRecord>();

  async get(userId: string): Promise<WorkbenchLayoutRecord | undefined> {
    return this.items.get(userId);
  }

  async save(userId: string, layout: Record<string, unknown>): Promise<WorkbenchLayoutRecord> {
    const record: WorkbenchLayoutRecord = {
      userId,
      layout,
      updatedAt: nowIso(),
    };
    this.items.set(userId, record);
    return record;
  }

  async delete(userId: string): Promise<boolean> {
    return this.items.delete(userId);
  }

  async count(): Promise<number> {
    return this.items.size;
  }
}

export function createInMemoryPersonalisationRepositories(): PersonalisationRepositoryBundle {
  return {
    preferences: new InMemoryPreferenceRepository(),
    favorites: new InMemoryFavoritesRepository(),
    recentItems: new InMemoryRecentItemsRepository(),
    workbenchLayouts: new InMemoryWorkbenchLayoutRepository(),
  };
}
