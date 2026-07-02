import { describe, expect, it } from "vitest";

import { createLocalStorageSessionStore } from "./local-storage-session-store";
import { createEmptySessionPayload } from "./workbench-session-payload";
import { createWorkbenchSessionStorageKey } from "./session-store";

describe("LocalStorageSessionStore", () => {
  it("persists payloads via the configured storage key", async () => {
    const storage = createMockStorage();
    const store = createLocalStorageSessionStore({ storage });
    const payload = {
      ...createEmptySessionPayload("home"),
      focusedViewId: "platform-home-overview",
    };

    await store.save("user-1", payload);
    const key = createWorkbenchSessionStorageKey("user-1");
    expect(storage.getItem(key)).toContain("platform-home-overview");

    const loaded = await store.load("user-1");
    expect(loaded?.focusedViewId).toBe("platform-home-overview");
  });

  it("clears invalid stored payloads", async () => {
    const storage = createMockStorage();
    const store = createLocalStorageSessionStore({ storage });
    const key = createWorkbenchSessionStorageKey("user-1");
    storage.setItem(key, "{ invalid json");

    expect(await store.load("user-1")).toBeNull();
    expect(storage.getItem(key)).toBeNull();
  });
});

function createMockStorage(): Storage {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    clear() {
      data.clear();
    },
    getItem(key: string) {
      return data.get(key) ?? null;
    },
    key(index: number) {
      return [...data.keys()][index] ?? null;
    },
    removeItem(key: string) {
      data.delete(key);
    },
    setItem(key: string, value: string) {
      data.set(key, value);
    },
  };
}
