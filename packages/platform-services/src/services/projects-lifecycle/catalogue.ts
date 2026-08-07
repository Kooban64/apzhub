import type {
  GovernanceProfile,
  ProjectTemplateSummary,
} from "@apzhub/platform-service-contracts";

export const SYSTEM_GOVERNANCE_PROFILES: readonly GovernanceProfile[] = Object.freeze([
  Object.freeze({
    id: "gprof_system_standard",
    key: "standard_delivery",
    name: "Standard Delivery",
    version: 1,
    scope: "system" as const,
    requiresHoldDecision: false,
    requiresClosureApproval: false,
    requiresEvidenceOnClose: true,
    initiationRequiresMilestone: true,
    milestoneDateToleranceDays: 7,
    waitingBreachEscalationDays: 3,
    allowedDeliveryModels: Object.freeze([
      "product_delivery",
      "project_delivery",
      "operational_initiative",
    ] as const),
    allowedClassifications: Object.freeze([
      "strategic",
      "operational",
      "customer",
      "internal",
      "innovation",
    ] as const),
  }),
  Object.freeze({
    id: "gprof_system_regulatory",
    key: "regulatory_control",
    name: "Regulatory Control",
    version: 1,
    scope: "system" as const,
    requiresHoldDecision: true,
    requiresClosureApproval: true,
    requiresEvidenceOnClose: true,
    initiationRequiresMilestone: true,
    milestoneDateToleranceDays: 3,
    waitingBreachEscalationDays: 1,
    allowedDeliveryModels: Object.freeze([
      "project_delivery",
      "governance_initiative",
      "programme_delivery",
    ] as const),
    allowedClassifications: Object.freeze([
      "regulatory",
      "strategic",
      "customer",
    ] as const),
  }),
  Object.freeze({
    id: "gprof_system_lightweight",
    key: "lightweight_ops",
    name: "Lightweight Operations",
    version: 1,
    scope: "system" as const,
    requiresHoldDecision: false,
    requiresClosureApproval: false,
    requiresEvidenceOnClose: false,
    initiationRequiresMilestone: false,
    milestoneDateToleranceDays: 14,
    waitingBreachEscalationDays: 5,
    allowedDeliveryModels: Object.freeze([
      "operational_initiative",
      "product_delivery",
    ] as const),
    allowedClassifications: Object.freeze([
      "operational",
      "internal",
      "innovation",
    ] as const),
  }),
]);

export const SYSTEM_PROJECT_TEMPLATES: readonly ProjectTemplateSummary[] =
  Object.freeze([
    Object.freeze({
      id: "ptpl_customer_go_live",
      key: "customer_go_live",
      name: "Customer Go-Live",
      version: 1,
      deliveryModel: "project_delivery" as const,
      governanceProfileId: "gprof_system_standard",
      description: "Milestone-led go-live with UAT and production gates.",
      milestoneSeeds: Object.freeze([
        { name: "Design approved", offsetDays: 30 },
        { name: "UAT complete", offsetDays: 60 },
        { name: "Go-live", offsetDays: 90 },
      ]),
      riskSeeds: Object.freeze([
        { title: "Customer readiness delay", impact: "high" },
        { title: "Integration dependency slip", impact: "medium" },
      ]),
    }),
    Object.freeze({
      id: "ptpl_internal_platform",
      key: "internal_platform",
      name: "Internal Platform",
      version: 1,
      deliveryModel: "product_delivery" as const,
      governanceProfileId: "gprof_system_lightweight",
      description: "Rolling product delivery with lighter fixed milestones.",
      milestoneSeeds: Object.freeze([
        { name: "MVP available", offsetDays: 45 },
        { name: "Adoption checkpoint", offsetDays: 90 },
      ]),
      riskSeeds: Object.freeze([
        { title: "Adoption below threshold", impact: "medium" },
      ]),
    }),
    Object.freeze({
      id: "ptpl_regulatory_change",
      key: "regulatory_change",
      name: "Regulatory Change",
      version: 1,
      deliveryModel: "governance_initiative" as const,
      governanceProfileId: "gprof_system_regulatory",
      description: "Control-heavy change with evidence and closure approval.",
      milestoneSeeds: Object.freeze([
        { name: "Impact assessment", offsetDays: 14 },
        { name: "Control design approved", offsetDays: 45 },
        { name: "Compliance attestation", offsetDays: 75 },
      ]),
      riskSeeds: Object.freeze([
        { title: "Regulatory interpretation change", impact: "critical" },
        { title: "Evidence gap at attestation", impact: "high" },
      ]),
    }),
    Object.freeze({
      id: "ptpl_blank",
      key: "blank",
      name: "Blank",
      version: 1,
      deliveryModel: "project_delivery" as const,
      governanceProfileId: "gprof_system_standard",
      description: "Minimal seed — no fake milestones.",
      milestoneSeeds: Object.freeze([]),
      riskSeeds: Object.freeze([]),
    }),
  ]);

export function getGovernanceProfile(id: string): GovernanceProfile | undefined {
  return SYSTEM_GOVERNANCE_PROFILES.find((p) => p.id === id);
}

export function getProjectTemplate(id: string): ProjectTemplateSummary | undefined {
  return SYSTEM_PROJECT_TEMPLATES.find((t) => t.id === id);
}

export function suggestProfileFor(
  classification: string | undefined,
  deliveryModel: string | undefined,
): string {
  if (classification === "regulatory" || deliveryModel === "governance_initiative") {
    return "gprof_system_regulatory";
  }
  if (
    deliveryModel === "operational_initiative" ||
    deliveryModel === "product_delivery"
  ) {
    return "gprof_system_lightweight";
  }
  return "gprof_system_standard";
}
