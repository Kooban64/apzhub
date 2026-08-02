import { describe, expect, it } from "vitest";

import {
  createInMemoryOutboxStore,
  createNullTransportAdapter,
  createOutboxWorker,
  createTransportDeliveryHandler,
} from "@apzhub/platform-outbox";
import {
  createInMemoryProcessingStore,
  createProcessingWorker,
  createProcessorRegistry,
  enqueueProcessingWork,
} from "@apzhub/platform-processing";
import {
  buildQepEvidenceEventEnvelope,
  createEvidenceProcessorRegistry,
  createInMemoryEvidenceBusinessActionPort,
} from "@apzhub/qep-evidence/application";

import {
  CHANNEL_IDS,
  QEP_NOTIFICATION_VERSION,
  createNotificationSubscriptionPlatform,
  createSubscriptionManager,
  createSubscriptionRegistry,
  createTemplateResolver,
  createTemplateRegistry,
  enqueueNotificationDeliveryIntent,
  evaluatePreference,
  createInMemoryPreferenceStore,
  EVIDENCE_NOTIFICATION_TEMPLATES,
  NOTIFICATION_DELIVERY_OUTBOX_EVENT,
} from "./index";

describe("APZQEP-120-S12 Notification & Subscription Platform", () => {
  it("exports version 0.1.0", () => {
    expect(QEP_NOTIFICATION_VERSION).toBe("0.1.0");
  });

  it("resolves configurable subscriptions without hard-coding", () => {
    const registry = createSubscriptionRegistry();
    const manager = createSubscriptionManager(registry);
    manager.create({
      subscriptionId: "sub-user-1",
      name: "User evidence",
      eventTypes: ["qep.evidence.created"],
      scope: { kind: "user", subjectId: "u1", tenantId: "t1" },
      channels: [CHANNEL_IDS.internal],
      templateId: "qep.notification.template.evidence.created",
      classificationDefaults: {
        severity: "info",
        priority: "normal",
        category: "evidence",
        audience: "user",
      },
      now: "2026-08-02T16:00:00.000Z",
    });
    expect(registry.listByEventType("qep.evidence.created")).toHaveLength(1);
    expect(registry.listByEventType("qep.evidence.deleted")).toHaveLength(0);
  });

  it("resolves preferences (channel / category / severity)", () => {
    const store = createInMemoryPreferenceStore([
      {
        preferenceId: "p1",
        tenantId: "t1",
        subjectKind: "user",
        subjectId: "u1",
        allowedChannels: [CHANNEL_IDS.internal],
        mutedCategories: ["security"],
        minSeverity: "warning",
        enabled: true,
      },
    ]);
    const pref = store.get({
      tenantId: "t1",
      subjectKind: "user",
      subjectId: "u1",
    });
    expect(
      evaluatePreference({
        preference: pref,
        channelId: CHANNEL_IDS.internal,
        category: "evidence",
        severity: "info",
      }).allow,
    ).toBe(false);
    expect(
      evaluatePreference({
        preference: pref,
        channelId: CHANNEL_IDS.internal,
        category: "evidence",
        severity: "warning",
      }).allow,
    ).toBe(true);
    expect(
      evaluatePreference({
        preference: pref,
        channelId: CHANNEL_IDS.email,
        category: "evidence",
        severity: "critical",
      }).allow,
    ).toBe(false);
  });

  it("renders templates with variable substitution and locale hooks", () => {
    const registry = createTemplateRegistry([...EVIDENCE_NOTIFICATION_TEMPLATES]);
    registry.register({
      templateId: "tpl.localised",
      name: "Localised",
      category: "platform",
      defaultSeverity: "info",
      defaultPriority: "normal",
      titleTemplate: "Hello {{name}}",
      bodyTemplate: "Body {{name}}",
      defaultLocale: "en",
      localisation: {
        fr: {
          titleTemplate: "Bonjour {{name}}",
          bodyTemplate: "Corps {{name}}",
        },
      },
    });
    const resolver = createTemplateResolver(registry);
    const en = resolver.resolve({
      templateId: "tpl.localised",
      variables: { name: "Kooban" },
      locale: "en",
    });
    const fr = resolver.resolve({
      templateId: "tpl.localised",
      variables: { name: "Kooban" },
      locale: "fr",
    });
    expect(en.ok && en.rendered.title).toBe("Hello Kooban");
    expect(fr.ok && fr.rendered.title).toBe("Bonjour Kooban");
  });

  it("delivers via Internal channel with classification metadata", async () => {
    const platform = createNotificationSubscriptionPlatform();
    platform.seedEvidenceTenantSubscription({
      subscriptionIdPrefix: "sub.t1",
      tenantId: "tenant-a",
      subjectId: "ops-inbox",
      now: "2026-08-02T16:10:00.000Z",
    });

    const result = await platform.engine.processFact({
      eventType: "qep.evidence.created",
      tenantId: "tenant-a",
      correlationId: "corr-1",
      sourceEventId: "env-1",
      payload: {
        evidenceId: "ev-1",
        title: "Safety Report",
        tenantId: "tenant-a",
      },
      now: "2026-08-02T16:10:01.000Z",
    });

    expect(result.delivered).toBe(1);
    expect(result.ok).toBe(true);

    const inbox = platform.inbox.list({
      tenantId: "tenant-a",
      recipientSubjectId: "ops-inbox",
    });
    expect(inbox).toHaveLength(1);
    expect(inbox[0]?.title).toContain("Safety Report");
    expect(inbox[0]?.classification.severity).toBe("info");
    expect(inbox[0]?.classification.category).toBe("evidence");
    expect(inbox[0]?.classification.audience).toBe("tenant");
    expect(inbox[0]?.classification.correlationId).toBe("corr-1");

    const delivery = platform.deliveries.list("tenant-a")[0];
    expect(delivery?.status).toBe("delivered");
    expect(platform.audit.list().some((a) => a.action === "delivered")).toBe(true);
  });

  it("routes only to implemented channels (internal)", async () => {
    const platform = createNotificationSubscriptionPlatform();
    platform.subscriptionManager.create({
      subscriptionId: "sub.email-attempt",
      name: "Would-be email",
      eventTypes: ["qep.evidence.created"],
      scope: { kind: "user", subjectId: "u1", tenantId: "t" },
      channels: [CHANNEL_IDS.email],
      templateId: "qep.notification.template.evidence.created",
      classificationDefaults: {
        severity: "info",
        priority: "normal",
        category: "evidence",
        audience: "user",
      },
      now: "2026-08-02T16:20:00.000Z",
    });

    const result = await platform.engine.processFact({
      eventType: "qep.evidence.created",
      tenantId: "t",
      correlationId: "c",
      payload: { evidenceId: "ev", title: "X" },
      now: "2026-08-02T16:20:01.000Z",
    });

    expect(result.permanentFailures).toBe(1);
    expect(result.delivered).toBe(0);
    expect(platform.channels.get(CHANNEL_IDS.email)?.implemented).toBe(false);
    expect(platform.channels.get(CHANNEL_IDS.internal)?.implemented).toBe(true);
  });

  it("suppresses by preference and records audit", async () => {
    const platform = createNotificationSubscriptionPlatform();
    platform.seedEvidenceTenantSubscription({
      subscriptionIdPrefix: "sub.mute",
      tenantId: "t",
      subjectId: "t",
      now: "2026-08-02T16:30:00.000Z",
    });
    platform.preferences.upsert({
      preferenceId: "pref-1",
      tenantId: "t",
      subjectKind: "tenant",
      subjectId: "t",
      allowedChannels: [CHANNEL_IDS.internal],
      mutedCategories: ["evidence"],
      enabled: true,
    });

    const result = await platform.engine.processFact({
      eventType: "qep.evidence.created",
      tenantId: "t",
      correlationId: "c-mute",
      payload: { evidenceId: "ev", title: "Muted" },
      now: "2026-08-02T16:30:01.000Z",
    });

    expect(result.suppressed).toBe(1);
    expect(result.delivered).toBe(0);
    expect(platform.inbox.all()).toHaveLength(0);
  });

  it("honours expiry policy", async () => {
    const platform = createNotificationSubscriptionPlatform();
    platform.subscriptionManager.create({
      subscriptionId: "sub.expired",
      name: "Expired",
      eventTypes: ["qep.evidence.created"],
      scope: { kind: "global", subjectId: "g" },
      channels: [CHANNEL_IDS.internal],
      templateId: "qep.notification.template.evidence.created",
      classificationDefaults: {
        severity: "info",
        priority: "normal",
        category: "evidence",
        audience: "global",
        expiry: "2026-08-01T00:00:00.000Z",
      },
      now: "2026-08-02T16:40:00.000Z",
    });

    const result = await platform.engine.processFact({
      eventType: "qep.evidence.created",
      tenantId: "any",
      correlationId: "c-exp",
      payload: { evidenceId: "ev", title: "Late" },
      now: "2026-08-02T16:40:01.000Z",
    });
    expect(result.suppressed).toBe(1);
  });

  it("fans out with Evidence + notification processors via platform processing", async () => {
    const platform = createNotificationSubscriptionPlatform();
    platform.seedEvidenceTenantSubscription({
      subscriptionIdPrefix: "sub.fan",
      tenantId: "tenant-b",
      subjectId: "ops",
      now: "2026-08-02T16:50:00.000Z",
    });

    const business = createInMemoryEvidenceBusinessActionPort();
    const evidenceRegistry = createEvidenceProcessorRegistry({ business });
    const platformRegistry = createProcessorRegistry();
    evidenceRegistry.registerOnto(platformRegistry);
    platform.registerProcessors(platformRegistry);

    expect(
      platformRegistry.resolveAll("qep.evidence.created").length,
    ).toBeGreaterThanOrEqual(2);

    const store = createInMemoryProcessingStore();
    const envelope = buildQepEvidenceEventEnvelope({
      eventId: "qep.evidence.created",
      evidenceId: "ev-fan",
      tenantId: "tenant-b",
      revision: 1,
      timestamp: "2026-08-02T16:50:01.000Z",
      payload: { title: "Fanout Notify", tags: ["s12"] },
    });

    await enqueueProcessingWork(store, {
      workItemId: "pw-notify-1",
      tenantId: envelope.tenantId,
      eventType: envelope.eventId,
      payload: { envelope },
      idempotencyKey: envelope.idempotencyKey,
      createdAt: "2026-08-02T16:50:01.000Z",
    });

    const result = await createProcessingWorker({
      store,
      registry: platformRegistry,
      workerId: "notify-worker",
      now: () => "2026-08-02T16:50:02.000Z",
      leasePolicy: { leaseTtlMs: 60_000, processingTimeoutMs: 30_000 },
    }).runOnce();

    expect(result.acknowledged).toBe(1);
    expect(business.applied).toHaveLength(1);
    expect(
      platform.inbox.list({
        tenantId: "tenant-b",
        recipientSubjectId: "ops",
      }),
    ).toHaveLength(1);
  });

  it("integrates delivery intents with S08 outbox", async () => {
    const outbox = createInMemoryOutboxStore();
    const enqueued = await enqueueNotificationDeliveryIntent({
      store: outbox,
      intent: {
        notificationId: "n-1",
        deliveryId: "d-1",
        tenantId: "t",
        channelId: CHANNEL_IDS.internal,
        correlationId: "corr-outbox",
        payload: { evidenceId: "ev" },
      },
      now: "2026-08-02T17:00:00.000Z",
    });
    expect(enqueued.ok).toBe(true);

    const delivered: string[] = [];
    const transport = createNullTransportAdapter({ name: "notify-test" });
    const worker = createOutboxWorker({
      store: outbox,
      handlers: [
        createTransportDeliveryHandler({
          name: transport.name,
          async deliver(event) {
            delivered.push(event.eventType);
            return transport.deliver(event);
          },
        }),
      ],
      now: () => "2026-08-02T17:00:01.000Z",
    });
    const batch = await worker.processBatch();
    expect(batch.published).toBe(1);
    expect(delivered).toContain(NOTIFICATION_DELIVERY_OUTBOX_EVENT);
  });

  it("exposes metrics and diagnostics", async () => {
    const platform = createNotificationSubscriptionPlatform();
    platform.seedEvidenceTenantSubscription({
      subscriptionIdPrefix: "sub.diag",
      tenantId: "t",
      subjectId: "ops",
      now: "2026-08-02T17:10:00.000Z",
    });
    await platform.engine.processFact({
      eventType: "qep.evidence.created",
      tenantId: "t",
      correlationId: "c",
      payload: { evidenceId: "ev", title: "M" },
      now: "2026-08-02T17:10:01.000Z",
    });

    const diag = platform.diagnostics();
    expect(diag.health).toBe("healthy");
    expect(diag.enabledSubscriptionCount).toBe(8);
    expect(diag.implementedChannelCount).toBe(1);
    expect(diag.templateCount).toBe(EVIDENCE_NOTIFICATION_TEMPLATES.length);
    expect(diag.metrics.notificationsSent).toBe(1);
    expect(diag.metrics.deliverySuccessRate).toBe(1);
    expect(diag.metrics.channelUsage[CHANNEL_IDS.internal]).toBe(1);
  });

  it("supports user/role/team/project/tenant/global scopes", () => {
    const registry = createSubscriptionRegistry();
    const manager = createSubscriptionManager(registry);
    const now = "2026-08-02T17:20:00.000Z";
    const scopes = ["user", "role", "team", "project", "tenant", "global"] as const;
    for (const kind of scopes) {
      manager.create({
        subscriptionId: `sub.${kind}`,
        name: kind,
        eventTypes: ["qep.evidence.created"],
        scope: {
          kind,
          subjectId: `${kind}-1`,
          tenantId: "t",
          ...(kind === "project" ? { projectId: "p1" } : {}),
        },
        channels: [CHANNEL_IDS.internal],
        templateId: "qep.notification.template.evidence.created",
        classificationDefaults: {
          severity: "info",
          priority: "normal",
          category: "evidence",
          audience: kind,
        },
        now,
      });
    }
    expect(registry.listEnabled()).toHaveLength(6);
  });
});
