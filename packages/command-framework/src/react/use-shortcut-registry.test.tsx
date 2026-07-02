import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import type { ActionRegistryDto } from "../server/map-action-registry-dto";
import { CommandRegistryProvider } from "./command-registry-context";
import { useShortcutRegistry } from "./use-shortcut-registry";

function sampleDto(): ActionRegistryDto {
  return {
    actions: [
      {
        id: "platform.theme.toggle",
        label: "Toggle Theme",
        handler: "service:theme-service:toggle",
        handlerKind: "service",
        source: "manifest",
        shortcut: "Ctrl+Shift+T",
      },
    ],
    toolbar: [],
  };
}

function createWrapper(dto: ActionRegistryDto = sampleDto()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <CommandRegistryProvider dto={dto}>{children}</CommandRegistryProvider>;
  };
}

describe("useShortcutRegistry", () => {
  it("exposes hydrated shortcuts and diagnostics from context", async () => {
    const { result } = renderHook(() => useShortcutRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.diagnostics.registrationCount).toBe(1);
    });

    expect(result.current.lookup("ctrl+shift+t")).toBe("platform.theme.toggle");
    expect(result.current.conflicts).toEqual([]);
  });

  it("resolves keyboard events to action ids", async () => {
    const { result } = renderHook(() => useShortcutRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.diagnostics.registrationCount).toBe(1);
    });

    expect(
      result.current.resolve({
        key: "t",
        ctrlKey: true,
        shiftKey: true,
        metaKey: false,
        altKey: false,
      }),
    ).toBe("platform.theme.toggle");
  });

  it("throws when used outside provider", () => {
    expect(() => renderHook(() => useShortcutRegistry())).toThrow(
      "useCommandRegistry must be used within CommandRegistryProvider",
    );
  });
});
