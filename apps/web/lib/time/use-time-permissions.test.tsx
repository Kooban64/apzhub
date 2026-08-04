import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { SessionAuthorizationProvider } from "@/components/session-authorization-provider";

import { canCreateTimesheets, canViewTime } from "./permissions";
import { useTimePermissions } from "./use-time-permissions";

function wrap(permissions: readonly string[]) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <SessionAuthorizationProvider
        value={{ userId: "user_test", roles: ["tenant-member"], permissions }}
      >
        {children}
      </SessionAuthorizationProvider>
    );
  };
}

describe("useTimePermissions", () => {
  it("reads APZHUB session permissions (no time.* default)", () => {
    const { result } = renderHook(() => useTimePermissions(), {
      wrapper: wrap(["time.view", "time.timesheet.list"]),
    });
    expect(canViewTime(result.current)).toBe(true);
    expect(canCreateTimesheets(result.current)).toBe(false);
  });

  it("denies when session has no Time grants", () => {
    const { result } = renderHook(() => useTimePermissions(), {
      wrapper: wrap(["search.execute"]),
    });
    expect(canViewTime(result.current)).toBe(false);
    expect(canCreateTimesheets(result.current)).toBe(false);
  });

  it("honours explicit override for tests", () => {
    const { result } = renderHook(() => useTimePermissions(["time.*"]), {
      wrapper: wrap([]),
    });
    expect(canCreateTimesheets(result.current)).toBe(true);
  });
});
