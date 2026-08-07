import { randomUUID } from "node:crypto";

import type {
  CreateOperationalPolicyInput,
  CreateOrgGovernanceProfileInput,
  EffectiveGovernanceConfig,
  EffectiveGovernanceLayer,
  GovernanceCompliance,
  GovernanceComplianceBand,
  GovernanceProfile,
  OperationalPolicy,
  OrgGovernanceProfile,
  PolicySimulationResult,
  ServiceRequestContext,
  UpdateOperationalPolicyInput,
  UpdateOrgGovernanceProfileInput,
} from "@apzhub/platform-service-contracts";

import { SYSTEM_GOVERNANCE_PROFILES } from "../projects-lifecycle/catalogue";
import {
  resolveProjectsGovernanceStore,
  type ProjectsGovernanceStore,
} from "./memory-store";

function id(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

function tenant(ctx: ServiceRequestContext) {
  return ctx.tenantId ?? "default";
}

function now() {
  return new Date().toISOString();
}

function requireText(value: string | undefined, field: string): string {
  const t = value?.trim() ?? "";
  if (!t) throw new Error(`${field}_required`);
  return t;
}

function systemAsOrgShape(profile: GovernanceProfile): OrgGovernanceProfile {
  const ts = "1970-01-01T00:00:00.000Z";
  return Object.freeze({
    ...profile,
    status: "published" as const,
    boundPolicyIds: Object.freeze([] as string[]),
    createdAt: ts,
    updatedAt: ts,
    publishedAt: ts,
  });
}

export type GovernanceImpactLoader = (
  ctx: ServiceRequestContext,
  profileId: string,
) => Promise<{
  readonly portfolioCount: number;
  readonly initiativeCount: number;
  readonly projectCount: number;
  readonly programmeCount: number;
  readonly sampleProjectIds: readonly string[];
  readonly sampleProgrammeIds: readonly string[];
}>;

export type GovernanceAdminSummary = {
  readonly profileUsage: {
    readonly systemPublished: number;
    readonly orgDraft: number;
    readonly orgPublished: number;
  };
  readonly policyUsage: {
    readonly draft: number;
    readonly published: number;
  };
  readonly publicationHistory: readonly {
    readonly id: string;
    readonly kind: "profile" | "policy";
    readonly name: string;
    readonly publishedAt: string;
    readonly version: number;
  }[];
  readonly complianceRollup: {
    readonly Compliant: number;
    readonly Advisory: number;
    readonly "Non-Compliant": number;
    readonly Critical: number;
  };
  readonly overrideCount: number;
  readonly delegationCount: number;
  readonly governanceExceptionCount: number;
};

export type ProjectsGovernanceService = {
  readonly listAllProfiles: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly OrgGovernanceProfile[]>;
  readonly listOrgProfiles: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly OrgGovernanceProfile[]>;
  readonly getProfile: (
    ctx: ServiceRequestContext,
    profileId: string,
  ) => Promise<OrgGovernanceProfile | null>;
  readonly createProfile: (
    ctx: ServiceRequestContext,
    input: CreateOrgGovernanceProfileInput,
  ) => Promise<OrgGovernanceProfile>;
  readonly updateProfile: (
    ctx: ServiceRequestContext,
    profileId: string,
    input: UpdateOrgGovernanceProfileInput,
  ) => Promise<OrgGovernanceProfile>;
  readonly simulateProfilePublish: (
    ctx: ServiceRequestContext,
    profileId: string,
  ) => Promise<PolicySimulationResult>;
  readonly publishProfile: (
    ctx: ServiceRequestContext,
    profileId: string,
    options?: { readonly confirmSimulation?: boolean },
  ) => Promise<OrgGovernanceProfile>;
  readonly listPolicies: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly OperationalPolicy[]>;
  readonly getPolicy: (
    ctx: ServiceRequestContext,
    policyId: string,
  ) => Promise<OperationalPolicy | null>;
  readonly createPolicy: (
    ctx: ServiceRequestContext,
    input: CreateOperationalPolicyInput,
  ) => Promise<OperationalPolicy>;
  readonly updatePolicy: (
    ctx: ServiceRequestContext,
    policyId: string,
    input: UpdateOperationalPolicyInput,
  ) => Promise<OperationalPolicy>;
  readonly simulatePolicyPublish: (
    ctx: ServiceRequestContext,
    policyId: string,
  ) => Promise<PolicySimulationResult>;
  readonly publishPolicy: (
    ctx: ServiceRequestContext,
    policyId: string,
    options?: { readonly confirmSimulation?: boolean },
  ) => Promise<OperationalPolicy>;
  readonly getEffectiveConfig: (
    ctx: ServiceRequestContext,
    input: {
      readonly scopeType: EffectiveGovernanceConfig["scopeType"];
      readonly scopeId: string;
      readonly boundProfileId?: string;
      readonly parentProfileId?: string;
    },
  ) => Promise<EffectiveGovernanceConfig>;
  readonly computeCompliance: (
    ctx: ServiceRequestContext,
    input: {
      readonly scopeType: GovernanceCompliance["scopeType"];
      readonly scopeId: string;
      readonly openCriticalExceptions?: number;
      readonly openMajorExceptions?: number;
      readonly overdueCheckpoints?: number;
      readonly missingEvidence?: number;
      readonly unauthorisedOverrides?: number;
    },
  ) => Promise<GovernanceCompliance>;
  readonly getAdminSummary: (
    ctx: ServiceRequestContext,
  ) => Promise<GovernanceAdminSummary>;
};

export function createProjectsGovernanceService(
  store: ProjectsGovernanceStore = resolveProjectsGovernanceStore(),
  options: { readonly loadImpact?: GovernanceImpactLoader } = {},
): ProjectsGovernanceService {
  async function impact(
    ctx: ServiceRequestContext,
    profileId: string,
  ): Promise<{
    portfolioCount: number;
    initiativeCount: number;
    projectCount: number;
    programmeCount: number;
    sampleProjectIds: readonly string[];
    sampleProgrammeIds: readonly string[];
  }> {
    if (options.loadImpact) return options.loadImpact(ctx, profileId);
    return {
      portfolioCount: 0,
      initiativeCount: 0,
      projectCount: 0,
      programmeCount: 0,
      sampleProjectIds: [],
      sampleProgrammeIds: [],
    };
  }

  return {
    async listAllProfiles(ctx) {
      const org = await store.listProfiles(tenant(ctx));
      const publishedOrg = org.filter((p) => p.status === "published" && !p.archivedAt);
      return Object.freeze([
        ...SYSTEM_GOVERNANCE_PROFILES.map(systemAsOrgShape),
        ...publishedOrg,
        ...org.filter((p) => p.status === "draft"),
      ]);
    },

    listOrgProfiles(ctx) {
      return store.listProfiles(tenant(ctx));
    },

    async getProfile(ctx, profileId) {
      const system = SYSTEM_GOVERNANCE_PROFILES.find((p) => p.id === profileId);
      if (system) return systemAsOrgShape(system);
      return store.getProfile(tenant(ctx), profileId);
    },

    async createProfile(ctx, input) {
      const ts = now();
      const row: OrgGovernanceProfile = Object.freeze({
        id: id("ogp"),
        key: requireText(input.key, "key"),
        name: requireText(input.name, "name"),
        version: 1,
        scope: "organisation",
        status: "draft",
        requiresHoldDecision: Boolean(input.requiresHoldDecision),
        requiresClosureApproval: Boolean(input.requiresClosureApproval),
        requiresEvidenceOnClose: input.requiresEvidenceOnClose ?? true,
        initiationRequiresMilestone: input.initiationRequiresMilestone ?? true,
        milestoneDateToleranceDays: input.milestoneDateToleranceDays ?? 7,
        waitingBreachEscalationDays: input.waitingBreachEscalationDays ?? 3,
        allowedDeliveryModels: Object.freeze([
          ...(input.allowedDeliveryModels ?? [
            "project_delivery",
            "product_delivery",
            "operational_initiative",
          ]),
        ]),
        allowedClassifications: Object.freeze([
          ...(input.allowedClassifications ?? [
            "strategic",
            "operational",
            "customer",
            "internal",
          ]),
        ]),
        boundPolicyIds: Object.freeze([...(input.boundPolicyIds ?? [])]),
        effectiveFrom: input.effectiveFrom,
        createdAt: ts,
        updatedAt: ts,
      });
      return store.upsertProfile(tenant(ctx), row);
    },

    async updateProfile(ctx, profileId, input) {
      if (profileId.startsWith("gprof_system_")) {
        throw new Error("system_profile_immutable");
      }
      const current = await store.getProfile(tenant(ctx), profileId);
      if (!current) throw new Error("profile_not_found");
      if (current.status === "published") {
        throw new Error("published_profile_immutable_create_draft");
      }
      const next: OrgGovernanceProfile = Object.freeze({
        ...current,
        name: input.name !== undefined ? requireText(input.name, "name") : current.name,
        requiresHoldDecision:
          input.requiresHoldDecision ?? current.requiresHoldDecision,
        requiresClosureApproval:
          input.requiresClosureApproval ?? current.requiresClosureApproval,
        requiresEvidenceOnClose:
          input.requiresEvidenceOnClose ?? current.requiresEvidenceOnClose,
        initiationRequiresMilestone:
          input.initiationRequiresMilestone ?? current.initiationRequiresMilestone,
        milestoneDateToleranceDays:
          input.milestoneDateToleranceDays ?? current.milestoneDateToleranceDays,
        waitingBreachEscalationDays:
          input.waitingBreachEscalationDays ?? current.waitingBreachEscalationDays,
        allowedDeliveryModels: Object.freeze([
          ...(input.allowedDeliveryModels ?? current.allowedDeliveryModels),
        ]),
        allowedClassifications: Object.freeze([
          ...(input.allowedClassifications ?? current.allowedClassifications),
        ]),
        boundPolicyIds: Object.freeze([
          ...(input.boundPolicyIds ?? current.boundPolicyIds),
        ]),
        effectiveFrom:
          input.effectiveFrom === null
            ? undefined
            : (input.effectiveFrom ?? current.effectiveFrom),
        updatedAt: now(),
      });
      return store.upsertProfile(tenant(ctx), next);
    },

    async simulateProfilePublish(ctx, profileId) {
      const profile = await store.getProfile(tenant(ctx), profileId);
      if (!profile) throw new Error("profile_not_found");
      const counts = await impact(ctx, profileId);
      const standard = SYSTEM_GOVERNANCE_PROFILES[0]!;
      const conflicts: { code: string; message: string }[] = [];
      const governanceChanges: {
        field: string;
        from: string;
        to: string;
      }[] = [];
      if (profile.milestoneDateToleranceDays !== standard.milestoneDateToleranceDays) {
        governanceChanges.push({
          field: "milestoneDateToleranceDays",
          from: String(standard.milestoneDateToleranceDays),
          to: String(profile.milestoneDateToleranceDays),
        });
      }
      if (
        profile.waitingBreachEscalationDays !== standard.waitingBreachEscalationDays
      ) {
        governanceChanges.push({
          field: "waitingBreachEscalationDays",
          from: String(standard.waitingBreachEscalationDays),
          to: String(profile.waitingBreachEscalationDays),
        });
      }
      if (profile.requiresClosureApproval !== standard.requiresClosureApproval) {
        governanceChanges.push({
          field: "requiresClosureApproval",
          from: String(standard.requiresClosureApproval),
          to: String(profile.requiresClosureApproval),
        });
      }
      if (profile.milestoneDateToleranceDays > standard.milestoneDateToleranceDays) {
        conflicts.push({
          code: "looser_tolerance",
          message:
            "Org profile is looser than platform Standard on milestone tolerance — waiver required for inheritance loosen.",
        });
      }
      return {
        targetType: "profile",
        targetId: profileId,
        affectedPortfolioCount: counts.portfolioCount,
        affectedInitiativeCount: counts.initiativeCount,
        affectedProjectCount: counts.projectCount,
        affectedProgrammeCount: counts.programmeCount,
        sampleProjectIds: Object.freeze([...counts.sampleProjectIds]),
        sampleProgrammeIds: Object.freeze([...counts.sampleProgrammeIds]),
        conflicts: Object.freeze(conflicts),
        governanceChanges: Object.freeze(governanceChanges),
        advisoryGateFailures: Object.freeze(
          counts.projectCount > 0
            ? [
                "Non-retroactive publish: existing projects keep snapshotted profile until explicit re-bind.",
              ]
            : [],
        ),
        nonRetroactive: true,
        simulatedAt: now(),
      };
    },

    async publishProfile(ctx, profileId, options) {
      if (!options?.confirmSimulation) {
        throw new Error("simulation_confirmation_required");
      }
      const current = await store.getProfile(tenant(ctx), profileId);
      if (!current) throw new Error("profile_not_found");
      if (current.status !== "draft") throw new Error("only_draft_can_publish");
      const ts = now();
      return store.upsertProfile(tenant(ctx), {
        ...current,
        status: "published",
        version: current.version + 1,
        publishedAt: ts,
        updatedAt: ts,
      });
    },

    listPolicies(ctx) {
      return store.listPolicies(tenant(ctx));
    },

    getPolicy(ctx, policyId) {
      return store.getPolicy(tenant(ctx), policyId);
    },

    async createPolicy(ctx, input) {
      const ts = now();
      if (!input.areas?.length) throw new Error("areas_required");
      const row: OperationalPolicy = Object.freeze({
        id: id("opol"),
        key: requireText(input.key, "key"),
        name: requireText(input.name, "name"),
        version: 1,
        status: "draft",
        areas: Object.freeze([...input.areas]),
        rules: Object.freeze({ ...(input.rules ?? {}) }),
        boundProfileIds: Object.freeze([...(input.boundProfileIds ?? [])]),
        effectiveFrom: input.effectiveFrom,
        createdAt: ts,
        updatedAt: ts,
      });
      return store.upsertPolicy(tenant(ctx), row);
    },

    async updatePolicy(ctx, policyId, input) {
      const current = await store.getPolicy(tenant(ctx), policyId);
      if (!current) throw new Error("policy_not_found");
      if (current.status === "published") {
        throw new Error("published_policy_immutable_create_draft");
      }
      const next: OperationalPolicy = Object.freeze({
        ...current,
        name: input.name !== undefined ? requireText(input.name, "name") : current.name,
        areas: Object.freeze([...(input.areas ?? current.areas)]),
        rules: Object.freeze({ ...(input.rules ?? current.rules) }),
        boundProfileIds: Object.freeze([
          ...(input.boundProfileIds ?? current.boundProfileIds),
        ]),
        effectiveFrom:
          input.effectiveFrom === null
            ? undefined
            : (input.effectiveFrom ?? current.effectiveFrom),
        updatedAt: now(),
      });
      return store.upsertPolicy(tenant(ctx), next);
    },

    async simulatePolicyPublish(ctx, policyId) {
      const policy = await store.getPolicy(tenant(ctx), policyId);
      if (!policy) throw new Error("policy_not_found");
      const bound = policy.boundProfileIds[0];
      const counts = bound
        ? await impact(ctx, bound)
        : {
            portfolioCount: 0,
            initiativeCount: 0,
            projectCount: 0,
            programmeCount: 0,
            sampleProjectIds: [] as string[],
            sampleProgrammeIds: [] as string[],
          };
      return {
        targetType: "policy",
        targetId: policyId,
        affectedPortfolioCount: counts.portfolioCount,
        affectedInitiativeCount: counts.initiativeCount,
        affectedProjectCount: counts.projectCount,
        affectedProgrammeCount: counts.programmeCount,
        sampleProjectIds: Object.freeze([...counts.sampleProjectIds]),
        sampleProgrammeIds: Object.freeze([...counts.sampleProgrammeIds]),
        conflicts: Object.freeze([] as { code: string; message: string }[]),
        governanceChanges: Object.freeze(
          policy.areas.map((area) => ({
            field: `policy.area.${area}`,
            from: "unset",
            to: "active",
          })),
        ),
        advisoryGateFailures: Object.freeze([
          "Policy publish is non-retroactive for existing project snapshots.",
        ]),
        nonRetroactive: true,
        simulatedAt: now(),
      };
    },

    async publishPolicy(ctx, policyId, options) {
      if (!options?.confirmSimulation) {
        throw new Error("simulation_confirmation_required");
      }
      const current = await store.getPolicy(tenant(ctx), policyId);
      if (!current) throw new Error("policy_not_found");
      if (current.status !== "draft") throw new Error("only_draft_can_publish");
      const ts = now();
      return store.upsertPolicy(tenant(ctx), {
        ...current,
        status: "published",
        version: current.version + 1,
        publishedAt: ts,
        updatedAt: ts,
      });
    },

    async getEffectiveConfig(ctx, input) {
      const layers: EffectiveGovernanceLayer[] = [];
      layers.push({
        scopeType: "platform",
        scopeId: "platform",
        profileId: "gprof_system_standard",
        profileName: "Standard Delivery",
        policyIds: Object.freeze([]),
      });
      if (input.parentProfileId) {
        const parent = await this.getProfile(ctx, input.parentProfileId);
        layers.push({
          scopeType: "programme",
          scopeId: input.scopeId,
          profileId: parent?.id,
          profileName: parent?.name,
          policyIds: Object.freeze([...(parent?.boundPolicyIds ?? [])]),
        });
      }
      let profile: GovernanceProfile | null = null;
      if (input.boundProfileId) {
        const bound = await this.getProfile(ctx, input.boundProfileId);
        profile = bound;
        layers.push({
          scopeType: input.scopeType,
          scopeId: input.scopeId,
          profileId: bound?.id,
          profileName: bound?.name,
          policyIds: Object.freeze([...(bound?.boundPolicyIds ?? [])]),
        });
      } else {
        profile = SYSTEM_GOVERNANCE_PROFILES[0] ?? null;
      }
      const policyIds = Object.freeze([
        ...new Set(layers.flatMap((l) => [...l.policyIds])),
      ]);
      return {
        scopeType: input.scopeType,
        scopeId: input.scopeId,
        profile,
        layers: Object.freeze(layers),
        policyIds,
        resolvedAt: now(),
      };
    },

    async computeCompliance(_ctx, input) {
      const factors: {
        code: string;
        label: string;
        severity: "info" | "advisory" | "breach" | "critical";
      }[] = [];
      let band: GovernanceComplianceBand = "Compliant";
      if ((input.openCriticalExceptions ?? 0) > 0) {
        band = "Critical";
        factors.push({
          code: "critical_exceptions",
          label: `${input.openCriticalExceptions} open Critical exceptions`,
          severity: "critical",
        });
      } else if ((input.unauthorisedOverrides ?? 0) > 0) {
        band = "Non-Compliant";
        factors.push({
          code: "unauthorised_overrides",
          label: `${input.unauthorisedOverrides} unauthorised overrides`,
          severity: "breach",
        });
      } else if (
        (input.openMajorExceptions ?? 0) > 0 ||
        (input.overdueCheckpoints ?? 0) > 0 ||
        (input.missingEvidence ?? 0) > 0
      ) {
        band = "Advisory";
        if ((input.openMajorExceptions ?? 0) > 0) {
          factors.push({
            code: "major_exceptions",
            label: `${input.openMajorExceptions} open Major exceptions`,
            severity: "advisory",
          });
        }
        if ((input.overdueCheckpoints ?? 0) > 0) {
          factors.push({
            code: "overdue_checkpoints",
            label: `${input.overdueCheckpoints} overdue checkpoints`,
            severity: "advisory",
          });
        }
        if ((input.missingEvidence ?? 0) > 0) {
          factors.push({
            code: "missing_evidence",
            label: `${input.missingEvidence} missing evidence items`,
            severity: "advisory",
          });
        }
      } else {
        factors.push({
          code: "compliant",
          label: "No open governance breaches",
          severity: "info",
        });
      }
      return {
        scopeType: input.scopeType,
        scopeId: input.scopeId,
        band,
        factors: Object.freeze(factors),
        computedAt: now(),
      };
    },

    async getAdminSummary(ctx) {
      const profiles = await store.listProfiles(tenant(ctx));
      const policies = await store.listPolicies(tenant(ctx));
      const publicationHistory = [
        ...profiles
          .filter((p) => p.publishedAt)
          .map((p) => ({
            id: p.id,
            kind: "profile" as const,
            name: p.name,
            publishedAt: p.publishedAt!,
            version: p.version,
          })),
        ...policies
          .filter((p) => p.publishedAt)
          .map((p) => ({
            id: p.id,
            kind: "policy" as const,
            name: p.name,
            publishedAt: p.publishedAt!,
            version: p.version,
          })),
      ].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

      return {
        profileUsage: {
          systemPublished: SYSTEM_GOVERNANCE_PROFILES.length,
          orgDraft: profiles.filter((p) => p.status === "draft").length,
          orgPublished: profiles.filter((p) => p.status === "published").length,
        },
        policyUsage: {
          draft: policies.filter((p) => p.status === "draft").length,
          published: policies.filter((p) => p.status === "published").length,
        },
        publicationHistory: Object.freeze(publicationHistory.slice(0, 20)),
        complianceRollup: {
          Compliant: 0,
          Advisory: 0,
          "Non-Compliant": 0,
          Critical: 0,
        },
        overrideCount: 0,
        delegationCount: 0,
        governanceExceptionCount: 0,
      };
    },
  };
}

export {
  getMemoryProjectsGovernanceStore,
  resetProjectsGovernanceStoreForTests,
  setProjectsGovernanceStoreForTests,
  resolveProjectsGovernanceStore,
} from "./memory-store";
