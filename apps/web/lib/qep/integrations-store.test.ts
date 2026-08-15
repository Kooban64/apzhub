import { beforeEach, describe, expect, it } from "vitest";

import {
  listConnectorStates,
  recordSync,
  resetIntegrationsStoreForTests,
  upsertConnectorState,
} from "./integrations-store";

describe("integrations-store (SPR-APZQEP-220-D)", () => {
  beforeEach(() => {
    resetIntegrationsStoreForTests();
  });

  it("upserts connector state with enabled default true semantics", () => {
    const row = upsertConnectorState({
      providerId: "github-actions",
      source: "automation",
      enabled: true,
      actorId: "user-1",
    });
    expect(row.providerId).toBe("github-actions");
    expect(row.source).toBe("automation");
    expect(row.enabled).toBe(true);
    expect(row.lastSyncAt).toBeUndefined();
    expect(listConnectorStates()).toHaveLength(1);
  });

  it("disables and re-enables without clearing lastSyncAt", () => {
    upsertConnectorState({
      providerId: "github",
      source: "scm",
      enabled: true,
      actorId: "user-1",
    });
    const synced = recordSync("github");
    expect(synced?.lastSyncAt).toBeTruthy();

    const disabled = upsertConnectorState({
      providerId: "github",
      source: "scm",
      enabled: false,
      actorId: "user-2",
    });
    expect(disabled.enabled).toBe(false);
    expect(disabled.lastSyncAt).toBe(synced?.lastSyncAt);
    expect(disabled.updatedBy).toBe("user-2");

    const enabled = upsertConnectorState({
      providerId: "github",
      source: "scm",
      enabled: true,
      actorId: "user-2",
    });
    expect(enabled.enabled).toBe(true);
    expect(enabled.lastSyncAt).toBe(synced?.lastSyncAt);
  });

  it("records sync by providerId and returns null when missing", () => {
    expect(recordSync("missing")).toBeNull();
    upsertConnectorState({
      providerId: "gitlab-ci",
      source: "automation",
      enabled: true,
      actorId: "user-1",
    });
    const synced = recordSync("gitlab-ci");
    expect(synced?.lastSyncAt).toMatch(/^\d{4}-/);
    expect(listConnectorStates()[0]?.lastSyncAt).toBe(synced?.lastSyncAt);
  });

  it("keeps automation and scm rows for the same providerId distinct", () => {
    upsertConnectorState({
      providerId: "github",
      source: "automation",
      enabled: true,
      actorId: "user-1",
    });
    upsertConnectorState({
      providerId: "github",
      source: "scm",
      enabled: false,
      actorId: "user-1",
    });
    expect(listConnectorStates()).toHaveLength(2);
  });
});
