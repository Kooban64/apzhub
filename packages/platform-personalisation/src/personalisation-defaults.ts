import {
  DEFAULT_USER_PREFERENCES,
  type PersonalisationCategory,
  type UserPreferences,
} from "./personalisation-types";
import type { PreferenceRepository } from "./repositories/repository-interfaces";

const CATEGORY_KEYS: Record<PersonalisationCategory, readonly string[]> = {
  appearance: ["theme", "density"],
  regional: ["language", "timezone", "dateFormat", "timeFormat"],
  workbench: [
    "landingPage",
    "defaultWorkspace",
    "sidebarCollapsed",
    "pinnedWorkspaces",
    "recentWorkspaces",
  ],
  notifications: ["email", "inApp", "digest"],
  accessibility: ["reducedMotion", "highContrast", "focusIndicators"],
};

export async function seedDefaultPreferencesForUser(
  repository: PreferenceRepository,
  userId: string,
): Promise<UserPreferences> {
  const existing = await repository.listByUser(userId);
  if (existing.length > 0) {
    return mergePreferencesFromRecords(existing);
  }

  for (const [category, keys] of Object.entries(CATEGORY_KEYS) as Array<
    [PersonalisationCategory, readonly string[]]
  >) {
    const defaults = DEFAULT_USER_PREFERENCES[category];
    for (const key of keys) {
      await repository.upsert({
        userId,
        category,
        preferenceKey: key,
        value: defaults[key as keyof typeof defaults],
      });
    }
  }

  return mergePreferencesFromRecords(await repository.listByUser(userId));
}

export function mergePreferencesFromRecords(
  records: readonly {
    category: PersonalisationCategory;
    preferenceKey: string;
    value: unknown;
  }[],
): UserPreferences {
  const merged: UserPreferences = structuredClone(DEFAULT_USER_PREFERENCES);

  for (const record of records) {
    const category = record.category;
    if (!(category in merged)) {
      continue;
    }

    const target = merged[category] as unknown as Record<string, unknown>;
    if (record.preferenceKey in target) {
      target[record.preferenceKey] = record.value;
    }
  }

  return merged;
}
