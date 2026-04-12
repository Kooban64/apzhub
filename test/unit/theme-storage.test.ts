import { describe, expect, it, beforeEach, afterEach } from "vitest";

import { THEME_STORAGE_KEY, DENSITY_STORAGE_KEY } from "@/lib/theme/constants";
import { applyThemeToDocument, readStoredDensity, readStoredTheme } from "@/lib/theme/theme-storage";

describe("theme-storage", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-density");
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("applyThemeToDocument sets dataset attributes", () => {
    applyThemeToDocument("graphite", "compact");
    expect(document.documentElement.dataset.theme).toBe("graphite");
    expect(document.documentElement.dataset.density).toBe("compact");
  });

  it("readStoredTheme returns default when unset", () => {
    expect(readStoredTheme()).toBe("mist-blue");
  });

  it("readStoredTheme returns stored valid theme", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "sage-green");
    expect(readStoredTheme()).toBe("sage-green");
  });

  it("readStoredDensity returns default when unset", () => {
    expect(readStoredDensity()).toBe("comfortable");
  });

  it("readStoredDensity returns stored valid density", () => {
    localStorage.setItem(DENSITY_STORAGE_KEY, "compact");
    expect(readStoredDensity()).toBe("compact");
  });
});
