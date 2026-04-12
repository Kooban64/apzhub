/**
 * Single source for appearance enums + Zod validation (Phase 9 preflight).
 * Profile, ThemeProvider, and storage must consume theme/density only through this module or `./constants` keys re-exported here.
 */
import { z } from "zod";

import {
  APP_THEMES,
  DEFAULT_DENSITY,
  DEFAULT_THEME,
  DENSITY_STORAGE_KEY,
  DENSITIES,
  THEME_STORAGE_KEY,
  type AppThemeId,
  type DensityId,
} from "@/lib/theme/constants";

export const appThemeIdSchema = z.enum(APP_THEMES);

export const densityIdSchema = z.enum(DENSITIES);

export {
  APP_THEMES,
  DENSITIES,
  DEFAULT_THEME,
  DEFAULT_DENSITY,
  THEME_STORAGE_KEY,
  DENSITY_STORAGE_KEY,
  type AppThemeId,
  type DensityId,
};
