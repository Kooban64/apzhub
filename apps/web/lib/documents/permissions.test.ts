import { describe, expect, it } from "vitest";

import {
  canAdminDocuments,
  canManageDocuments,
  canViewDocuments,
  hasDocumentsPermission,
} from "./permissions";

describe("documents permissions helpers", () => {
  it("denies when source is empty or undefined", () => {
    expect(canViewDocuments(undefined)).toBe(false);
    expect(canViewDocuments([])).toBe(false);
    expect(canAdminDocuments(null)).toBe(false);
  });

  it("matches document.read and document.* / *", () => {
    expect(canViewDocuments(["document.read"])).toBe(true);
    expect(canViewDocuments(["document.*"])).toBe(true);
    expect(canViewDocuments(["*"])).toBe(true);
    expect(canViewDocuments(["document.write"])).toBe(false);
  });

  it("gates admin separately from manage", () => {
    expect(canAdminDocuments(["document.admin"])).toBe(true);
    expect(canAdminDocuments(["document.manage"])).toBe(false);
    expect(canManageDocuments(["document.manage"])).toBe(true);
    expect(hasDocumentsPermission(["document.audit"], "document.audit")).toBe(true);
  });
});
