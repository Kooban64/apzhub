import {
  createPlatformOrchestration,
  type PlatformOrchestration,
} from "@apzhub/platform-orchestration";

import { resolveOrchestrationPersistence } from "@/lib/qep/persistence/resolve-orchestration-persistence";

let singleton: PlatformOrchestration | undefined;
let boot: Promise<PlatformOrchestration> | undefined;

/**
 * Orchestration Platform runtime (APZQEP-165 / QX-PR-05).
 * Production defaults to PostgreSQL document SoR (fail-closed).
 */
export async function getQepOrchestrationRuntime(): Promise<PlatformOrchestration> {
  if (singleton) return singleton;
  if (!boot) {
    boot = (async () => {
      const persistence = resolveOrchestrationPersistence();
      singleton = await createPlatformOrchestration({
        documentStore: persistence.store,
      });
      return singleton;
    })();
  }
  return boot;
}

/** Test helper — reset singleton between suites. */
export function resetQepOrchestrationRuntimeForTests(): void {
  singleton = undefined;
  boot = undefined;
}
