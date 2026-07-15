import type { PersonalisationCategory, UserPreferences } from "./personalisation-types";
import { FavoritesService } from "./favorites-service";
import { PersonalisationDiagnosticsService } from "./personalisation-diagnostics";
import { PreferenceService } from "./preference-service";
import { RecentItemsService } from "./recent-items-service";
import type { PersonalisationRepositoryBundle } from "./repositories/repository-interfaces";
import { WorkbenchLayoutService } from "./workbench-layout-service";

export interface PersonalisationServiceOptions {
  readonly repositories: PersonalisationRepositoryBundle;
  readonly storageBackend?: "memory" | "postgres" | "hybrid";
}

export class PersonalisationService {
  readonly preferences: PreferenceService;
  readonly favorites: FavoritesService;
  readonly recentItems: RecentItemsService;
  readonly workbenchLayout: WorkbenchLayoutService;
  readonly diagnostics: PersonalisationDiagnosticsService;

  constructor(options: PersonalisationServiceOptions) {
    this.preferences = new PreferenceService(options.repositories.preferences);
    this.favorites = new FavoritesService(options.repositories.favorites);
    this.recentItems = new RecentItemsService(options.repositories.recentItems);
    this.workbenchLayout = new WorkbenchLayoutService(options.repositories.workbenchLayouts);
    this.diagnostics = new PersonalisationDiagnosticsService(
      options.repositories,
      options.storageBackend ?? "memory",
    );
  }

  async getUserPreferences(userId: string): Promise<UserPreferences> {
    return this.preferences.getPreferences(userId);
  }

  async patchUserPreferences(
    userId: string,
    patch: Partial<{
      [K in PersonalisationCategory]: Partial<UserPreferences[K]>;
    }>,
  ): Promise<UserPreferences> {
    return this.preferences.patchPreferences(userId, patch);
  }

  async getDiagnostics() {
    return this.diagnostics.getDiagnostics();
  }
}
