import type {
  CertificationStatus,
  CertificationValidationService,
} from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import { DomainRuleError, requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import { assertCertificationTransition } from "./state-machine";
import {
  assertHasPermission,
  assertTenantOrganisationMatch,
  evidenceLinksFromJson,
} from "./validation";

export function createCertificationValidationService(
  rt: ServiceRuntime,
): CertificationValidationService {
  return {
    assertTransitionAllowed(from, to) {
      assertCertificationTransition(from as CertificationStatus, to as CertificationStatus);
    },
    async assertRequiredGatesSatisfied(ctx, certificationRecordId) {
      assertHasPermission(ctx, "certification.view");
      const rctx = toRepositoryContext(ctx);
      const record = requireFound(
        await rt.persistence.certificationRecords.get(rctx, certificationRecordId),
        "certification_record",
        certificationRecordId,
      );
      const rules = await rt.persistence.certificationRules.list(rctx);
      const rule =
        rules.items.find((r) => r.certificationRecordId === certificationRecordId) ??
        rules.items.find((r) => r.enabled);
      const required = rule?.requiredGateKeys ??
        rt.configuration?.certification.defaultGateKeys ??
        [];
      if (required.length === 0) return;

      const evals = await rt.persistence.certificationGateEvaluations.list(rctx);
      const latestByKey = new Map<string, string>();
      for (const e of evals.items.filter(
        (x) => x.certificationRecordId === certificationRecordId,
      )) {
        latestByKey.set(e.gateKey, e.status);
      }
      const missing: string[] = [];
      const failed: string[] = [];
      for (const key of required) {
        const status = latestByKey.get(key);
        if (!status || status === "pending" || status === "unknown") {
          missing.push(key);
        } else if (status === "fail") {
          failed.push(key);
        }
      }
      if (missing.length || failed.length) {
        throw new DomainRuleError(
          "required_gates_unsatisfied",
          "Required certification gates are not satisfied",
          { missing, failed, recordId: record.id },
        );
      }
    },
    async assertApprovalOrder(ctx, certificationRecordId) {
      assertHasPermission(ctx, "certification.view");
      const page = await rt.persistence.approvals.list(toRepositoryContext(ctx));
      const approvals = page.items.filter(
        (a) => a.certificationRecordId === certificationRecordId,
      );
      for (const approval of approvals) {
        const stages = (approval.stagesJson ?? []) as Array<{
          ordinal: number;
          stageKey: string;
        }>;
        if (!stages.length) continue;
        const decisions = (approval.stageDecisionsJson ?? []) as Array<{
          stageKey: string;
          status: string;
        }>;
        const sorted = [...stages].sort((a, b) => a.ordinal - b.ordinal);
        for (let i = 0; i < sorted.length; i += 1) {
          const stage = sorted[i]!;
          const decision = decisions.find((d) => d.stageKey === stage.stageKey);
          if (!decision) break;
          if (decision.status !== "approved" && i < sorted.length - 1) {
            const laterApproved = sorted.slice(i + 1).some((s) =>
              decisions.some(
                (d) => d.stageKey === s.stageKey && d.status === "approved",
              ),
            );
            if (laterApproved) {
              throw new DomainRuleError(
                "approval_order_violation",
                "Later approval stage decided before earlier stage completed",
                { approvalId: approval.id, stageKey: stage.stageKey },
              );
            }
          }
        }
      }
    },
    assertPermission(ctx, permission) {
      assertHasPermission(ctx, permission);
    },
    assertTenantOrganisation(ctx, record) {
      assertTenantOrganisationMatch(ctx, record);
    },
    async validateTraceability(ctx, certificationRecordId) {
      assertHasPermission(ctx, "certification.view");
      const record = requireFound(
        await rt.persistence.certificationRecords.get(
          toRepositoryContext(ctx),
          certificationRecordId,
        ),
        "certification_record",
        certificationRecordId,
      );
      const links = evidenceLinksFromJson(record.evidenceLinksJson);
      const gaps: string[] = [];
      if (!links.requirementIds.length && !record.planId) {
        gaps.push("missing_requirements_or_plan");
      }
      if (!links.evidenceIds.length) {
        gaps.push("missing_evidence");
      }
      if (!links.executionIds.length) {
        gaps.push("missing_executions");
      }
      return { ok: gaps.length === 0, gaps };
    },
  };
}
