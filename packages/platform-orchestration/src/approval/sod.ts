/**
 * Declarative Separation of Duties evaluation (QO-008).
 * No procedural workflow logic.
 */

import type {
  ApprovalDecision,
  ApprovalTemplate,
  SodRule,
} from "../contracts/approval";

export interface SodContext {
  readonly template: ApprovalTemplate;
  readonly decisions: readonly ApprovalDecision[];
  readonly changeOwnerActorId?: string;
  readonly emergency: boolean;
  /** Active delegations: fromAuthority → { toAuthority, expiresAt, actorId } */
  readonly delegations: readonly {
    readonly fromAuthorityId: string;
    readonly toAuthorityId: string;
    readonly actorId: string;
    readonly createdAt: string;
    readonly maxHours: number;
  }[];
}

export interface SodEvaluation {
  readonly satisfied: boolean;
  readonly findings: readonly string[];
  readonly blocking: readonly string[];
}

const TERMINAL_POSITIVE = new Set(["approved", "conditionally_approved"]);
const ACTOR_DECISIONS = new Set([
  "approved",
  "conditionally_approved",
  "rejected",
  "delegated",
  "escalated",
]);

export function evaluateSod(ctx: SodContext): SodEvaluation {
  const findings: string[] = [];
  const blocking: string[] = [];

  for (const rule of ctx.template.sodRules) {
    const result = evaluateRule(rule, ctx);
    findings.push(...result.findings);
    blocking.push(...result.blocking);
  }

  return {
    satisfied: blocking.length === 0,
    findings,
    blocking,
  };
}

function evaluateRule(
  rule: SodRule,
  ctx: SodContext,
): { findings: string[]; blocking: string[] } {
  const findings: string[] = [];
  const blocking: string[] = [];

  switch (rule.type) {
    case "independent_approval": {
      const actors = positiveActors(ctx.decisions);
      const unique = new Set(actors);
      if (actors.length >= 2 && unique.size < actors.length) {
        blocking.push(
          "independent_approval violated: same actor decided for multiple authorities",
        );
      } else {
        findings.push("independent_approval: distinct actors where applicable");
      }
      return { findings, blocking };
    }
    case "two_person_approval": {
      const actors = new Set(positiveActors(ctx.decisions));
      if (actors.size < 2 && hasAnyPositive(ctx.decisions)) {
        // Only block when attempting to finalize with < 2 — checked at finalize time by engine
        findings.push(
          `two_person_approval: ${actors.size} distinct actor(s) so far (need 2)`,
        );
      } else if (actors.size >= 2) {
        findings.push("two_person_approval: satisfied");
      } else {
        findings.push("two_person_approval: awaiting decisions");
      }
      return { findings, blocking };
    }
    case "no_self_approval": {
      if (!ctx.changeOwnerActorId) {
        findings.push("no_self_approval: no changeOwnerActorId provided — skipped");
        return { findings, blocking };
      }
      const self = ctx.decisions.filter(
        (d) =>
          ACTOR_DECISIONS.has(d.state) &&
          d.actorId === ctx.changeOwnerActorId &&
          TERMINAL_POSITIVE.has(d.state),
      );
      if (self.length) {
        blocking.push(
          `no_self_approval violated: change owner ${ctx.changeOwnerActorId} submitted a positive decision`,
        );
      } else {
        findings.push("no_self_approval: change owner has not positively approved");
      }
      return { findings, blocking };
    }
    case "mandatory_authority": {
      const hit = ctx.decisions.find(
        (d) => d.authorityId === rule.authorityId && TERMINAL_POSITIVE.has(d.state),
      );
      if (hit) {
        findings.push(`mandatory_authority(${rule.authorityId}): satisfied`);
      } else {
        findings.push(`mandatory_authority(${rule.authorityId}): outstanding`);
      }
      return { findings, blocking };
    }
    case "emergency_authority": {
      if (ctx.emergency) {
        findings.push(
          `emergency_authority(${rule.authorityId}): emergency mode active`,
        );
      } else {
        findings.push(
          `emergency_authority(${rule.authorityId}): not in emergency mode`,
        );
      }
      return { findings, blocking };
    }
    case "time_limited_delegation": {
      const now = Date.now();
      for (const d of ctx.delegations) {
        const created = Date.parse(d.createdAt);
        const expires = created + rule.maxHours * 3600_000;
        if (now > expires) {
          blocking.push(
            `time_limited_delegation expired for ${d.fromAuthorityId} → ${d.toAuthorityId}`,
          );
        } else {
          findings.push(
            `time_limited_delegation active for ${d.fromAuthorityId} (${rule.maxHours}h)`,
          );
        }
      }
      return { findings, blocking };
    }
    default: {
      const _exhaustive: never = rule;
      blocking.push(`unknown SoD rule ${JSON.stringify(_exhaustive)}`);
      return { findings, blocking };
    }
  }
}

function positiveActors(decisions: readonly ApprovalDecision[]): string[] {
  return decisions.filter((d) => TERMINAL_POSITIVE.has(d.state)).map((d) => d.actorId);
}

function hasAnyPositive(decisions: readonly ApprovalDecision[]): boolean {
  return decisions.some((d) => TERMINAL_POSITIVE.has(d.state));
}

/** Whether two-person rule is met for finalization. */
export function twoPersonSatisfied(
  template: ApprovalTemplate,
  decisions: readonly ApprovalDecision[],
): boolean {
  const needs = template.sodRules.some((r) => r.type === "two_person_approval");
  if (!needs) return true;
  return new Set(positiveActors(decisions)).size >= 2;
}

/** Whether all mandatory authorities have positive decisions. */
export function mandatoryAuthoritiesSatisfied(
  template: ApprovalTemplate,
  decisions: readonly ApprovalDecision[],
): boolean {
  const mandatory = template.sodRules.filter(
    (r): r is Extract<SodRule, { type: "mandatory_authority" }> =>
      r.type === "mandatory_authority",
  );
  return mandatory.every((r) =>
    decisions.some(
      (d) => d.authorityId === r.authorityId && TERMINAL_POSITIVE.has(d.state),
    ),
  );
}
