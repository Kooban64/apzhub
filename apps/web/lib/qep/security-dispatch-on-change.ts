/**
 * Flagship F11 — Security / pen-test verification dispatch (Option B).
 * Same pattern as F10: dispatch → runner/scanner → report ingest → certify.
 * Pack order: CI security (Trivy/Semgrep) → Nuclei/ZAP DAST → Greenbone VA.
 * Faraday later; Kali = runner image only (not a QEP module).
 * Never auto-certifies.
 */

import { randomUUID } from "node:crypto";

import type { ScmChangeEvent } from "@apzhub/platform-scm";

import { selectChangesForAutoVerification } from "@/lib/qep/automation-on-change";
import {
  buildDispatchPayload,
  dispatchGithubActions,
  dispatchWebhook,
  resolveGithubToken,
} from "@/lib/qep/verification-dispatch-on-change";
import {
  appendVerificationDispatch,
  hasDispatchForChange,
  type VerificationDispatchRecord,
} from "@/lib/qep/verification-dispatch-store";

export const F11_ASSIST_ORIGIN = "f11_security_dispatch" as const;

/** Default security pack — maps to security-domain ingest (SARIF/findings). */
export const DEFAULT_SECURITY_DISPATCH_DOMAINS = [
  "trivy",
  "semgrep",
  "nuclei",
  "zap",
] as const;

/** Optional breadth — enable via APZHUB_SECURITY_DISPATCH_DOMAINS. */
export const OPTIONAL_SECURITY_DISPATCH_DOMAINS = ["greenbone"] as const;

export function isSecurityDispatchEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const raw = (env.APZHUB_SECURITY_DISPATCH ?? "").toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes";
}

export function resolveSecurityDispatchDomains(
  env: NodeJS.ProcessEnv = process.env,
): readonly string[] {
  const raw = env.APZHUB_SECURITY_DISPATCH_DOMAINS?.trim();
  if (!raw) return [...DEFAULT_SECURITY_DISPATCH_DOMAINS];
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export type SecurityDispatchConfig = {
  readonly owner?: string;
  readonly repo?: string;
  readonly workflow?: string;
  readonly ref?: string;
  readonly webhookUrl?: string;
  readonly domains: readonly string[];
  readonly recordOnly: boolean;
};

export function resolveSecurityDispatchConfig(
  env: NodeJS.ProcessEnv = process.env,
): SecurityDispatchConfig {
  const mode = (env.APZHUB_SECURITY_DISPATCH_MODE ?? "").toLowerCase();
  return {
    owner: env.APZHUB_SECURITY_DISPATCH_OWNER?.trim() || undefined,
    repo: env.APZHUB_SECURITY_DISPATCH_REPO?.trim() || undefined,
    workflow: env.APZHUB_SECURITY_DISPATCH_WORKFLOW?.trim() || undefined,
    ref: env.APZHUB_SECURITY_DISPATCH_REF?.trim() || "main",
    webhookUrl: env.APZHUB_SECURITY_DISPATCH_WEBHOOK_URL?.trim() || undefined,
    domains: resolveSecurityDispatchDomains(env),
    recordOnly: mode === "record_only" || mode === "dry",
  };
}

export async function triggerSecurityDispatchForPersistedChanges(input: {
  readonly tenantId: string;
  readonly correlationId: string;
  readonly source: "webhook" | "sync" | "manual";
  readonly events: readonly ScmChangeEvent[];
  readonly env?: NodeJS.ProcessEnv;
  /** Self-serve re-run — skip already_dispatched short-circuit. */
  readonly force?: boolean;
  readonly resolveRepositoryFullName?: (
    repositoryId: string,
  ) => Promise<string | undefined>;
}): Promise<readonly VerificationDispatchRecord[]> {
  const env = input.env ?? process.env;
  if (!isSecurityDispatchEnabled(env)) {
    return [];
  }

  const config = resolveSecurityDispatchConfig(env);
  const selected = selectChangesForAutoVerification(input.events);
  const created: VerificationDispatchRecord[] = [];

  for (const change of selected) {
    if (!input.force && hasDispatchForChange(change.changeEventId, F11_ASSIST_ORIGIN)) {
      created.push(
        appendVerificationDispatch({
          dispatchId: `sdsp-${randomUUID()}`,
          tenantId: input.tenantId,
          changeEventId: change.changeEventId,
          repositoryId: change.repositoryId,
          domains: config.domains,
          channel: "none",
          status: "skipped",
          correlationId: change.correlationId || input.correlationId,
          createdAt: new Date().toISOString(),
          detail: "already_dispatched",
          assistOrigin: F11_ASSIST_ORIGIN,
          pack: "security",
        }),
      );
      continue;
    }

    let repositoryFullName: string | undefined;
    if (change.repositoryId && input.resolveRepositoryFullName) {
      try {
        repositoryFullName = await input.resolveRepositoryFullName(change.repositoryId);
      } catch {
        // soft
      }
    }

    const owner = config.owner || repositoryFullName?.split("/")[0] || undefined;
    const repo = config.repo || repositoryFullName?.split("/")[1] || undefined;
    const inputs = {
      ...buildDispatchPayload({
        change,
        domains: config.domains,
        repositoryFullName,
      }),
      pack: "security",
      assistOrigin: F11_ASSIST_ORIGIN,
    };

    let channel: VerificationDispatchRecord["channel"] = "none";
    let status: VerificationDispatchRecord["status"] = "failed";
    let detail = "missing_dispatch_target";
    let externalRef: string | undefined;

    if (config.recordOnly) {
      channel = config.workflow && owner && repo ? "github_actions" : "none";
      status = "dispatched";
      detail = "record_only";
      externalRef =
        channel === "github_actions"
          ? `gha://${owner}/${repo}/workflows/${config.workflow}`
          : undefined;
    } else if (config.workflow && owner && repo) {
      channel = "github_actions";
      const token = resolveGithubToken(env);
      if (!token) {
        detail = "missing_github_token";
      } else {
        try {
          const result = await dispatchGithubActions({
            token,
            owner,
            repo,
            workflow: config.workflow,
            ref: config.ref ?? "main",
            inputs,
          });
          status = result.ok ? "dispatched" : "failed";
          detail = result.detail;
          externalRef = result.externalRef;
        } catch (error) {
          detail = error instanceof Error ? error.message : "github_dispatch_failed";
        }
      }
    } else if (config.webhookUrl) {
      channel = "webhook";
      try {
        const result = await dispatchWebhook({
          url: config.webhookUrl,
          payload: inputs,
        });
        status = result.ok ? "dispatched" : "failed";
        detail = result.detail;
        externalRef = result.externalRef;
      } catch (error) {
        detail = error instanceof Error ? error.message : "webhook_dispatch_failed";
      }
    }

    created.push(
      appendVerificationDispatch({
        dispatchId: `sdsp-${randomUUID()}`,
        tenantId: input.tenantId,
        changeEventId: change.changeEventId,
        repositoryId: change.repositoryId,
        repositoryFullName,
        domains: config.domains,
        channel,
        status,
        correlationId: change.correlationId || input.correlationId,
        createdAt: new Date().toISOString(),
        externalRef,
        detail,
        assistOrigin: F11_ASSIST_ORIGIN,
        pack: "security",
      }),
    );
  }

  console.info(
    JSON.stringify({
      channel: "qep-f11-security-dispatch",
      event: "qep.security.dispatch.batch",
      source: input.source,
      correlationId: input.correlationId,
      count: created.length,
      statuses: created.map((row) => row.status),
      domains: config.domains,
    }),
  );
  return created;
}
