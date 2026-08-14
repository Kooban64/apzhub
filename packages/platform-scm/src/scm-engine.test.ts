import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import { createPlatformScm } from "./sdk/create-scm";

describe("APZQEP-162 platform-scm", () => {
  it("registers GitHub and GitLab as active and others as placeholders", () => {
    const scm = createPlatformScm({ githubOffline: true, gitlabOffline: true });
    const providers = scm.registry.list();
    expect(
      providers.some((p) => p.providerId === "github" && p.status === "active"),
    ).toBe(true);
    expect(
      providers.some((p) => p.providerId === "gitlab" && p.status === "active"),
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
        providerId: "bitbucket",
        fullName: "org/repo",
        registeredBy: "user-1",
      }),
    ).rejects.toThrow(/placeholder/i);
  });

  it("registers a repository through GitLab offline provider", async () => {
    const scm = createPlatformScm({ gitlabOffline: true });
    const repository = await scm.engine.registerRepository({
      tenantId: "tenant-1",
      providerId: "gitlab",
      fullName: "apzor/apzhub",
      registeredBy: "user-1",
    });
    expect(repository.providerId).toBe("gitlab");
    expect(repository.state).toBe("enabled");
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
    const link = await scm.engine.addTraceabilityLink({
      tenantId: "tenant-1",
      repositoryId: repository.repositoryId,
      kind: "evidence",
      externalRef: "sha:offline-commit-1",
      platformRef: "evidence://automation/demo",
      createdBy: "user-1",
    });
    expect(link.kind).toBe("evidence");
    expect(
      await scm.engine.listTraceabilityLinks(repository.repositoryId),
    ).toHaveLength(1);
  });

  it("F1: persists durable commit change events from push webhooks", async () => {
    const secret = "test-webhook-secret";
    const scm = createPlatformScm({
      githubOffline: true,
      webhookSecrets: { github: secret },
    });
    const repository = await scm.engine.registerRepository({
      tenantId: "tenant-1",
      providerId: "github",
      fullName: "apzor/apzhub",
      registeredBy: "user-1",
    });

    const payload = {
      ref: "refs/heads/main",
      repository: { full_name: "apzor/apzhub" },
      pusher: { name: "dev" },
      commits: [
        {
          id: "abc123deadbeef01",
          message: "feat: heartbeat",
          author: { name: "Dev", username: "dev" },
          added: ["apps/web/lib/qep/scm-runtime.ts"],
          modified: [],
          removed: [],
        },
      ],
    };
    const rawBody = JSON.stringify(payload);
    const signature = `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;

    const result = await scm.engine.ingestWebhook({
      tenantId: "tenant-1",
      providerId: "github",
      headers: {
        "x-github-event": "push",
        "x-github-delivery": "delivery-f1",
        "x-hub-signature-256": signature,
      },
      rawBody,
      payload,
      correlationId: "corr-f1",
    });

    expect(result.audit.state).toBe("processed");
    const changes = await scm.engine.listChangeEvents({
      tenantId: "tenant-1",
      repositoryId: repository.repositoryId,
    });
    expect(changes.length).toBeGreaterThanOrEqual(1);
    expect(changes[0]?.kind).toBe("commit");
    expect(changes[0]?.sha).toBe("abc123deadbeef01");
    expect(changes[0]?.filesChanged).toContain("apps/web/lib/qep/scm-runtime.ts");
    expect(changes[0]?.correlationId).toBe("corr-f1");
    expect(changes[0]?.source).toBe("webhook");
  });

  it("F1: sync persists durable commit and PR change events", async () => {
    const scm = createPlatformScm({ githubOffline: true });
    scm.engine.setDefaultCredentials("tenant-1", "github", { kind: "none" });
    const repository = await scm.engine.registerRepository({
      tenantId: "tenant-1",
      providerId: "github",
      fullName: "apzor/apzhub",
      registeredBy: "user-1",
    });
    await scm.engine.syncRepository(repository.repositoryId, "corr-sync");
    const changes = await scm.engine.listChangeEvents({
      tenantId: "tenant-1",
      repositoryId: repository.repositoryId,
    });
    expect(changes.some((change) => change.kind === "commit")).toBe(true);
    expect(changes.every((change) => change.source === "sync")).toBe(true);
  });
});
