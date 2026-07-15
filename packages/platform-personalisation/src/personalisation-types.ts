export type ThemeMode = "light" | "dark" | "system";

export const PERSONALISATION_CATEGORIES = [
  "appearance",
  "regional",
  "workbench",
  "notifications",
  "accessibility",
] as const;

export type PersonalisationCategory = (typeof PERSONALISATION_CATEGORIES)[number];

export interface AppearancePreferences {
  readonly theme: ThemeMode;
  readonly density: "comfortable" | "compact";
}

export interface RegionalPreferences {
  readonly language: string;
  readonly timezone: string;
  readonly dateFormat: "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY";
  readonly timeFormat: "12h" | "24h";
}

export interface WorkbenchPreferences {
  readonly landingPage: string;
  readonly defaultWorkspace: string;
  readonly sidebarCollapsed: boolean;
  readonly pinnedWorkspaces: readonly string[];
  readonly recentWorkspaces: readonly string[];
}

export interface NotificationPreferences {
  readonly email: boolean;
  readonly inApp: boolean;
  readonly digest: "off" | "daily" | "weekly";
}

export interface AccessibilityPreferences {
  readonly reducedMotion: boolean;
  readonly highContrast: boolean;
  readonly focusIndicators: "default" | "enhanced";
}

export interface UserPreferences {
  readonly appearance: AppearancePreferences;
  readonly regional: RegionalPreferences;
  readonly workbench: WorkbenchPreferences;
  readonly notifications: NotificationPreferences;
  readonly accessibility: AccessibilityPreferences;
}

export interface PreferenceRecord {
  readonly preferenceId: string;
  readonly userId: string;
  readonly category: PersonalisationCategory;
  readonly preferenceKey: string;
  readonly value: unknown;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface FavoriteItem {
  readonly favoriteId: string;
  readonly userId: string;
  readonly itemType: string;
  readonly itemKey: string;
  readonly label: string;
  readonly metadata: Record<string, unknown>;
  readonly createdAt: string;
}

export interface RecentItem {
  readonly recentId: string;
  readonly userId: string;
  readonly itemType: string;
  readonly itemKey: string;
  readonly label: string;
  readonly accessedAt: string;
}

export interface WorkbenchLayoutRecord {
  readonly userId: string;
  readonly layout: Record<string, unknown>;
  readonly updatedAt: string;
}

export interface PersonalisationDiagnostics {
  readonly preferenceCount: number;
  readonly favoriteCount: number;
  readonly recentItemCount: number;
  readonly workbenchLayoutCount: number;
  readonly storageBackend: "memory" | "postgres" | "hybrid";
}

export interface UpsertPreferenceInput {
  readonly userId: string;
  readonly category: PersonalisationCategory;
  readonly preferenceKey: string;
  readonly value: unknown;
}

export interface AddFavoriteInput {
  readonly userId: string;
  readonly itemType: string;
  readonly itemKey: string;
  readonly label: string;
  readonly metadata?: Record<string, unknown>;
}

export interface TrackRecentItemInput {
  readonly userId: string;
  readonly itemType: string;
  readonly itemKey: string;
  readonly label: string;
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  appearance: {
    theme: "system",
    density: "comfortable",
  },
  regional: {
    language: "en",
    timezone: "UTC",
    dateFormat: "YYYY-MM-DD",
    timeFormat: "24h",
  },
  workbench: {
    landingPage: "/workspace/home",
    defaultWorkspace: "home",
    sidebarCollapsed: false,
    pinnedWorkspaces: [],
    recentWorkspaces: [],
  },
  notifications: {
    email: true,
    inApp: true,
    digest: "off",
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    focusIndicators: "default",
  },
};

export const MAX_RECENT_ITEMS = 25;
