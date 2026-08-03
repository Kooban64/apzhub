import { createQepScm, type QepScmFacade } from "@apzhub/qep-scm";
import type { ScmProviderId } from "@apzhub/platform-scm";

let singleton: QepScmFacade | undefined;

/**
 * Process-local SCM Foundation runtime (APZQEP-162).
 * Integrates with Automation/Evidence/QKI/Notifications via event hooks (no duplication).
 */
export function getQepScmRuntime(): QepScmFacade {
  if (!singleton) {
    const events: string[] = [];
    const webhookSecrets: Partial<Record<ScmProviderId, string>> = {
      github: process.env.APZHUB_SCM_GITHUB_WEBHOOK_SECRET ?? "dev-scm-webhook-secret",
    };
    singleton = createQepScm({
      githubOffline: process.env.APZHUB_SCM_GITHUB_LIVE !== "true",
      webhookSecrets,
      onEvent: (event) => {
        events.push(event.type);
        if (events.length > 500) {
          events.splice(0, events.length - 500);
        }
      },
      onScmEvent: async (event) => {
        // Automation / Evidence / QKI / Reporting consumers attach via platform event bus later.
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
