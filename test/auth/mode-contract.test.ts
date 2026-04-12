import { describe, expect, it } from "vitest";

import { adminModeAllowed, dualWorkspaceAdminMode } from "@/lib/auth/mode-contract";
import { mockAdminSession, mockUserSession } from "@/lib/auth/mock-session";

describe("mode-contract", () => {
  it("derives admin and dual mode only from availableModes", () => {
    expect(adminModeAllowed(mockUserSession())).toBe(false);
    expect(adminModeAllowed(mockAdminSession())).toBe(true);
    expect(dualWorkspaceAdminMode(mockUserSession())).toBe(false);
    expect(dualWorkspaceAdminMode(mockAdminSession())).toBe(true);
  });
});
