import { createQepScm, createScmPersistence, type QepScmFacade } from "@apzhub/qep-scm";
import type { ScmProviderId } from "@apzhub/platform-scm";

import { triggerAutomationForPersistedChanges } from "@/lib/qep/automation-on-change";
import { resolveScmPersistence } from "@/lib/qep/persistence/resolve-scm-persistence";
import { triggerSecurityDispatchForPersistedChanges } from "@/lib/qep/security-dispatch-on-change";
import { triggerVerificationDispatchForPersistedChanges } from "@/lib/qep/verification-dispatch-on-change";

/** Matches platform-authorization DEFAULT_PLATFORM_TENANT_ID. */
const DEFAULT_PLATFORM_TENANT_ID = "t0000001-0000-4000-8000-000000000001";

let singleton: QepScmFacade | undefined;

/** Resolve GitHub PAT from server env / `.secrets/git` (never from the client). */
export function resolveGithubPatFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const token =
    env.APZHUB_SCM_GITHUB_TOKEN?.trim() ||
    env.GITHUB_TOKEN?.trim() ||
    env.GH_TOKEN?.trim();
  return token && token.length > 0 ? token : undefined;
}

/**
 * Process-local SCM Foundation runtime (APZQEP-162 / Flagship F1).
 * Production defaults to PostgreSQL RepositoryStore (fail-closed).
 * Credentials are seeded from `.secrets/git` → env only.
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
        // F1 persists change events in-engine; F2 projects on demand via scm-impact.
        void event.type;
      },
      onChangeEventsPersisted: async (payload) => {
        // Flagship F9 — in-process Playwright smoke (opt-in).
        await triggerAutomationForPersistedChanges(payload);
        const resolveRepositoryFullName = async (repositoryId: string) => {
          const repo = await singleton?.getRepository(repositoryId);
          return repo?.fullName;
        };
        // Flagship F10 — quality pack dispatch (opt-in).
        await triggerVerificationDispatchForPersistedChanges({
          ...payload,
          resolveRepositoryFullName,
        });
        // Flagship F11 — security / pen-test pack dispatch (opt-in).
        await triggerSecurityDispatchForPersistedChanges({
          ...payload,
          resolveRepositoryFullName,
        });
      },
    });

    const pat = resolveGithubPatFromEnv();
    if (pat) {
      singleton.setDefaultCredentials(DEFAULT_PLATFORM_TENANT_ID, "github", {
        kind: "pat",
        token: pat,
      });
    }
  }
  return singleton;
}

export function defaultScmTenantId(): string {
  return process.env.APZHUB_SCM_DEFAULT_TENANT_ID?.trim() || DEFAULT_PLATFORM_TENANT_ID;
}

/** Test helper — reset singleton between suites. */
export function resetQepScmRuntimeForTests(): void {
  singleton = undefined;
}
