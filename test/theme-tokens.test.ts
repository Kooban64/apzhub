import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

import { APP_THEMES, DENSITIES, type AppThemeId, type DensityId } from "@/lib/theme/constants";
import { REQUIRED_DENSITY_CSS_VARS, REQUIRED_THEME_CSS_VARS } from "@/lib/theme/required-tokens";
import { applyThemeToDocument } from "@/lib/theme/theme-storage";

function injectThemeCss() {
  const cssPath = resolve(process.cwd(), "app/theme-data.css");
  const css = readFileSync(cssPath, "utf8");
  const style = document.createElement("style");
  style.setAttribute("data-test-injected", "theme-data");
  style.textContent = css;
  document.head.appendChild(style);
}

function assertVarsOnHtml(theme: AppThemeId, density: DensityId) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.density = density;
  const el = document.documentElement;
  const cs = getComputedStyle(el);
  for (const v of REQUIRED_THEME_CSS_VARS) {
    const val = cs.getPropertyValue(v).trim();
    expect(val, `${v} empty for theme=${theme}`).not.toBe("");
  }
  for (const v of REQUIRED_DENSITY_CSS_VARS) {
    const val = cs.getPropertyValue(v).trim();
    expect(val, `${v} empty for density=${density}`).not.toBe("");
  }
}

describe("theme tokens", () => {
  beforeAll(() => {
    injectThemeCss();
  });

  it("defines required CSS variables for every theme and density", () => {
    for (const density of DENSITIES) {
      for (const theme of APP_THEMES) {
        assertVarsOnHtml(theme, density);
      }
    }
  });

  it("applyThemeToDocument only sets data-theme and data-density on html", () => {
    applyThemeToDocument("graphite", "compact");
    const dataAttrs = [...document.documentElement.attributes]
      .map((a) => a.name)
      .filter((n) => n.startsWith("data-"));
    expect(dataAttrs.sort()).toEqual(["data-density", "data-theme"].sort());
    expect(document.documentElement.dataset.theme).toBe("graphite");
    expect(document.documentElement.dataset.density).toBe("compact");
  });
});
