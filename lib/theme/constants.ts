export const THEME_STORAGE_KEY = "apzhub.theme";
export const DENSITY_STORAGE_KEY = "apzhub.density";

export const APP_THEMES = [
  "mist-blue",
  "sage-green",
  "soft-charcoal",
  "graphite",
  "obsidian",
] as const;

export type AppThemeId = (typeof APP_THEMES)[number];

export const DENSITIES = ["comfortable", "compact"] as const;

export type DensityId = (typeof DENSITIES)[number];

export const DEFAULT_THEME: AppThemeId = "mist-blue";
export const DEFAULT_DENSITY: DensityId = "comfortable";
