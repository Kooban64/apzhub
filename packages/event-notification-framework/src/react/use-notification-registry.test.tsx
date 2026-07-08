import { renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import { PLATFORM_NOTIFICATION_CATALOGUE } from "../catalogue/platform-notification-catalogue";
import { NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION } from "../server/notification-registry-dto-schema-version";
import type { NotificationRegistryDto } from "../server/map-notification-registry-dto";
import { createEmptyNotificationRegistryDto } from "../server/map-notification-registry-dto";
import { sampleNotificationRegistryDto } from "../client/test-fixtures";
import { NotificationRegistryProvider } from "./notification-registry-context";
import { useNotificationRegistry } from "./use-notification-registry";

function createWrapper(dto: NotificationRegistryDto = sampleNotificationRegistryDto()) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NotificationRegistryProvider dto={dto}>{children}</NotificationRegistryProvider>
    );
  };
}

describe("useNotificationRegistry", () => {
  it("returns isReady and hydrated routes after provider mount", async () => {
    const { result } = renderHook(() => useNotificationRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.routes).toHaveLength(PLATFORM_NOTIFICATION_CATALOGUE.length);
    expect(result.current.diagnostics.status).toBe("hydrated");
    expect(result.current.diagnostics.synchronisation.mode).toBe("hydration");
    expect(result.current.schemaVersion).toBe(NOTIFICATION_REGISTRY_DTO_SCHEMA_VERSION);
    expect(result.current.frameworkVersion).toBe("3.0.0");
  });

  it("get and has resolve hydrated routes", async () => {
    const { result } = renderHook(() => useNotificationRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.has("platform.toast.default")).toBe(true);
    expect(result.current.get("platform.inbox.system")?.label).toBe("System Inbox");
    expect(result.current.get("missing.route")).toBeUndefined();
  });

  it("list returns the same ordering as registry.list()", async () => {
    const { result } = renderHook(() => useNotificationRegistry(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.list().map((route) => route.routeId)).toEqual(
      result.current.routes.map((route) => route.routeId),
    );
  });

  it("reports importErrors for invalid dto", async () => {
    const invalidDto = {
      schemaVersion: 99,
      routes: [],
    } as unknown as NotificationRegistryDto;

    const { result } = renderHook(() => useNotificationRegistry(), {
      wrapper: createWrapper(invalidDto),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(false);
    });

    expect(result.current.importErrors.length).toBeGreaterThan(0);
    expect(result.current.diagnostics.status).toBe("invalid");
  });

  it("handles empty dto", async () => {
    const { result } = renderHook(() => useNotificationRegistry(), {
      wrapper: createWrapper(createEmptyNotificationRegistryDto()),
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    expect(result.current.routes).toHaveLength(0);
    expect(result.current.diagnostics.status).toBe("empty");
  });

  it("throws outside provider", () => {
    expect(() => renderHook(() => useNotificationRegistry())).toThrow(
      "useNotificationRegistry must be used within NotificationRegistryProvider",
    );
  });
});
