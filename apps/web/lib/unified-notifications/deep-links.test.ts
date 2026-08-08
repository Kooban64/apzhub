import { describe, expect, it } from "vitest";

import { productLabel, resolveNotificationDeepLink } from "./deep-links";

describe("Unified Notifications deep links", () => {
  it("maps product refs to workspace paths", () => {
    expect(
      resolveNotificationDeepLink({
        sourceProduct: "support",
        sourceObjectRef: "/support/tickets/1",
      }),
    ).toBe("/workspace/support/tickets/1");
    expect(
      resolveNotificationDeepLink({
        sourceProduct: "support",
        sourceObjectRef: "https://zammad.example/ticket/1",
      }),
    ).toBe("/workspace/support");
  });

  it("labels products for centre grouping", () => {
    expect(productLabel("support")).toBe("Support");
    expect(productLabel("documents")).toBe("Knowledge");
  });
});
