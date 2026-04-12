#!/usr/bin/env node
/**
 * Long-lived provisioning worker: claims and runs queued jobs until SIGINT/SIGTERM.
 * Requires a database URL (APZHUB_DATABASE_URL, DATABASE_URL, or APZHUB_DATABASE_URL_FILE) and APZHUB_PROVISIONING_SOURCE=real.
 */
import { closeDbPool } from "@/db/client";
import { runProvisioningWorkerTick } from "@/lib/provisioning/worker/runner";

const sleepMs = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  let shuttingDown = false;
  const stop = async () => {
    shuttingDown = true;
    await closeDbPool();
    process.exit(0);
  };
  process.on("SIGINT", () => void stop());
  process.on("SIGTERM", () => void stop());

  while (!shuttingDown) {
    try {
      const ran = await runProvisioningWorkerTick();
      await sleepMs(ran ? 200 : 2000);
    } catch (e) {
      console.error("[provisioning-worker] tick failed", e);
      await sleepMs(5000);
    }
  }
}

void main();
