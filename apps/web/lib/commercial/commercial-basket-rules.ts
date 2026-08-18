/**
 * Commercial licensing rules for the authoritative quote engine.
 * Not IAM / AuthZ — seat and SKU commercial dependencies only.
 */

export const APZPRD_COMPLETE_PACKAGE_ID = "pkg.apzprd.workspace";

/** Individual / composition APZPRD packages that conflict with Complete. */
export const APZPRD_MODULE_PACKAGE_IDS = [
  "pkg.apzprd.projects",
  "pkg.apzprd.time",
  "pkg.apzprd.service",
  "pkg.apzprd.workflow",
  "pkg.apzprd.analytics",
  "pkg.apzprd.knowledge",
  "pkg.apzprd.documents",
  "pkg.apzprd.delivery",
  "pkg.apzprd.operations",
] as const;

export const QEP_ENGINEER_PACKAGE_ID = "pkg.apzqep.starter";
export const QEP_COLLABORATOR_PACKAGE_ID = "pkg.apzqep.collaborator";
export const PEN_PRACTITIONER_PACKAGE_ID = "pkg.apzpen.starter";
export const PEN_COLLABORATOR_PACKAGE_ID = "pkg.apzpen.collaborator";

export type CommercialBasketRuleFailure = {
  readonly ok: false;
  readonly code: "package_dependency_unmet" | "package_conflict";
  readonly message: string;
  readonly packageId?: string;
};

export type CommercialBasketLine = {
  readonly packageId: string;
  readonly quantity: number;
};

function qty(lines: readonly CommercialBasketLine[], packageId: string): number {
  const row = lines.find((line) => line.packageId === packageId);
  return row?.quantity ?? 0;
}

/**
 * Validate commercial licensing rules before pricing.
 * Prefer explicit rejection over automatic optimisation.
 */
export function validateCommercialBasketRules(
  lines: readonly CommercialBasketLine[],
): CommercialBasketRuleFailure | { readonly ok: true } {
  const ids = new Set(lines.map((line) => line.packageId));

  if (ids.has(APZPRD_COMPLETE_PACKAGE_ID)) {
    const conflict = APZPRD_MODULE_PACKAGE_IDS.find((id) => ids.has(id));
    if (conflict) {
      return {
        ok: false,
        code: "package_conflict",
        packageId: conflict,
        message:
          "APZPRD Complete cannot be combined with individual APZPRD modules in the same basket. Choose Complete or individual modules — not both.",
      };
    }
  }

  const qepCollab = qty(lines, QEP_COLLABORATOR_PACKAGE_ID);
  if (qepCollab > 0 && qty(lines, QEP_ENGINEER_PACKAGE_ID) < 1) {
    return {
      ok: false,
      code: "package_dependency_unmet",
      packageId: QEP_COLLABORATOR_PACKAGE_ID,
      message:
        "APZQEP Collaborator requires at least one APZQEP Engineer in the same basket.",
    };
  }

  const penCollab = qty(lines, PEN_COLLABORATOR_PACKAGE_ID);
  if (penCollab > 0 && qty(lines, PEN_PRACTITIONER_PACKAGE_ID) < 1) {
    return {
      ok: false,
      code: "package_dependency_unmet",
      packageId: PEN_COLLABORATOR_PACKAGE_ID,
      message:
        "APZPEN Collaborator requires at least one APZPEN Practitioner in the same basket.",
    };
  }

  return { ok: true };
}
