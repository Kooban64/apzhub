import { describe, expect, it } from "vitest";

import { createMemorySessionStore } from "./memory-session-store";
import { createEmptySessionPayload } from "./workbench-session-payload";
import { createWorkbenchSessionStorageKey } from "./session-store";

describe("MemorySessionStore", () => {
  it("saves and loads session payloads", async () => {
    const store = createMemorySessionStore();
    const payload = createEmptySessionPayload("home");

    await store.save("user-1", payload);
    const loaded = await store.load("user-1");

    expect(loaded?.activeWorkspace).toBe("home");
  });

  it("clears stored sessions", async () => {
    const store = createMemorySessionStore();
    await store.save("user-1", createEmptySessionPayload("home"));
    await store.clear("user-1");

    expect(await store.load("user-1")).toBeNull();
  });
});

describe("session storage key", () => {
  it("uses the apzhub workbench session key format", () => {
    expect(createWorkbenchSessionStorageKey("abc123")).toBe(
      "apzhub:workbench:session:abc123",
    );
  });
});
