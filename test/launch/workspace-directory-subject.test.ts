import { describe, expect, it } from "vitest";

import { anonymousSessionSnapshot, type SessionSnapshot } from "@/lib/auth/session-types";
import { directorySubjectIdForSession } from "@/lib/launch/workspace-launch-bridge";

function snap(partial: Partial<SessionSnapshot> & { user: NonNullable<SessionSnapshot["user"]> }): SessionSnapshot {
  return {
    ...anonymousSessionSnapshot(),
    sessionStatus: "active",
    linkedAccounts: { google: "not_linked" },
    ...partial,
  };
}

describe("directorySubjectIdForSession", () => {
  it("returns portal UUID as directory id", () => {
    const id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
    expect(
      directorySubjectIdForSession(
        snap({
          user: {
            id,
            email: "anyone@example.com",
            displayName: "Anyone",
            status: "active",
          },
          platformRole: "user",
          availableModes: ["workspace"],
          defaultLandingMode: "workspace",
          defaultLandingPath: "/workspace",
        }),
      ),
    ).toBe(id);
  });

  it("maps mock session emails to mock directory rows when present", () => {
    expect(
      directorySubjectIdForSession(
        snap({
          user: {
            id: "mock:alex.rivera@example.com",
            email: "alex.rivera@example.com",
            displayName: "Alex",
            status: "active",
          },
          platformRole: "admin",
          availableModes: ["workspace", "admin"],
          defaultLandingMode: "admin",
          defaultLandingPath: "/admin",
        }),
      ),
    ).toBe("u-1001");
  });

  it("falls back to legacy ops.admin / pat@ heuristics", () => {
    expect(
      directorySubjectIdForSession(
        snap({
          user: {
            id: "mock:x@example.com",
            email: "ops.admin@example.com",
            displayName: "Ops",
            status: "active",
          },
          platformRole: "superadmin",
          availableModes: ["workspace", "admin"],
          defaultLandingMode: "admin",
          defaultLandingPath: "/admin",
        }),
      ),
    ).toBe("u-1001");
    expect(
      directorySubjectIdForSession(
        snap({
          user: {
            id: "mock:y@example.com",
            email: "pat@example.com",
            displayName: "Pat",
            status: "active",
          },
          platformRole: "user",
          availableModes: ["workspace"],
          defaultLandingMode: "workspace",
          defaultLandingPath: "/workspace",
        }),
      ),
    ).toBe("u-1002");
  });
});
