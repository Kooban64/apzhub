/**
 * R12-OPS-02 — Alert strategy / Observe runbook depth.
 * Metadata + ops governance only — no alert evaluation or delivery.
 */

export type AlertPriority = "P1" | "P2" | "P3" | "INFO";

export type AlertDeliveryPosture = "manual-triage" | "unsupported-delivery";

export type AlertServiceTier = "A" | "B" | "platform-observe";

export interface AlertPolicy {
  readonly id: string;
  readonly title: string;
  readonly priority: AlertPriority;
  readonly tier: AlertServiceTier;
  readonly opsKey: string;
  readonly ownerRole: string;
  readonly escalation: string;
  readonly runbookPath: string;
  readonly symptoms: readonly string[];
  readonly correlationRequired: boolean;
  readonly deliveryPosture: AlertDeliveryPosture;
  readonly observeMetadataOnly: boolean;
  readonly notes: readonly string[];
}

export type AlertStrategyAuditVerdict = "PASS" | "FAIL";

export interface AlertStrategyAuditFinding {
  readonly id: string;
  readonly severity: "pass" | "fail";
  readonly message: string;
}

export interface AlertStrategyAuditEvidence {
  readonly schemaVersion: "1.0.0";
  readonly programmeId: "APZHUB-1.2-003";
  readonly backlogItemId: "R12-OPS-02";
  readonly riskId: "OPS-R-05";
  readonly executedAt: string;
  readonly environment: string;
  readonly policyCount: number;
  readonly runbookPaths: readonly string[];
  readonly findings: readonly AlertStrategyAuditFinding[];
  readonly verdict: AlertStrategyAuditVerdict;
  readonly notes: readonly string[];
  readonly artefactPaths: readonly string[];
}

export const ALERT_STRATEGY_REQUIRED_ARTEFACTS = [
  "docs/operations/MONITORING-AND-ALERTING.md",
  "docs/operations/RUNBOOK-STANDARDS.md",
  "docs/operations/runbooks/README.md",
  "docs/operations/evidence/alert-strategy/README.md",
] as const;

/** Minimum Production alert policies for R12-OPS-02 (Observe metadata posture). */
export const PLATFORM_ALERT_POLICIES: readonly AlertPolicy[] = [
  {
    id: "alert.identity.unavailable",
    title: "Identity unavailable",
    priority: "P1",
    tier: "A",
    opsKey: "identity",
    ownerRole: "Identity Service Owner",
    escalation: "Platform Ops Lead → Owner (security if credential-related)",
    runbookPath: "docs/operations/runbooks/identity-unavailable.md",
    symptoms: ["Sign-in failures", "Session create errors", "Identity health red"],
    correlationRequired: true,
    deliveryPosture: "manual-triage",
    observeMetadataOnly: true,
    notes: ["No automated paging provider in APZHUB Observe plane."],
  },
  {
    id: "alert.gateway.5xx",
    title: "API Gateway elevated 5xx",
    priority: "P1",
    tier: "A",
    opsKey: "gateway",
    ownerRole: "Platform Engineering Lead",
    escalation: "On-call → Platform Ops Lead",
    runbookPath: "docs/operations/runbooks/gateway-5xx.md",
    symptoms: ["Gateway 5xx spike", "Health/readiness degraded", "Client API failures"],
    correlationRequired: true,
    deliveryPosture: "manual-triage",
    observeMetadataOnly: true,
    notes: ["Correlate via correlationId; do not expose engine errors to users."],
  },
  {
    id: "alert.platform-db.restore",
    title: "Platform PostgreSQL restore / data integrity",
    priority: "P1",
    tier: "A",
    opsKey: "platform-postgresql",
    ownerRole: "Platform Ops Owner",
    escalation: "Platform Ops Lead → Owner",
    runbookPath: "docs/operations/runbooks/platform-db-restore.md",
    symptoms: ["DB unhealthy", "Migration failure", "Restore required"],
    correlationRequired: false,
    deliveryPosture: "manual-triage",
    observeMetadataOnly: true,
    notes: ["Use R12-OPS-01 drill/runbook for restore practice."],
  },
  {
    id: "alert.redis.session-storm",
    title: "Redis session storm / session store pressure",
    priority: "P1",
    tier: "A",
    opsKey: "redis",
    ownerRole: "Platform Ops Owner",
    escalation: "On-call → Identity Service Owner",
    runbookPath: "docs/operations/runbooks/redis-session-storm.md",
    symptoms: ["Session create/fail spikes", "Redis unhealthy", "Login loops"],
    correlationRequired: true,
    deliveryPosture: "manual-triage",
    observeMetadataOnly: true,
    notes: ["Redis is ephemeral for sessions; rebuild from AuthN if needed."],
  },
  {
    id: "alert.support.adapter-unhealthy",
    title: "Support adapter unhealthy",
    priority: "P2",
    tier: "B",
    opsKey: "support",
    ownerRole: "Support Product Owner",
    escalation: "Service Owner → Platform Ops Lead",
    runbookPath: "docs/operations/runbooks/support-adapter-unhealthy.md",
    symptoms: ["Support API errors", "Adapter health red", "Tickets not loading"],
    correlationRequired: true,
    deliveryPosture: "manual-triage",
    observeMetadataOnly: true,
    notes: ["Mask engine brand in user communications."],
  },
  {
    id: "alert.law.authz-denials-spike",
    title: "Law AuthZ denials spike",
    priority: "P2",
    tier: "B",
    opsKey: "law",
    ownerRole: "Law Product Owner",
    escalation: "Law PO → Security Owner if suspected misconfig",
    runbookPath: "docs/operations/runbooks/law-authz-denials-spike.md",
    symptoms: ["Sudden 403 volume on Law APIs", "Workbench permission errors"],
    correlationRequired: true,
    deliveryPosture: "manual-triage",
    observeMetadataOnly: true,
    notes: ["OBS-LAW-01 closed; investigate grants vs allow-all regressions."],
  },
  {
    id: "alert.event-bus.publish-failures",
    title: "Event Bus publish failures",
    priority: "P2",
    tier: "B",
    opsKey: "event-bus",
    ownerRole: "Platform Engineering Lead",
    escalation: "Platform Ops Lead",
    runbookPath: "docs/operations/runbooks/event-bus-publish-failures.md",
    symptoms: ["Publish errors", "Outbox backlog growth", "Attention not updating"],
    correlationRequired: true,
    deliveryPosture: "manual-triage",
    observeMetadataOnly: true,
    notes: ["Event Bus remains MVP; not Workflow execute."],
  },
  {
    id: "alert.automation.deferred-flood",
    title: "Automation deferred / fail-soft flood",
    priority: "INFO",
    tier: "B",
    opsKey: "automation",
    ownerRole: "Portfolio Automation Owner",
    escalation: "Informational → Service Owner if customer impact",
    runbookPath: "docs/operations/runbooks/automation-deferred-flood.md",
    symptoms: ["High deferred intent counts", "Fail-soft automation noise"],
    correlationRequired: true,
    deliveryPosture: "manual-triage",
    observeMetadataOnly: true,
    notes: ["Do not treat as Workflow execute failures."],
  },
  {
    id: "alert.observe.unavailable",
    title: "Observe metadata plane unavailable",
    priority: "P2",
    tier: "platform-observe",
    opsKey: "observe",
    ownerRole: "Observability Owner",
    escalation: "Observability Owner → Platform Ops Lead",
    runbookPath: "docs/operations/runbooks/observe-unavailable.md",
    symptoms: [
      "Observe HTTP/Workbench errors",
      "Alert definition/state SoR unavailable",
    ],
    correlationRequired: true,
    deliveryPosture: "manual-triage",
    observeMetadataOnly: true,
    notes: [
      "Observe is metadata SoR — no live telemetry evaluation/delivery.",
      "Do not implement Email SoR or notification delivery under this policy.",
    ],
  },
] as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateAlertPolicy(policy: AlertPolicy): readonly string[] {
  const errors: string[] = [];
  if (!isNonEmptyString(policy.id)) errors.push("id required");
  if (!isNonEmptyString(policy.title)) errors.push("title required");
  if (!["P1", "P2", "P3", "INFO"].includes(policy.priority)) {
    errors.push("priority invalid");
  }
  if (!isNonEmptyString(policy.opsKey)) errors.push("opsKey required");
  if (!isNonEmptyString(policy.ownerRole)) errors.push("ownerRole required");
  if (!isNonEmptyString(policy.escalation)) errors.push("escalation required");
  if (!policy.runbookPath.startsWith("docs/operations/runbooks/")) {
    errors.push("runbookPath must be under docs/operations/runbooks/");
  }
  if (policy.symptoms.length === 0) errors.push("symptoms required");
  if (
    policy.deliveryPosture !== "manual-triage" &&
    policy.deliveryPosture !== "unsupported-delivery"
  ) {
    errors.push("deliveryPosture invalid");
  }
  if (
    (policy.priority === "P1" || policy.priority === "P2") &&
    policy.deliveryPosture !== "manual-triage"
  ) {
    errors.push("P1/P2 policies must use manual-triage posture (no delivery engine)");
  }
  if (!policy.observeMetadataOnly) {
    errors.push("observeMetadataOnly must be true until live Observe programme");
  }
  return errors;
}

export function auditAlertStrategy(input: {
  readonly policies?: readonly AlertPolicy[];
  readonly existingRunbookPaths: ReadonlySet<string>;
  readonly artefactsPresent: {
    readonly monitoringDoc: boolean;
    readonly runbookStandards: boolean;
    readonly runbooksIndex: boolean;
    readonly evidenceDirectory: boolean;
  };
  readonly environment?: string;
  readonly executedAt?: string;
}): AlertStrategyAuditEvidence {
  const policies = input.policies ?? PLATFORM_ALERT_POLICIES;
  const findings: AlertStrategyAuditFinding[] = [];

  if (
    input.artefactsPresent.monitoringDoc &&
    input.artefactsPresent.runbookStandards &&
    input.artefactsPresent.runbooksIndex &&
    input.artefactsPresent.evidenceDirectory
  ) {
    findings.push({
      id: "artefacts.present",
      severity: "pass",
      message: "Required alert-strategy artefacts are present.",
    });
  } else {
    findings.push({
      id: "artefacts.present",
      severity: "fail",
      message: "One or more required alert-strategy artefacts are missing.",
    });
  }

  const ids = new Set<string>();
  for (const policy of policies) {
    if (ids.has(policy.id)) {
      findings.push({
        id: `policy.duplicate.${policy.id}`,
        severity: "fail",
        message: `Duplicate policy id ${policy.id}.`,
      });
    }
    ids.add(policy.id);

    const errors = validateAlertPolicy(policy);
    if (errors.length > 0) {
      findings.push({
        id: `policy.invalid.${policy.id}`,
        severity: "fail",
        message: `${policy.id}: ${errors.join("; ")}`,
      });
    } else {
      findings.push({
        id: `policy.valid.${policy.id}`,
        severity: "pass",
        message: `${policy.id} is complete.`,
      });
    }

    if (!input.existingRunbookPaths.has(policy.runbookPath)) {
      findings.push({
        id: `runbook.missing.${policy.id}`,
        severity: "fail",
        message: `Missing runbook ${policy.runbookPath}.`,
      });
    } else {
      findings.push({
        id: `runbook.present.${policy.id}`,
        severity: "pass",
        message: `Runbook present for ${policy.id}.`,
      });
    }
  }

  const requiredIds = [
    "alert.identity.unavailable",
    "alert.gateway.5xx",
    "alert.platform-db.restore",
    "alert.redis.session-storm",
    "alert.support.adapter-unhealthy",
    "alert.law.authz-denials-spike",
    "alert.event-bus.publish-failures",
    "alert.automation.deferred-flood",
    "alert.observe.unavailable",
  ];
  for (const requiredId of requiredIds) {
    if (!ids.has(requiredId)) {
      findings.push({
        id: `policy.missing.${requiredId}`,
        severity: "fail",
        message: `Required policy ${requiredId} missing.`,
      });
    }
  }

  const verdict: AlertStrategyAuditVerdict = findings.some((f) => f.severity === "fail")
    ? "FAIL"
    : "PASS";

  return {
    schemaVersion: "1.0.0",
    programmeId: "APZHUB-1.2-003",
    backlogItemId: "R12-OPS-02",
    riskId: "OPS-R-05",
    executedAt: input.executedAt ?? new Date().toISOString(),
    environment: input.environment ?? "dev",
    policyCount: policies.length,
    runbookPaths: policies.map((policy) => policy.runbookPath),
    findings,
    verdict,
    notes: [
      "Alert strategy is metadata + manual triage only.",
      "No Email SoR, notification delivery, or live Observe evaluation authorised.",
    ],
    artefactPaths: [...ALERT_STRATEGY_REQUIRED_ARTEFACTS],
  };
}

export function validateAlertStrategyAuditEvidence(
  value: unknown,
):
  | { readonly ok: true; readonly evidence: AlertStrategyAuditEvidence }
  | { readonly ok: false; readonly errors: readonly string[] } {
  const errors: string[] = [];
  if (value === null || typeof value !== "object") {
    return { ok: false, errors: ["evidence must be an object"] };
  }
  const raw = value as Record<string, unknown>;
  if (raw.schemaVersion !== "1.0.0") errors.push("schemaVersion must be 1.0.0");
  if (raw.programmeId !== "APZHUB-1.2-003")
    errors.push("programmeId must be APZHUB-1.2-003");
  if (raw.backlogItemId !== "R12-OPS-02")
    errors.push("backlogItemId must be R12-OPS-02");
  if (raw.riskId !== "OPS-R-05") errors.push("riskId must be OPS-R-05");
  if (raw.verdict !== "PASS" && raw.verdict !== "FAIL") errors.push("verdict invalid");
  if (!Array.isArray(raw.findings) || raw.findings.length === 0) {
    errors.push("findings required");
  }
  if (typeof raw.policyCount !== "number") errors.push("policyCount required");
  if (!isNonEmptyString(raw.executedAt)) errors.push("executedAt required");
  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, evidence: value as AlertStrategyAuditEvidence };
}

export function listAlertPoliciesByPriority(
  priority: AlertPriority,
  policies: readonly AlertPolicy[] = PLATFORM_ALERT_POLICIES,
): readonly AlertPolicy[] {
  return policies.filter((policy) => policy.priority === priority);
}
