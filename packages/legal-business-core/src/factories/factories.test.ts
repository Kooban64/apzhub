import { describe, expect, it } from "vitest";

import { ClientFactory, resetEntityIdCounter } from "../factories";

describe("ClientFactory", () => {
  it("creates a valid canonical client", () => {
    resetEntityIdCounter();
    const client = ClientFactory.create({
      displayName: "Harbourview Holdings Pty Ltd",
    });

    expect(client.displayName).toBe("Harbourview Holdings Pty Ltd");
    expect(client.clientReference).toMatch(/^CLT-\d{4}-\d{5}$/);
    expect(client.status).toBe("prospect");
  });
});
