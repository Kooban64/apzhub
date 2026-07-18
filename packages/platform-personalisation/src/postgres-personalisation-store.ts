import { and, desc, eq } from "drizzle-orm";

import {
  getDb,
  platformUserFavorite,
  platformUserPreference,
  platformUserRecentItem,
  platformUserWorkbenchLayout,
} from "@apzhub/config/db";

import {
  mergePreferencesFromRecords,
  seedDefaultPreferencesForUser,
} from "./personalisation-defaults";
import type {
  AddFavoriteInput,
  FavoriteItem,
  PersonalisationDiagnostics,
  PreferenceRecord,
  RecentItem,
  TrackRecentItemInput,
  UpsertPreferenceInput,
  UserPreferences,
  WorkbenchLayoutRecord,
} from "./personalisation-types";
import type { PersonalisationService } from "./personalisation-service";
import type { ResolveSessionPersonalisationInput } from "./server";
import {
  createInMemoryPersonalisationRepositories,
  InMemoryFavoritesRepository,
  InMemoryPreferenceRepository,
  InMemoryRecentItemsRepository,
  InMemoryWorkbenchLayoutRepository,
} from "./repositories/in-memory-repositories";
import type {
  FavoritesRepository,
  PreferenceRepository,
  RecentItemsRepository,
  WorkbenchLayoutRepository,
} from "./repositories/repository-interfaces";

function randomId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export class PostgresPreferenceRepository implements PreferenceRepository {
  async get(
    userId: string,
    category: string,
    preferenceKey: string,
  ): Promise<PreferenceRecord | undefined> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(platformUserPreference)
      .where(
        and(
          eq(platformUserPreference.userId, userId),
          eq(platformUserPreference.category, category),
          eq(platformUserPreference.preferenceKey, preferenceKey),
        ),
      )
      .limit(1);

    return row ? mapPreferenceRow(row) : undefined;
  }

  async listByUser(userId: string): Promise<readonly PreferenceRecord[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(platformUserPreference)
      .where(eq(platformUserPreference.userId, userId));
    return rows.map(mapPreferenceRow);
  }

  async upsert(input: UpsertPreferenceInput): Promise<PreferenceRecord> {
    const db = getDb();
    const existing = await this.get(input.userId, input.category, input.preferenceKey);
    const timestamp = new Date();
    const preferenceId = existing?.preferenceId ?? randomId("pref");

    await db
      .insert(platformUserPreference)
      .values({
        preferenceId,
        userId: input.userId,
        category: input.category,
        preferenceKey: input.preferenceKey,
        value: input.value,
        createdAt: existing ? new Date(existing.createdAt) : timestamp,
        updatedAt: timestamp,
      })
      .onConflictDoUpdate({
        target: [
          platformUserPreference.userId,
          platformUserPreference.category,
          platformUserPreference.preferenceKey,
        ],
        set: {
          value: input.value,
          updatedAt: timestamp,
        },
      });

    return (await this.get(input.userId, input.category, input.preferenceKey))!;
  }

  async delete(
    userId: string,
    category: string,
    preferenceKey: string,
  ): Promise<boolean> {
    const db = getDb();
    const result = await db
      .delete(platformUserPreference)
      .where(
        and(
          eq(platformUserPreference.userId, userId),
          eq(platformUserPreference.category, category),
          eq(platformUserPreference.preferenceKey, preferenceKey),
        ),
      );
    return (result.rowCount ?? 0) > 0;
  }

  async count(): Promise<number> {
    const db = getDb();
    const rows = await db.select().from(platformUserPreference);
    return rows.length;
  }
}

export class PostgresFavoritesRepository implements FavoritesRepository {
  async listByUser(userId: string): Promise<readonly FavoriteItem[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(platformUserFavorite)
      .where(eq(platformUserFavorite.userId, userId));
    return rows.map(mapFavoriteRow);
  }

  async get(
    userId: string,
    itemType: string,
    itemKey: string,
  ): Promise<FavoriteItem | undefined> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(platformUserFavorite)
      .where(
        and(
          eq(platformUserFavorite.userId, userId),
          eq(platformUserFavorite.itemType, itemType),
          eq(platformUserFavorite.itemKey, itemKey),
        ),
      )
      .limit(1);
    return row ? mapFavoriteRow(row) : undefined;
  }

  async add(input: AddFavoriteInput): Promise<FavoriteItem> {
    const existing = await this.get(input.userId, input.itemType, input.itemKey);
    if (existing) {
      return existing;
    }

    const db = getDb();
    const favoriteId = randomId("fav");
    const timestamp = new Date();

    await db.insert(platformUserFavorite).values({
      favoriteId,
      userId: input.userId,
      itemType: input.itemType,
      itemKey: input.itemKey,
      label: input.label,
      metadata: input.metadata ?? {},
      createdAt: timestamp,
    });

    return (await this.get(input.userId, input.itemType, input.itemKey))!;
  }

  async remove(userId: string, favoriteId: string): Promise<boolean> {
    const db = getDb();
    const result = await db
      .delete(platformUserFavorite)
      .where(
        and(
          eq(platformUserFavorite.userId, userId),
          eq(platformUserFavorite.favoriteId, favoriteId),
        ),
      );
    return (result.rowCount ?? 0) > 0;
  }

  async count(): Promise<number> {
    const db = getDb();
    const rows = await db.select().from(platformUserFavorite);
    return rows.length;
  }
}

export class PostgresRecentItemsRepository implements RecentItemsRepository {
  async listByUser(userId: string, limit = 25): Promise<readonly RecentItem[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(platformUserRecentItem)
      .where(eq(platformUserRecentItem.userId, userId))
      .orderBy(desc(platformUserRecentItem.accessedAt))
      .limit(limit);
    return rows.map(mapRecentRow);
  }

  async track(input: TrackRecentItemInput): Promise<RecentItem> {
    const db = getDb();
    const timestamp = new Date();
    const existing = await this.get(input.userId, input.itemType, input.itemKey);
    const recentId = existing?.recentId ?? randomId("recent");

    await db
      .insert(platformUserRecentItem)
      .values({
        recentId,
        userId: input.userId,
        itemType: input.itemType,
        itemKey: input.itemKey,
        label: input.label,
        accessedAt: timestamp,
      })
      .onConflictDoUpdate({
        target: [
          platformUserRecentItem.userId,
          platformUserRecentItem.itemType,
          platformUserRecentItem.itemKey,
        ],
        set: {
          label: input.label,
          accessedAt: timestamp,
        },
      });

    return (await this.get(input.userId, input.itemType, input.itemKey))!;
  }

  private async get(
    userId: string,
    itemType: string,
    itemKey: string,
  ): Promise<RecentItem | undefined> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(platformUserRecentItem)
      .where(
        and(
          eq(platformUserRecentItem.userId, userId),
          eq(platformUserRecentItem.itemType, itemType),
          eq(platformUserRecentItem.itemKey, itemKey),
        ),
      )
      .limit(1);
    return row ? mapRecentRow(row) : undefined;
  }

  async clear(userId: string): Promise<void> {
    const db = getDb();
    await db
      .delete(platformUserRecentItem)
      .where(eq(platformUserRecentItem.userId, userId));
  }

  async count(): Promise<number> {
    const db = getDb();
    const rows = await db.select().from(platformUserRecentItem);
    return rows.length;
  }
}

export class PostgresWorkbenchLayoutRepository implements WorkbenchLayoutRepository {
  async get(userId: string): Promise<WorkbenchLayoutRecord | undefined> {
    const db = getDb();
    const [row] = await db
      .select()
      .from(platformUserWorkbenchLayout)
      .where(eq(platformUserWorkbenchLayout.userId, userId))
      .limit(1);
    return row
      ? {
          userId: row.userId,
          layout: row.layout,
          updatedAt: row.updatedAt.toISOString(),
        }
      : undefined;
  }

  async save(
    userId: string,
    layout: Record<string, unknown>,
  ): Promise<WorkbenchLayoutRecord> {
    const db = getDb();
    const timestamp = new Date();

    await db
      .insert(platformUserWorkbenchLayout)
      .values({
        userId,
        layout,
        updatedAt: timestamp,
      })
      .onConflictDoUpdate({
        target: platformUserWorkbenchLayout.userId,
        set: {
          layout,
          updatedAt: timestamp,
        },
      });

    return (await this.get(userId))!;
  }

  async delete(userId: string): Promise<boolean> {
    const db = getDb();
    const result = await db
      .delete(platformUserWorkbenchLayout)
      .where(eq(platformUserWorkbenchLayout.userId, userId));
    return (result.rowCount ?? 0) > 0;
  }

  async count(): Promise<number> {
    const db = getDb();
    const rows = await db.select().from(platformUserWorkbenchLayout);
    return rows.length;
  }
}

function mapPreferenceRow(
  row: typeof platformUserPreference.$inferSelect,
): PreferenceRecord {
  return {
    preferenceId: row.preferenceId,
    userId: row.userId,
    category: row.category as PreferenceRecord["category"],
    preferenceKey: row.preferenceKey,
    value: row.value,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapFavoriteRow(row: typeof platformUserFavorite.$inferSelect): FavoriteItem {
  return {
    favoriteId: row.favoriteId,
    userId: row.userId,
    itemType: row.itemType,
    itemKey: row.itemKey,
    label: row.label,
    metadata: row.metadata ?? {},
    createdAt: row.createdAt.toISOString(),
  };
}

function mapRecentRow(row: typeof platformUserRecentItem.$inferSelect): RecentItem {
  return {
    recentId: row.recentId,
    userId: row.userId,
    itemType: row.itemType,
    itemKey: row.itemKey,
    label: row.label,
    accessedAt: row.accessedAt.toISOString(),
  };
}

export async function getPostgresPersonalisationDiagnostics(): Promise<PersonalisationDiagnostics> {
  const prefs = new PostgresPreferenceRepository();
  const favorites = new PostgresFavoritesRepository();
  const recent = new PostgresRecentItemsRepository();
  const layouts = new PostgresWorkbenchLayoutRepository();

  return {
    preferenceCount: await prefs.count(),
    favoriteCount: await favorites.count(),
    recentItemCount: await recent.count(),
    workbenchLayoutCount: await layouts.count(),
    storageBackend: "postgres",
  };
}

export async function resolvePostgresSessionPersonalisation(
  input: ResolveSessionPersonalisationInput,
  fallback: PersonalisationService,
): Promise<UserPreferences> {
  if (!input.userId) {
    return fallback.getUserPreferences("");
  }

  const prefs = new PostgresPreferenceRepository();
  const records = await prefs.listByUser(input.userId);
  if (records.length === 0) {
    if (input.provisionIfEmpty === false) {
      return mergePreferencesFromRecords([]);
    }
    return seedDefaultPreferencesForUser(prefs, input.userId);
  }

  return mergePreferencesFromRecords(records);
}

export async function listPostgresFavorites(
  userId: string,
): Promise<readonly FavoriteItem[]> {
  return new PostgresFavoritesRepository().listByUser(userId);
}

export async function listPostgresRecentItems(
  userId: string,
): Promise<readonly RecentItem[]> {
  return new PostgresRecentItemsRepository().listByUser(userId);
}

export async function getPostgresWorkbenchLayout(
  userId: string,
): Promise<WorkbenchLayoutRecord | undefined> {
  return new PostgresWorkbenchLayoutRepository().get(userId);
}

/** Sync in-memory repositories from postgres for hybrid diagnostics. */
export function createHybridPersonalisationRepositories(): {
  readonly memory: ReturnType<typeof createInMemoryPersonalisationRepositories>;
  readonly postgres: {
    readonly preferences: PostgresPreferenceRepository;
    readonly favorites: PostgresFavoritesRepository;
    readonly recentItems: PostgresRecentItemsRepository;
    readonly workbenchLayouts: PostgresWorkbenchLayoutRepository;
  };
} {
  return {
    memory: createInMemoryPersonalisationRepositories(),
    postgres: {
      preferences: new PostgresPreferenceRepository(),
      favorites: new PostgresFavoritesRepository(),
      recentItems: new PostgresRecentItemsRepository(),
      workbenchLayouts: new PostgresWorkbenchLayoutRepository(),
    },
  };
}

export {
  InMemoryPreferenceRepository,
  InMemoryFavoritesRepository,
  InMemoryRecentItemsRepository,
  InMemoryWorkbenchLayoutRepository,
};
