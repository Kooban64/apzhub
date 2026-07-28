import { describe, expect, it } from "vitest";

import {
  computeZammadWebhookSignature,
  createZammadWebhookIngressPipeline,
  createZammadWebhookVerifier,
  ZAMMAD_WEBHOOK_DELIVERY_HEADER,
  ZAMMAD_WEBHOOK_SIGNATURE_HEADER,
} from "../index";

const SECRET = "zammad-test-signature-token";

describe("Zammad webhook ingress (R12-SUP-01)", () => {
  it("verifies X-Hub-Signature HMAC-SHA1", async () => {
    const body = JSON.stringify({
      event: "ticket",
      action: "create",
      ticket: { id: 42, title: "Ingress", state: "new" },
    });
    const signature = computeZammadWebhookSignature(SECRET, body);
    const verifier = createZammadWebhookVerifier({
      resolveSecret: async () => SECRET,
    });

    const ok = await verifier.verify({
      rawBody: body,
      headers: { [ZAMMAD_WEBHOOK_SIGNATURE_HEADER]: signature },
      secretRef: { credentialRef: "zammad.webhook.signature_token" },
      correlationId: "corr-1",
      tenantId: "tenant-a",
    });
    expect(ok.ok).toBe(true);
    expect(ok.algorithm).toBe("sha1");

    const bad = await verifier.verify({
      rawBody: body,
      headers: { [ZAMMAD_WEBHOOK_SIGNATURE_HEADER]: "sha1=deadbeef" },
      secretRef: { credentialRef: "zammad.webhook.signature_token" },
      correlationId: "corr-2",
      tenantId: "tenant-a",
    });
    expect(bad.ok).toBe(false);
  });

  it("translates ticket create through ingress pipeline", async () => {
    const body = JSON.stringify({
      event: "ticket",
      action: "create",
      ticket: { id: 7, title: "New ticket", state: "new" },
    });
    const signature = computeZammadWebhookSignature(SECRET, body);
    const pipeline = createZammadWebhookIngressPipeline({
      verifier: createZammadWebhookVerifier({
        resolveSecret: async () => SECRET,
      }),
    });

    const result = await pipeline.process({
      rawBody: body,
      headers: {
        [ZAMMAD_WEBHOOK_SIGNATURE_HEADER]: signature,
        [ZAMMAD_WEBHOOK_DELIVERY_HEADER]: "delivery-7",
      },
      context: {
        correlationId: "corr-pipeline",
        tenantId: "tenant-a",
        integrationId: "zammad",
        providerId: "zammad",
        deliveryId: "delivery-7",
      },
      verification: {
        secretRef: { credentialRef: "zammad.webhook.signature_token" },
      },
    });

    expect(result.ok).toBe(true);
    expect(result.outcome).toBe("accepted");
    expect(result.event?.eventType).toBe("support_request.created");
    expect(result.event?.providerId).toBe("zammad");
  });

  it("translates attachment webhook payloads as metadata (R12-SUP-02)", async () => {
    const body = JSON.stringify({
      event: "attachment",
      attachment: { id: 1 },
      ticket: { id: 9 },
    });
    const signature = computeZammadWebhookSignature(SECRET, body);
    const pipeline = createZammadWebhookIngressPipeline({
      verifier: createZammadWebhookVerifier({
        resolveSecret: async () => SECRET,
      }),
    });

    const result = await pipeline.process({
      rawBody: body,
      headers: { [ZAMMAD_WEBHOOK_SIGNATURE_HEADER]: signature },
      context: {
        correlationId: "corr-attach",
        tenantId: "tenant-a",
        integrationId: "zammad",
        providerId: "zammad",
      },
      verification: {
        secretRef: { credentialRef: "zammad.webhook.signature_token" },
      },
    });

    expect(result.ok).toBe(true);
    expect(result.outcome).toBe("accepted");
    expect(result.event?.eventType).toBe("attachment.metadata_recorded");
  });
});
