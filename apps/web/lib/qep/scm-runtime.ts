import { createQepScm, createScmPersistence, type QepScmFacade } from "@apzhub/qep-scm";
import type { ScmProviderId } from "@apzhub/platform-scm";

import { resolveScmPersistence } from "@/lib/qep/persistence/resolve-scm-persistence";

let singleton: QepScmFacade | undefined;

/**
 * Process-local SCM Foundation runtime (APZQEP-162 / QX-PR-02).
 * Production defaults to PostgreSQL RepositoryStore (fail-closed).
 */
export function getQepScmRuntime(): QepScmFacade {
  if (!singleton) {
    const persistence = resolveScmPersistence();
    const store = createScmPersistence({
      mode: persistence.mode,
      db: persistence.db,
      allowInMemoryPersistence: persistence.mode === "memory",
    });
    const events: string[] = [];
    const webhookSecrets: Partial<Record<ScmProviderId, string>> = {
      github: process.env.APZHUB_SCM_GITHUB_WEBHOOK_SECRET ?? "dev-scm-webhook-secret",
    };
    singleton = createQepScm({
      githubOffline: process.env.APZHUB_SCM_GITHUB_LIVE !== "true",
      webhookSecrets,
      store,
      onEvent: (event) => {
        events.push(event.type);
        if (events.length > 500) {
          events.splice(0, events.length - 500);
        }
      },
      onScmEvent: async (event) => {
        void event.type;
      },
    });
  }
  return singleton;
}

/** Test helper — reset singleton between suites. */
export function resetQepScmRuntimeForTests(): void {
  singleton = undefined;
}
