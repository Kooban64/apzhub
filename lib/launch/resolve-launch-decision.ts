import type { AccessRealizationStatus } from "@/lib/admin/access/realization-status";
import type { LaunchDecisionResult } from "@/lib/launch/launch-decision";
import type { LaunchReasonCode } from "@/lib/launch/launch-reason-code";
import {
  LAUNCH_REASON_OPERATOR_MESSAGES,
  LAUNCH_REASON_USER_MESSAGES,
} from "@/lib/launch/launch-reason-code";
import { getMergedServiceLaunchMethods } from "@/lib/adapters/catalog/merged-launch-methods";
import { buildLaunchTransportTarget } from "@/lib/adapters/launch/launch-target-adapter";
import type { LaunchMethod } from "@/lib/launch/launch-method";
import type { LaunchReadiness } from "@/lib/launch/launch-readiness";
import { launchDecisionResultSchema } from "@/lib/launch/launch-decision";
import type { WorkspaceServiceId } from "@/lib/workspace/workspace-config";

export type LaunchDecisionInput = {
  serviceId: WorkspaceServiceId;
  /** Tenant allowlist (workspace config). */
  tenantAllowsService: boolean;
  /** Tile is shown in launcher (subset of allowed). */
  launcherShowsService: boolean;
  /** Policy effective role for this user+service (`none` means no role). */
  effectiveRole: string;
  /** Downstream posture from access plane; `null` if unknown / no row. */
  realization: AccessRealizationStatus | null;
};

function hasEffectiveRole(role: string): boolean {
  const r = role.trim().toLowerCase();
  return r.length > 0 && r !== "none";
}

function operatorExtra(code: LaunchReasonCode): string | undefined {
  return LAUNCH_REASON_OPERATOR_MESSAGES[code];
}

function fail(
  serviceId: WorkspaceServiceId,
  method: LaunchMethod,
  readiness: LaunchReadiness,
  code: LaunchReasonCode,
): LaunchDecisionResult {
  const userMessage = LAUNCH_REASON_USER_MESSAGES[code];
  const op = operatorExtra(code);
  return launchDecisionResultSchema.parse({
    serviceId,
    method,
    readiness,
    allowed: false,
    reasonCode: code,
    userMessage,
    ...(op ? { operatorMessage: op } : {}),
    target: null,
    emitAuditEvent: true,
  });
}

function ok(serviceId: WorkspaceServiceId, method: LaunchMethod): LaunchDecisionResult {
  const target = buildLaunchTransportTarget(serviceId, method);
  return launchDecisionResultSchema.parse({
    serviceId,
    method,
    readiness: "ready",
    allowed: true,
    userMessage: "Ready to launch.",
    target,
    emitAuditEvent: true,
  });
}

function defer(serviceId: WorkspaceServiceId, method: LaunchMethod, code: LaunchReasonCode): LaunchDecisionResult {
  const userMessage = LAUNCH_REASON_USER_MESSAGES[code];
  const op = operatorExtra(code);
  return launchDecisionResultSchema.parse({
    serviceId,
    method,
    readiness: "pending",
    allowed: false,
    reasonCode: code,
    userMessage,
    ...(op ? { operatorMessage: op } : {}),
    target: null,
    emitAuditEvent: true,
  });
}

/**
 * Pure launch gate: access intent + tenant visibility + downstream realization → readiness (not job status).
 */
export function resolveLaunchDecision(input: LaunchDecisionInput): LaunchDecisionResult {
  const method = getMergedServiceLaunchMethods()[input.serviceId];

  if (!input.tenantAllowsService) {
    return fail(input.serviceId, method, "blocked", "tenant_denied");
  }
  if (!input.launcherShowsService) {
    return fail(input.serviceId, method, "blocked", "not_visible");
  }
  if (!hasEffectiveRole(input.effectiveRole)) {
    return fail(input.serviceId, method, "blocked", "no_access");
  }
  if (input.realization === null) {
    return fail(input.serviceId, method, "blocked", "launch_error");
  }

  switch (input.realization) {
    case "not_assigned":
      return fail(input.serviceId, method, "blocked", "not_provisioned");
    case "pending":
      // Launch not ready until downstream posture clears (same machine bucket as not_assigned for vocabulary freeze).
      return defer(input.serviceId, method, "not_provisioned");
    case "manual_action":
      return defer(input.serviceId, method, "manual_action_required");
    case "provisioned":
      return ok(input.serviceId, method);
    case "failed":
      return fail(input.serviceId, method, "error", "launch_error");
    case "suspended":
      return fail(input.serviceId, method, "blocked", "suspended");
    case "revoked":
      return fail(input.serviceId, method, "error", "revoked");
  }
}
