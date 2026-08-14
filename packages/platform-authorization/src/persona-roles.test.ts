import { describe, expect, it } from "vitest";

import {
  PERSONA_ROLE_DEFINITIONS,
  listPersonaRoles,
  DEFAULT_ORG_ADMIN_ROLE_ID,
} from "./persona-roles";
import { createInMemoryAuthorizationService } from "./index";

describe("Doc-007 personas seed", () => {
  it("lists organisation personas", () => {
    expect(listPersonaRoles().length).toBeGreaterThanOrEqual(8);
    expect(
      PERSONA_ROLE_DEFINITIONS.some((p) => p.roleId === DEFAULT_ORG_ADMIN_ROLE_ID),
    ).toBe(true);
  });

  it("seeds personas into authorization catalogue", () => {
    const { service } = createInMemoryAuthorizationService();
    for (const persona of PERSONA_ROLE_DEFINITIONS) {
      expect(service.roleService.getRole(persona.roleId)?.slug).toBe(persona.slug);
    }
    expect(
      service.permissionService
        .listPermissions()
        .some((p) => p.permissionKey === "identity.manage"),
    ).toBe(true);
    expect(
      service.permissionService
        .listPermissions()
        .some((p) => p.permissionKey === "billing.read"),
    ).toBe(true);
  });
});
