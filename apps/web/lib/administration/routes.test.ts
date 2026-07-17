import { describe, expect, it } from "vitest";

import {
  ADMINISTRATION_API_BASE,
  ADMINISTRATION_WORKSPACE_BASE,
  administrationSectionPath,
  assertAdministrationApiPath,
  isAdministrationApiPath,
  isAdministrationRoute,
  resolveAdministrationSection,
} from "./routes";

describe("administration routes", () => {
  it("detects administration API paths", () => {
    expect(isAdministrationApiPath(ADMINISTRATION_API_BASE)).toBe(true);
    expect(isAdministrationApiPath(`${ADMINISTRATION_API_BASE}/modules`)).toBe(
      true,
    );
    expect(isAdministrationApiPath("/api/v1/configuration")).toBe(false);
  });

  it("rejects paths outside base and forbidden segments", () => {
    expect(() => assertAdministrationApiPath("/api/v1/other")).toThrow(
      /may only call/,
    );
    expect(() =>
      assertAdministrationApiPath(`${ADMINISTRATION_API_BASE}/runtime`),
    ).toThrow(/Forbidden/);
    expect(() =>
      assertAdministrationApiPath(`${ADMINISTRATION_API_BASE}/users`),
    ).toThrow(/Forbidden/);
    expect(() =>
      assertAdministrationApiPath(`${ADMINISTRATION_API_BASE}/modules`),
    ).not.toThrow();
  });

  it("resolves workspace sections", () => {
    expect(isAdministrationRoute(ADMINISTRATION_WORKSPACE_BASE)).toBe(true);
    expect(resolveAdministrationSection("/workspace/administration")).toBe(
      "overview",
    );
    expect(
      resolveAdministrationSection("/workspace/administration/modules"),
    ).toBe("modules");
    expect(
      resolveAdministrationSection("/workspace/administration/unknown"),
    ).toBe("overview");
    expect(administrationSectionPath("diagnostics")).toBe(
      "/workspace/administration/diagnostics",
    );
    expect(administrationSectionPath("overview")).toBe(
      "/workspace/administration/overview",
    );
  });
});
