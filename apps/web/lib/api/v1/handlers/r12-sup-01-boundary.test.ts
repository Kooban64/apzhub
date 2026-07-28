import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = join(__dirname, "../../../../../../");

describe("R12-SUP-01 boundary", () => {
  it("exposes Zammad CE webhook ingress route", () => {
    const route = join(
      repoRoot,
      "apps/web/app/api/v1/integrations/zammad/webhooks/route.ts",
    );
    expect(existsSync(route)).toBe(true);
    const body = readFileSync(route, "utf8");
    expect(body).toContain("handlePostZammadWebhookIngress");
  });

  it("exports Zammad verifier and ingress pipeline from adapter", async () => {
    const mod = await import("@apzhub/integration-zammad");
    expect(typeof mod.createZammadWebhookVerifier).toBe("function");
    expect(typeof mod.createZammadWebhookIngressPipeline).toBe("function");
    expect(typeof mod.computeZammadWebhookSignature).toBe("function");
  });
});
