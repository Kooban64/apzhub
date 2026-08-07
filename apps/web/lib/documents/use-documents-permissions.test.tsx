import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { SessionAuthorizationProvider } from "@/components/session-authorization-provider";

import { useDocumentsPermissions } from "./use-documents-permissions";

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

describe("useDocumentsPermissions", () => {
  it("reads APZHUB session permissions (no document.* default)", () => {
    const { result } = renderHook(() => useDocumentsPermissions(), {
      wrapper: wrap(["document.read"]),
    });
    expect(result.current).toEqual(["document.read"]);
  });

  it("returns empty when session has no grants", () => {
    const { result } = renderHook(() => useDocumentsPermissions(), {
      wrapper: wrap(null),
    });
    expect(result.current).toEqual([]);
  });

  it("prefers explicit override", () => {
    const { result } = renderHook(() => useDocumentsPermissions(["document.*"]), {
      wrapper: wrap(["document.read"]),
    });
    expect(result.current).toEqual(["document.*"]);
  });
});
