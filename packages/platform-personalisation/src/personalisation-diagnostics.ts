import type { PersonalisationDiagnostics } from "./personalisation-types";
import type { PersonalisationRepositoryBundle } from "./repositories/repository-interfaces";

export class PersonalisationDiagnosticsService {
  constructor(
    private readonly repositories: PersonalisationRepositoryBundle,
    private readonly storageBackend: PersonalisationDiagnostics["storageBackend"] = "memory",
  ) {}

  async getDiagnostics(): Promise<PersonalisationDiagnostics> {
    const [preferenceCount, favoriteCount, recentItemCount, workbenchLayoutCount] =
      await Promise.all([
        this.repositories.preferences.count(),
        this.repositories.favorites.count(),
        this.repositories.recentItems.count(),
        this.repositories.workbenchLayouts.count(),
      ]);

    return {
      preferenceCount,
      favoriteCount,
      recentItemCount,
      workbenchLayoutCount,
      storageBackend: this.storageBackend,
    };
  }
}
