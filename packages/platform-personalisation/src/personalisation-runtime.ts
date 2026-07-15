import { PersonalisationService } from "./personalisation-service";
import { getSharedPersonalisationService } from "./index";

export async function createPostgresPersonalisationService(): Promise<PersonalisationService> {
  const {
    PostgresFavoritesRepository,
    PostgresPreferenceRepository,
    PostgresRecentItemsRepository,
    PostgresWorkbenchLayoutRepository,
  } = await import("./postgres-personalisation-store");

  return new PersonalisationService({
    repositories: {
      preferences: new PostgresPreferenceRepository(),
      favorites: new PostgresFavoritesRepository(),
      recentItems: new PostgresRecentItemsRepository(),
      workbenchLayouts: new PostgresWorkbenchLayoutRepository(),
    },
    storageBackend: "postgres",
  });
}

export async function getPersonalisationServiceForSession(): Promise<PersonalisationService> {
  if (process.env.DATABASE_URL) {
    try {
      return await createPostgresPersonalisationService();
    } catch {
      // Fall through to in-memory personalisation.
    }
  }
  return getSharedPersonalisationService();
}
