export {
  APP_THEMES,
  DENSITIES,
  DEFAULT_DENSITY,
  DEFAULT_THEME,
  DENSITY_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from "@/lib/theme/constants";
export type { AppThemeId, DensityId } from "@/lib/theme/constants";
export { ThemeProvider, useAppTheme } from "@/lib/theme/theme-provider";
export {
  applyThemeToDocument,
  readStoredDensity,
  readStoredTheme,
} from "@/lib/theme/theme-storage";
