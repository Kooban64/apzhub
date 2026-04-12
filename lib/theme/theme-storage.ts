import {
  DEFAULT_DENSITY,
  DEFAULT_THEME,
  DENSITY_STORAGE_KEY,
  THEME_STORAGE_KEY,
  type AppThemeId,
  type DensityId,
} from "@/lib/theme/constants";
import { appThemeIdSchema, densityIdSchema } from "@/lib/theme/appearance-vocabulary";

export function readStoredTheme(): AppThemeId {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  const parsed = appThemeIdSchema.safeParse(raw);
  return parsed.success ? parsed.data : DEFAULT_THEME;
}

export function readStoredDensity(): DensityId {
  if (typeof window === "undefined") {
    return DEFAULT_DENSITY;
  }
  const raw = window.localStorage.getItem(DENSITY_STORAGE_KEY);
  const parsed = densityIdSchema.safeParse(raw);
  return parsed.success ? parsed.data : DEFAULT_DENSITY;
}

export function applyThemeToDocument(theme: AppThemeId, density: DensityId) {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.density = density;
}

/** Single write path for theme + density (ThemeProvider + profile). */
export function persistAppearanceToStorage(theme: AppThemeId, density: DensityId) {
  applyThemeToDocument(theme, density);
  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.localStorage.setItem(DENSITY_STORAGE_KEY, density);
  }
}
