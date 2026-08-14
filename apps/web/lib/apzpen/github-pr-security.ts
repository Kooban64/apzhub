/**
 * APZPEN GitHub PR security position — governed evidence over source PRs.
 * PAT + HMAC webhook ready; GitHub App JWT install is a follow-on.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

import type { Engagement, Finding, FindingSeverity } from "./types";

export type PrCheckStatus = "pending" | "success" | "failure" | "neutral";

export type PrSecurityCheck = {
  readonly id: string;
  readonly label: string;
  readonly status: PrCheckStatus;
  readonly required: boolean;
};

export type PrSecurityEvent = {
  readonly eventId: string;
  readonly tenantId: string;
  readonly engagementId: string;
  readonly provider: "github";
  readonly repository: string;
  readonly prNumber: number;
  readonly title: string;
  readonly author: string;
  readonly branch: string;
  readonly baseBranch: string;
  readonly url: string;
  readonly changedPaths: readonly string[];
  readonly checks: readonly PrSecurityCheck[];
  readonly receivedAt: string;
};

export type PrSecurityPosition = "clear" | "review_required" | "blocked" | "unknown";

export type PrSecurityAssessment = {
  readonly eventId: string;
  readonly engagementId: string;
  readonly repository: string;
  readonly prNumber: number;
  readonly title: string;
  readonly url: string;
  readonly position: PrSecurityPosition;
  readonly sensitivePaths: readonly string[];
  readonly requiredChecksFailed: readonly string[];
  readonly openFindingOverlap: readonly {
    readonly findingId: string;
    readonly title: string;
    readonly severity: FindingSeverity;
  }[];
  readonly summary: string;
  readonly assessedAt: string;
};

const SENSITIVE_PATH_HINTS = [
  "/auth",
  "auth/",
  "password",
  "secret",
  ".env",
  "iam",
  "permission",
  "crypto",
  "payment",
  "billing",
  "dockerfile",
  "k8s/",
  "terraform",
  "helm/",
] as const;

export function detectSensitivePaths(paths: readonly string[]): readonly string[] {
  return paths.filter((p) => {
    const lower = p.toLowerCase();
    return SENSITIVE_PATH_HINTS.some((hint) => lower.includes(hint));
  });
}

export function computePrSecurityPosition(input: {
  readonly event: PrSecurityEvent;
  readonly findings: readonly Finding[];
}): PrSecurityAssessment {
  const sensitivePaths = detectSensitivePaths(input.event.changedPaths);
  const requiredChecksFailed = input.event.checks
    .filter((c) => c.required && c.status === "failure")
    .map((c) => c.label);

  const pathHints = sensitivePaths.map((p) => p.toLowerCase());
  const openFindingOverlap = input.findings
    .filter(
      (f) =>
        f.engagementId === input.event.engagementId &&
        f.status !== "closed" &&
        f.status !== "false_positive" &&
        f.status !== "risk_accepted" &&
        f.status !== "retest_passed",
    )
    .filter((f) => {
      const loc = (f.location ?? "").toLowerCase();
      if (!loc) return f.severity === "critical" || f.severity === "high";
      return pathHints.some((p) => loc.includes(p.split("/").pop() ?? p));
    })
    .slice(0, 12)
    .map((f) => ({
      findingId: f.findingId,
      title: f.title,
      severity: f.severity,
    }));

  let position: PrSecurityPosition = "clear";
  if (requiredChecksFailed.length > 0) position = "blocked";
  else if (
    sensitivePaths.length > 0 ||
    openFindingOverlap.some((f) => f.severity === "critical" || f.severity === "high")
  ) {
    position = "review_required";
  } else if (input.event.checks.some((c) => c.status === "pending")) {
    position = "unknown";
  }

  const summary = [
    `PR #${input.event.prNumber} on ${input.event.repository}: ${position.replaceAll("_", " ")}.`,
    sensitivePaths.length
      ? `${sensitivePaths.length} sensitive path(s).`
      : "No sensitive path hints.",
    requiredChecksFailed.length
      ? `Failed required checks: ${requiredChecksFailed.join(", ")}.`
      : "Required checks OK or not failing.",
    openFindingOverlap.length
      ? `${openFindingOverlap.length} open finding(s) may overlap.`
      : "No overlapping open findings flagged.",
  ].join(" ");

  return {
    eventId: input.event.eventId,
    engagementId: input.event.engagementId,
    repository: input.event.repository,
    prNumber: input.event.prNumber,
    title: input.event.title,
    url: input.event.url,
    position,
    sensitivePaths,
    requiredChecksFailed,
    openFindingOverlap,
    summary,
    assessedAt: new Date().toISOString(),
  };
}

export function verifyGithubWebhookSignature(input: {
  readonly secret: string;
  readonly rawBody: string;
  readonly signatureHeader: string | null;
}): boolean {
  if (!input.signatureHeader?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", input.secret)
    .update(input.rawBody, "utf8")
    .digest("hex");
  const provided = input.signatureHeader.slice("sha256=".length);
  try {
    const a = Buffer.from(expected, "utf8");
    const b = Buffer.from(provided, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Map a GitHub pull_request webhook payload into a PrSecurityEvent seed. */
export function normalizeGithubPullRequestPayload(input: {
  readonly tenantId: string;
  readonly engagementId: string;
  readonly payload: Record<string, unknown>;
  readonly eventId: string;
}): PrSecurityEvent | null {
  const pr = input.payload.pull_request as Record<string, unknown> | undefined;
  const repo = input.payload.repository as Record<string, unknown> | undefined;
  if (!pr || !repo) return null;
  const head = pr.head as Record<string, unknown> | undefined;
  const base = pr.base as Record<string, unknown> | undefined;
  const user = pr.user as Record<string, unknown> | undefined;
  const files = Array.isArray(input.payload.changed_files_paths)
    ? (input.payload.changed_files_paths as string[])
    : [];

  return {
    eventId: input.eventId,
    tenantId: input.tenantId,
    engagementId: input.engagementId,
    provider: "github",
    repository: String(repo.full_name ?? repo.name ?? "unknown/repo"),
    prNumber: Number(pr.number ?? 0),
    title: String(pr.title ?? "Untitled PR"),
    author: String(user?.login ?? "unknown"),
    branch: String(head?.ref ?? ""),
    baseBranch: String(base?.ref ?? "main"),
    url: String(pr.html_url ?? ""),
    changedPaths: files,
    checks: [
      {
        id: "apzpen-security-review",
        label: "APZPEN security review",
        status: "pending",
        required: true,
      },
      {
        id: "semgrep",
        label: "Semgrep SAST",
        status: "pending",
        required: true,
      },
    ],
    receivedAt: new Date().toISOString(),
  };
}

export function seedDemoPrEvent(
  engagement: Engagement,
  eventId: string,
): PrSecurityEvent {
  const repo =
    engagement.scope.find((s) => s.kind === "repository")?.identifier ??
    "acme/banking-portal";
  return {
    eventId,
    tenantId: engagement.tenantId,
    engagementId: engagement.engagementId,
    provider: "github",
    repository: repo.replace(/^\/shared\/repos\/?/, "") || "acme/banking-portal",
    prNumber: 42,
    title: "Harden transfer authorisation",
    author: "dev.alice",
    branch: "fix/bola-transfers",
    baseBranch: "main",
    url: "https://github.com/acme/banking-portal/pull/42",
    changedPaths: [
      "apps/api/src/auth/transfers.ts",
      "apps/api/src/payments/router.ts",
      ".env.example",
    ],
    checks: [
      {
        id: "apzpen-security-review",
        label: "APZPEN security review",
        status: "pending",
        required: true,
      },
      {
        id: "semgrep",
        label: "Semgrep SAST",
        status: "success",
        required: true,
      },
      {
        id: "trivy",
        label: "Trivy container",
        status: "success",
        required: false,
      },
    ],
    receivedAt: new Date().toISOString(),
  };
}
