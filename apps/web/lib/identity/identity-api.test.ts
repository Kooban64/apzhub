import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  getActivation,
  getAudit,
  getDeactivation,
  getHistory,
  listActivations,
  listDeactivations,
  resetIdentityClient,
  setIdentityClient,
} from "./identity-api";
import { createMockIdentityClient } from "./mock-identity-client";

describe("identity-api facades", () => {
  beforeEach(() => {
    resetIdentityClient();
    setIdentityClient(createMockIdentityClient());
  });

  afterEach(() => {
    resetIdentityClient();
  });

  it("delegates activation, deactivation, audit, and history detail facades", async () => {
    const activations = await listActivations();
    expect(activations.items.length).toBeGreaterThan(0);
    const activation = await getActivation(activations.items[0]!.id);
    expect(activation.id).toBe(activations.items[0]!.id);

    const deactivations = await listDeactivations();
    expect(deactivations.items.length).toBeGreaterThan(0);
    const deactivation = await getDeactivation(deactivations.items[0]!.id);
    expect(deactivation.id).toBe(deactivations.items[0]!.id);

    const audit = await getAudit("aud_mock_1");
    expect(audit.id).toBeTruthy();

    const history = await getHistory("hist_mock_1");
    expect(history.id).toBeTruthy();
  });
});
