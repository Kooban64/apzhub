import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { createPlatformScm } from "./sdk/create-scm";

describe("APZQEP-162 platform-scm", () => {
  it("registers GitHub as active and others as placeholders", () => {
    const scm = createPlatformScm({ githubOffline: true });
    const providers = scm.registry.list();
    expect(
      providers.some((p) => p.providerId === "github" && p.status === "active"),
    ).toBe(true);
    expect(
      providers.filter((p) => p.status === "placeholder").length,
    ).toBeGreaterThanOrEqual(4);
  });

  it("registers a repository through GitHub offline provider", async () => {
    const events: string[] = [];
    const scm = createPlatformScm({
      githubOffline: true,
      publishEvent: (event) => {
        events.push(event.type);
      },
    });

    await scm.engine.connectProvider("tenant-1", "github", "corr-1");
    const repository = await scm.engine.registerRepository({
      tenantId: "tenant-1",
      providerId: "github",
      fullName: "apzor/apzhub",
      registeredBy: "user-1",
    });

    expect(repository.state).toBe("enabled");
    expect(repository.providerId).toBe("github");
    expect(events).toContain("platform.scm.provider.connected");
    expect(events).toContain("platform.scm.repository.registered");
  });

  it("rejects placeholder provider repository registration", async () => {
    const scm = createPlatformScm({ githubOffline: true });
    await expect(
      scm.engine.registerRepository({
        tenantId: "tenant-1",
        providerId: "gitlab",
        fullName: "org/repo",
        registeredBy: "user-1",
      }),
    ).rejects.toThrow(/placeholder/i);
  });

  it("verifies GitHub webhook signatures and publishes neutral events", async () => {
    const events: string[] = [];
    const secret = "test-webhook-secret";
    const scm = createPlatformScm({
      githubOffline: true,
      webhookSecrets: { github: secret },
      publishEvent: (event) => {
        events.push(event.type);
      },
    });

    await scm.engine.registerRepository({
      tenantId: "tenant-1",
      providerId: "github",
      fullName: "apzor/apzhub",
      registeredBy: "user-1",
    });

    const payload = {
      ref: "refs/heads/main",
      repository: { full_name: "apzor/apzhub" },
      head_commit: { id: "abcdef1234567890" },
    };
    const rawBody = JSON.stringify(payload);
    const signature = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;

    const result = await scm.engine.ingestWebhook({
      tenantId: "tenant-1",
      providerId: "github",
      headers: {
        "x-github-event": "push",
        "x-github-delivery": "delivery-1",
        "x-hub-signature-256": signature,
      },
      rawBody,
      payload,
    });

    expect(result.audit.state).toBe("processed");
    expect(events).toContain("platform.scm.webhook.received");
    expect(events).toContain("platform.scm.commit.received");
  });

  it("is idempotent for duplicate webhook deliveries", async () => {
    const secret = "test-webhook-secret";
    const scm = createPlatformScm({
      githubOffline: true,
      webhookSecrets: { github: secret },
    });
    const payload = {
      repository: { full_name: "apzor/apzhub" },
      action: "opened",
      pull_request: { number: 7 },
    };
    const rawBody = JSON.stringify(payload);
    const signature = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
    const headers = {
      "x-github-event": "pull_request",
      "x-github-delivery": "delivery-dup",
      "x-hub-signature-256": signature,
    };

    const first = await scm.engine.ingestWebhook({
      tenantId: "tenant-1",
      providerId: "github",
      headers,
      rawBody,
      payload,
    });
    const second = await scm.engine.ingestWebhook({
      tenantId: "tenant-1",
      providerId: "github",
      headers,
      rawBody,
      payload,
    });

    expect(first.audit.state).toBe("processed");
    expect(second.audit.state).toBe("replayed");
  });

  it("never exposes github types on public repository records", async () => {
    const scm = createPlatformScm({ githubOffline: true });
    const repository = await scm.engine.registerRepository({
      tenantId: "tenant-1",
      providerId: "github",
      fullName: "apzor/apzhub",
      registeredBy: "user-1",
    });
    const serialized = JSON.stringify(repository);
    expect(serialized).not.toMatch(/octokit|rest\.github|@octokit/i);
    expect(repository.providerId).toBe("github");
  });

  it("records traceability links without AI analysis", async () => {
    const scm = createPlatformScm({ githubOffline: true });
    const repository = await scm.engine.registerRepository({
      tenantId: "tenant-1",
      providerId: "github",
      fullName: "apzor/apzhub",
      registeredBy: "user-1",
    });
    const link = scm.engine.addTraceabilityLink({
      tenantId: "tenant-1",
      repositoryId: repository.repositoryId,
      kind: "evidence",
      externalRef: "sha:offline-commit-1",
      platformRef: "evidence://automation/demo",
      createdBy: "user-1",
    });
    expect(link.kind).toBe("evidence");
    expect(scm.engine.listTraceabilityLinks(repository.repositoryId)).toHaveLength(1);
  });
});
