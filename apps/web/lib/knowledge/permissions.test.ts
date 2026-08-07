import { describe, expect, it } from "vitest";

import {
  canAdminKnowledge,
  canManageKnowledge,
  canViewKnowledge,
  hasKnowledgePermission,
} from "./permissions";

describe("knowledge permissions", () => {
  it("grants view via knowledge.view", () => {
    expect(canViewKnowledge(["knowledge.view"])).toBe(true);
    expect(canViewKnowledge(["document.read"])).toBe(false);
  });

  it("treats knowledge.admin as elevated view", () => {
    expect(canViewKnowledge(["knowledge.admin"])).toBe(true);
    expect(canAdminKnowledge(["knowledge.admin"])).toBe(true);
    expect(canAdminKnowledge(["knowledge.view"])).toBe(false);
  });

  it("allows manage via knowledge.manage or knowledge.admin", () => {
    expect(canManageKnowledge(["knowledge.manage"])).toBe(true);
    expect(canManageKnowledge(["knowledge.admin"])).toBe(true);
    expect(canManageKnowledge(["knowledge.view"])).toBe(false);
  });

  it("honours wildcards without inventing grants", () => {
    expect(hasKnowledgePermission(["*"], "knowledge.view")).toBe(true);
    expect(hasKnowledgePermission(["knowledge.*"], "knowledge.view")).toBe(true);
    expect(hasKnowledgePermission([], "knowledge.view")).toBe(false);
  });
});
