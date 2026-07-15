import { createInMemoryPersonalisationRepositories } from "./repositories/in-memory-repositories";
import { PersonalisationService } from "./personalisation-service";

let sharedPersonalisationService: PersonalisationService | undefined;
let sharedRepositories: ReturnType<typeof createInMemoryPersonalisationRepositories> | undefined;

export function createInMemoryPersonalisationService(): {
  readonly service: PersonalisationService;
  readonly repositories: ReturnType<typeof createInMemoryPersonalisationRepositories>;
} {
  const repositories = createInMemoryPersonalisationRepositories();
  const service = new PersonalisationService({ repositories, storageBackend: "memory" });
  return { service, repositories };
}

export function getSharedPersonalisationService(): PersonalisationService {
  if (!sharedPersonalisationService) {
    const bundle = createInMemoryPersonalisationService();
    sharedPersonalisationService = bundle.service;
    sharedRepositories = bundle.repositories;
  }
  return sharedPersonalisationService;
}

export function getSharedPersonalisationRepositories(): ReturnType<
  typeof createInMemoryPersonalisationRepositories
> {
  getSharedPersonalisationService();
  return sharedRepositories!;
}

export function resetSharedPersonalisationService(): void {
  sharedPersonalisationService = undefined;
  sharedRepositories = undefined;
}

export { PersonalisationService } from "./personalisation-service";
export { PreferenceService } from "./preference-service";
export { FavoritesService } from "./favorites-service";
export { RecentItemsService } from "./recent-items-service";
export { WorkbenchLayoutService } from "./workbench-layout-service";
export { PersonalisationDiagnosticsService } from "./personalisation-diagnostics";

export {
  DEFAULT_USER_PREFERENCES,
  MAX_RECENT_ITEMS,
  PERSONALISATION_CATEGORIES,
} from "./personalisation-types";

export type {
  AccessibilityPreferences,
  AppearancePreferences,
  FavoriteItem,
  NotificationPreferences,
  PersonalisationCategory,
  PersonalisationDiagnostics,
  PreferenceRecord,
  RecentItem,
  RegionalPreferences,
  ThemeMode,
  UserPreferences,
  WorkbenchLayoutRecord,
  WorkbenchPreferences,
} from "./personalisation-types";

export type { PersonalisationRepositoryBundle } from "./repositories/repository-interfaces";

export {
  createInMemoryPersonalisationRepositories,
  InMemoryFavoritesRepository,
  InMemoryPreferenceRepository,
  InMemoryRecentItemsRepository,
  InMemoryWorkbenchLayoutRepository,
} from "./repositories/in-memory-repositories";

export { mergePreferencesFromRecords, seedDefaultPreferencesForUser } from "./personalisation-defaults";
