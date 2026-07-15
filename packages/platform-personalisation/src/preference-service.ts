import type { PersonalisationCategory, UserPreferences } from "./personalisation-types";
import {
  mergePreferencesFromRecords,
  seedDefaultPreferencesForUser,
} from "./personalisation-defaults";
import type { PreferenceRepository } from "./repositories/repository-interfaces";

export class PreferenceService {
  constructor(private readonly repository: PreferenceRepository) {}

  async getPreferences(userId: string, provisionIfEmpty = true): Promise<UserPreferences> {
    const records = await this.repository.listByUser(userId);
    if (records.length === 0 && provisionIfEmpty) {
      return seedDefaultPreferencesForUser(this.repository, userId);
    }
    return mergePreferencesFromRecords(records);
  }

  async setPreference(
    userId: string,
    category: PersonalisationCategory,
    preferenceKey: string,
    value: unknown,
  ): Promise<UserPreferences> {
    await this.repository.upsert({ userId, category, preferenceKey, value });
    return this.getPreferences(userId, false);
  }

  async patchPreferences(
    userId: string,
    patch: Partial<{
      [K in PersonalisationCategory]: Partial<UserPreferences[K]>;
    }>,
  ): Promise<UserPreferences> {
    for (const [category, values] of Object.entries(patch)) {
      if (!values || typeof values !== "object") {
        continue;
      }
      for (const [preferenceKey, value] of Object.entries(values)) {
        await this.repository.upsert({
          userId,
          category: category as PersonalisationCategory,
          preferenceKey,
          value,
        });
      }
    }
    return this.getPreferences(userId, false);
  }
}
