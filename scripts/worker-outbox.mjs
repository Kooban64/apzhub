#!/usr/bin/env node
/**
 * PCv2-02 / OSS-100-12 — Platform outbox worker entry (outside HTTP request handlers).
 *
 * Usage:
 *   pnpm worker:outbox
 *   pnpm worker:outbox --once
 *
 * Requires DATABASE_URL for Postgres mode. Without it, exits with guidance
 * (in-memory mode is for tests only).
 *
 * Default handlers: Event Bus relay (OSS-100-12) + Provisioning steps (OSS-100-12+) + ack.
 */
import "dotenv/config";

async function main() {
  const once = process.argv.includes("--once");
  const enabled =
    process.env.APZHUB_OUTBOX_WORKER_ENABLED !== "0" &&
    process.env.APZHUB_OUTBOX_WORKER_ENABLED !== "false";

  if (!enabled) {
    console.info("[outbox-worker] Disabled via APZHUB_OUTBOX_WORKER_ENABLED");
    process.exit(0);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(
      "[outbox-worker] DATABASE_URL is required for production drain. Use package tests for in-memory.",
    );
    process.exit(1);
  }

  const { createDb } = await import("@apzhub/config");
  const {
    createAcknowledgingHandler,
    createOutboxWorker,
    createPostgresLawOutboxStore,
    isPlatformOutboxWorkerEnabled,
  } = await import("@apzhub/platform-outbox");
  const { createPlatformEventBus } = await import("@apzhub/platform-event-bus");
  const { getSharedGovernanceService } = await import("@apzhub/platform-governance");
  const { createPlatformProvisioning } = await import("@apzhub/platform-provisioning");

  if (!isPlatformOutboxWorkerEnabled(process.env)) {
    console.info("[outbox-worker] Disabled");
    process.exit(0);
  }

  const db = createDb(databaseUrl);
  const store = createPostgresLawOutboxStore(db);
  const eventBus = createPlatformEventBus({
    outboxStore: store,
    allowUnsignedIngress: true,
  });
  const provisioning = createPlatformProvisioning({
    governance: getSharedGovernanceService(),
    outboxStore: store,
    bus: eventBus.bus,
    registry: eventBus.registry,
  });

  const worker = createOutboxWorker({
    store,
    handlers: [
      eventBus.createOutboxHandler("event-bus-relay"),
      provisioning.createOutboxHandler("provisioning-steps"),
      createAcknowledgingHandler("platform-ack"),
    ],
  });

  async function tick() {
    const result = await worker.processBatch();
    const diag = await worker.diagnostics();
    const busHealth = eventBus.health();
    const provHealth = provisioning.health();
    console.info(
      `[outbox-worker] claimed=${result.claimed} published=${result.published} failed=${result.failed} deadLetter=${result.deadLetter} pending=${diag.pending} bus=${busHealth.status} provisioning=${provHealth.status}`,
    );
    return result;
  }

  if (once) {
    await tick();
    process.exit(0);
  }

  const intervalMs = Number(process.env.APZHUB_OUTBOX_POLL_MS ?? "5000");
  console.info(
    `[outbox-worker] Polling every ${intervalMs}ms (Event Bus relay + Provisioning steps enabled)`,
  );
  while (true) {
    await tick();
    await new Promise((r) => setTimeout(r, intervalMs));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
