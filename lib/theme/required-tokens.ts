/**
 * Canonical CSS custom properties that every shipped theme + density must define on `html`.
 * Keep aligned with `app/theme-data.css` and product UI rules.
 */
export const REQUIRED_THEME_CSS_VARS = [
  "--background",
  "--foreground",
  "--surface",
  "--surface-elevated",
  "--panel",
  "--border",
  "--muted-foreground",
  "--primary",
  "--ring",
  "--accent",
  "--destructive",
  "--success",
  "--warning",
  "--sidebar",
  "--sidebar-foreground",
  "--sidebar-accent",
  "--sidebar-border",
  "--sidebar-ring",
] as const;

export const REQUIRED_DENSITY_CSS_VARS = ["--shell-pad", "--shell-gap", "--shell-rail-width"] as const;

export type RequiredThemeCssVar = (typeof REQUIRED_THEME_CSS_VARS)[number];
export type RequiredDensityCssVar = (typeof REQUIRED_DENSITY_CSS_VARS)[number];
