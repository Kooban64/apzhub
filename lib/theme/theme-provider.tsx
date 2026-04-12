"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import { DEFAULT_DENSITY, DEFAULT_THEME, type AppThemeId, type DensityId } from "@/lib/theme/constants";
import { persistAppearanceToStorage, readStoredDensity, readStoredTheme } from "@/lib/theme/theme-storage";

type ThemeContextValue = {
  theme: AppThemeId;
  setTheme: (theme: AppThemeId) => void;
  density: DensityId;
  setDensity: (density: DensityId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppThemeId>(() =>
    typeof window === "undefined" ? DEFAULT_THEME : readStoredTheme(),
  );
  const [density, setDensityState] = useState<DensityId>(() =>
    typeof window === "undefined" ? DEFAULT_DENSITY : readStoredDensity(),
  );

  useLayoutEffect(() => {
    persistAppearanceToStorage(theme, density);
  }, [density, theme]);

  const setTheme = useCallback((next: AppThemeId) => {
    setThemeState(next);
  }, []);

  const setDensity = useCallback((next: DensityId) => {
    setDensityState(next);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      density,
      setDensity,
    }),
    [density, setDensity, setTheme, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useAppTheme must be used within ThemeProvider");
  }
  return ctx;
}
