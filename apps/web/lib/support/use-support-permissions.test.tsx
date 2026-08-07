import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { SessionAuthorizationProvider } from "@/components/session-authorization-provider";

import { useSupportPermissions } from "./use-support-permissions";

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

describe("useSupportPermissions", () => {
  it("reads APZHUB session permissions (no support.* default)", () => {
    const { result } = renderHook(() => useSupportPermissions(), {
      wrapper: wrap(["support.requests.list"]),
    });
    expect(result.current).toEqual(["support.requests.list"]);
  });

  it("returns empty when session has no grants", () => {
    const { result } = renderHook(() => useSupportPermissions(), {
      wrapper: wrap(null),
    });
    expect(result.current).toEqual([]);
  });

  it("prefers explicit override", () => {
    const { result } = renderHook(() => useSupportPermissions(["support.*"]), {
      wrapper: wrap(["support.requests.list"]),
    });
    expect(result.current).toEqual(["support.*"]);
  });
});
