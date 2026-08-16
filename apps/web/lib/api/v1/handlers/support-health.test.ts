import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("../gateway/bootstrap", () => ({
  getPlatformApiGatewayBootstrap: vi.fn(async () => ({ zammadEnabled: false })),
  getPlatformServiceGateway: vi.fn(),
}));

import { handleGetSupportHealth } from "./support-health";
import { getPlatformApiGatewayBootstrap } from "../gateway/bootstrap";

describe("handleGetSupportHealth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns disabled engine honesty when integration off", async () => {
    vi.mocked(getPlatformApiGatewayBootstrap).mockResolvedValue({
      zammadEnabled: false,
    } as never);

    const response = await handleGetSupportHealth(
      { method: "GET" } as never,
      {
        serviceContext: {
          userId: "u1",
          tenantId: "t1",
          permissions: ["support.requests.list"],
          correlationId: "c1",
        },
        tracing: { correlationId: "c1", requestId: "r1" },
        session: { user: { id: "u1" } },
      } as never,
    );
    const body = await response.json();
    expect(body.data.product).toBe("support");
    expect(body.data.authentikUsed).toBe(false);
    expect(body.data.engine.integrationEnabled).toBe(false);
    expect(body.data.engine.healthStatus).toBe("disabled");
  });
});
