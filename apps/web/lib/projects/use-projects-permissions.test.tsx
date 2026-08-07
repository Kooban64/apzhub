import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { SessionAuthorizationProvider } from "@/components/session-authorization-provider";

import { useProjectsPermissions } from "./use-projects-permissions";

function wrap(permissions: readonly string[] | null) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <SessionAuthorizationProvider
        value={permissions ? { userId: "user_test", permissions, roles: [] } : null}
      >
        {children}
      </SessionAuthorizationProvider>
    );
  };
}

describe("useProjectsPermissions", () => {
  it("reads APZHUB session permissions (no projects.* default)", () => {
    const { result } = renderHook(() => useProjectsPermissions(), {
      wrapper: wrap(["projects.view"]),
    });
    expect(result.current).toEqual(["projects.view"]);
  });

  it("returns empty when session has no grants", () => {
    const { result } = renderHook(() => useProjectsPermissions(), {
      wrapper: wrap(null),
    });
    expect(result.current).toEqual([]);
  });

  it("prefers explicit override", () => {
    const { result } = renderHook(() => useProjectsPermissions(["projects.*"]), {
      wrapper: wrap(["projects.view"]),
    });
    expect(result.current).toEqual(["projects.*"]);
  });
});
