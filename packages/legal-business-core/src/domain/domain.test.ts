import { describe, expect, it } from "vitest";

import { CLIENT_STATUSES, DOMAIN_ENTITY_TYPES, type Client } from "../domain";

describe("domain types", () => {
  it("exports canonical client status values", () => {
    expect(CLIENT_STATUSES).toContain("active");
    expect(CLIENT_STATUSES).toHaveLength(4);
  });

  it("lists all supported canonical entities", () => {
    expect(DOMAIN_ENTITY_TYPES).toContain("client");
    expect(DOMAIN_ENTITY_TYPES).toContain("matter");
    expect(DOMAIN_ENTITY_TYPES.length).toBeGreaterThanOrEqual(40);
  });

  it("accepts a canonical client shape", () => {
    const client: Client = {
      clientId: "c1",
      clientReference: "CLT-2026-00001",
      displayName: "Example Client",
      clientType: "individual",
      status: "active",
      tags: [],
      customFields: {},
    };

    expect(client.displayName).toBe("Example Client");
  });
});
