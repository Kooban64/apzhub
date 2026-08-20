/**
 * Flagship F10 — Option B verification dispatch.
 * On durable SCM change, ask external runners (GitHub Actions / webhook) to
 * execute domain tools; they POST reports to automation ingest.
 * Never auto-certifies. Greenbone/Faraday/Kali = same pattern later (not F10).
 */

import { randomUUID } from "node:crypto";

import type { ScmChangeEvent } from "@apzhub/platform-scm";

import { selectChangesForAutoVerification } from "@/lib/qep/automation-on-change";
import {
  appendVerificationDispatch,
  hasDispatchForChange,
  type VerificationDispatchRecord,
} from "@/lib/qep/verification-dispatch-store";

import type { EnvVars } from "@/lib/env-vars";
export const F10_ASSIST_ORIGIN = "f10_verification_dispatch" as const;

export const DEFAULT_DISPATCH_DOMAINS = [
  "vitest",
  "accessibility",
  "security",
  "codequality",
  "k6",
] as const;

export function isVerificationDispatchEnabled(env: EnvVars = process.env): boolean {
  const raw = (env.APZHUB_VERIFICATION_DISPATCH ?? "").toLowerCase();
  return raw === "true" || raw === "1" || raw === "yes";
}

export function resolveDispatchDomains(env: EnvVars = process.env): readonly string[] {
  const raw = env.APZHUB_VERIFICATION_DISPATCH_DOMAINS?.trim();
  if (!raw) return [...DEFAULT_DISPATCH_DOMAINS];
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export type DispatchConfig = {
  readonly owner?: string;
  readonly repo?: string;
  readonly workflow?: string;
  readonly ref?: string;
  readonly webhookUrl?: string;
  readonly domains: readonly string[];
  /** When true, record intent without calling GitHub/webhook (local proof). */
  readonly recordOnly: boolean;
};

export function resolveDispatchConfig(env: EnvVars = process.env): DispatchConfig {
  const mode = (env.APZHUB_VERIFICATION_DISPATCH_MODE ?? "").toLowerCase();
  return {
    owner: env.APZHUB_VERIFICATION_DISPATCH_OWNER?.trim() || undefined,
    repo: env.APZHUB_VERIFICATION_DISPATCH_REPO?.trim() || undefined,
    workflow: env.APZHUB_VERIFICATION_DISPATCH_WORKFLOW?.trim() || undefined,
    ref: env.APZHUB_VERIFICATION_DISPATCH_REF?.trim() || "main",
    webhookUrl: env.APZHUB_VERIFICATION_DISPATCH_WEBHOOK_URL?.trim() || undefined,
    domains: resolveDispatchDomains(env),
    recordOnly: mode === "record_only" || mode === "dry",
  };
}

export function buildDispatchPayload(input: {
  readonly change: ScmChangeEvent;
  readonly domains: readonly string[];
  readonly repositoryFullName?: string;
}): Record<string, string> {
  return {
    changeEventId: input.change.changeEventId,
    domains: input.domains.join(","),
    sha: input.change.sha ?? "",
    branch: input.change.branch ?? "",
    correlationId: input.change.correlationId,
    repositoryFullName: input.repositoryFullName ?? "",
    assistOrigin: F10_ASSIST_ORIGIN,
  };
}

export async function dispatchGithubActions(input: {
  readonly token: string;
  readonly owner: string;
  readonly repo: string;
  readonly workflow: string;
  readonly ref: string;
  readonly inputs: Record<string, string>;
}): Promise<{ ok: boolean; detail: string; externalRef?: string }> {
  const url = `https://api.github.com/repos/${input.owner}/${input.repo}/actions/workflows/${encodeURIComponent(input.workflow)}/dispatches`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${input.token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({ ref: input.ref, inputs: input.inputs }),
  });
  if (response.status === 204) {
    return {
      ok: true,
      detail: "github_actions_dispatched",
      externalRef: `gha://${input.owner}/${input.repo}/workflows/${input.workflow}`,
    };
  }
  const body = await response.text().catch(() => "");
  return {
    ok: false,
    detail: `github_actions_${response.status}:${body.slice(0, 200)}`,
  };
}

export async function dispatchWebhook(input: {
  readonly url: string;
  readonly payload: Record<string, string>;
}): Promise<{ ok: boolean; detail: string; externalRef?: string }> {
  const response = await fetch(input.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "apzqep.verification.dispatch",
      ...input.payload,
    }),
  });
  if (response.ok) {
    return {
      ok: true,
      detail: `webhook_${response.status}`,
      externalRef: input.url,
    };
  }
  const body = await response.text().catch(() => "");
  return {
    ok: false,
    detail: `webhook_${response.status}:${body.slice(0, 200)}`,
  };
}

export function resolveGithubToken(env: EnvVars): string | undefined {
  const token =
    env.APZHUB_SCM_GITHUB_TOKEN?.trim() ||
    env.GITHUB_TOKEN?.trim() ||
    env.GH_TOKEN?.trim();
  return token && token.length > 0 ? token : undefined;
}

export async function triggerVerificationDispatchForPersistedChanges(input: {
  readonly tenantId: string;
  readonly correlationId: string;
  readonly source: "webhook" | "sync" | "manual";
  readonly events: readonly ScmChangeEvent[];
  readonly env?: EnvVars;
  /** Self-serve re-run — skip already_dispatched short-circuit. */
  readonly force?: boolean;
  readonly resolveRepositoryFullName?: (
    repositoryId: string,
  ) => Promise<string | undefined>;
}): Promise<readonly VerificationDispatchRecord[]> {
  const env = input.env ?? process.env;
  if (!isVerificationDispatchEnabled(env)) {
    return [];
  }

  const config = resolveDispatchConfig(env);
  const selected = selectChangesForAutoVerification(input.events);
  const created: VerificationDispatchRecord[] = [];

  for (const change of selected) {
    if (!input.force && hasDispatchForChange(change.changeEventId, F10_ASSIST_ORIGIN)) {
      created.push(
        appendVerificationDispatch({
          dispatchId: `vdsp-${randomUUID()}`,
          tenantId: input.tenantId,
          changeEventId: change.changeEventId,
          repositoryId: change.repositoryId,
          domains: config.domains,
          channel: "none",
          status: "skipped",
          correlationId: change.correlationId || input.correlationId,
          createdAt: new Date().toISOString(),
          detail: "already_dispatched",
          assistOrigin: F10_ASSIST_ORIGIN,
          pack: "quality",
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
    const inputs = buildDispatchPayload({
      change,
      domains: config.domains,
      repositoryFullName,
    });

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

    const record = appendVerificationDispatch({
      dispatchId: `vdsp-${randomUUID()}`,
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
      assistOrigin: F10_ASSIST_ORIGIN,
      pack: "quality",
    });
    created.push(record);
  }

  console.info(
    JSON.stringify({
      channel: "qep-f10-dispatch",
      event: "qep.verification.dispatch.batch",
      source: input.source,
      correlationId: input.correlationId,
      count: created.length,
      statuses: created.map((row) => row.status),
    }),
  );
  return created;
}
