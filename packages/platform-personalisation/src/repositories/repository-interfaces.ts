import type {
  AddFavoriteInput,
  FavoriteItem,
  PreferenceRecord,
  RecentItem,
  TrackRecentItemInput,
  UpsertPreferenceInput,
  WorkbenchLayoutRecord,
} from "../personalisation-types";

export interface PreferenceRepository {
  get(
    userId: string,
    category: string,
    preferenceKey: string,
  ): Promise<PreferenceRecord | undefined>;
  listByUser(userId: string): Promise<readonly PreferenceRecord[]>;
  upsert(input: UpsertPreferenceInput): Promise<PreferenceRecord>;
  delete(userId: string, category: string, preferenceKey: string): Promise<boolean>;
  count(): Promise<number>;
}

export interface FavoritesRepository {
  listByUser(userId: string): Promise<readonly FavoriteItem[]>;
  get(
    userId: string,
    itemType: string,
    itemKey: string,
  ): Promise<FavoriteItem | undefined>;
  add(input: AddFavoriteInput): Promise<FavoriteItem>;
  remove(userId: string, favoriteId: string): Promise<boolean>;
  count(): Promise<number>;
}

export interface RecentItemsRepository {
  listByUser(userId: string, limit?: number): Promise<readonly RecentItem[]>;
  track(input: TrackRecentItemInput): Promise<RecentItem>;
  clear(userId: string): Promise<void>;
  count(): Promise<number>;
}

export interface WorkbenchLayoutRepository {
  get(userId: string): Promise<WorkbenchLayoutRecord | undefined>;
  save(userId: string, layout: Record<string, unknown>): Promise<WorkbenchLayoutRecord>;
  delete(userId: string): Promise<boolean>;
  count(): Promise<number>;
}

export interface PersonalisationRepositoryBundle {
  readonly preferences: PreferenceRepository;
  readonly favorites: FavoritesRepository;
  readonly recentItems: RecentItemsRepository;
  readonly workbenchLayouts: WorkbenchLayoutRepository;
}
