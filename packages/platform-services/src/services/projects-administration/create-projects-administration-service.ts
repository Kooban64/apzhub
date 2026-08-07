/**
 * W010 / PX-07 — Projects Operational Administration Platform Service.
 */

import { randomUUID } from "node:crypto";

import type {
  CreateGovernedSearchInput,
  CreateLegalHoldInput,
  CreateOperationalDelegationInput,
  CreateOperationalRoleInput,
  CreateRetentionPolicyInput,
  GovernanceAdminAuditEvent,
  GovernanceMaturityAssessment,
  GovernanceMaturityBand,
  GovernanceScopeType,
  GovernedSearch,
  LegalHold,
  OperationalDelegation,
  OperationalRoleDefinition,
  RetentionPolicy,
  ServiceRequestContext,
} from "@apzhub/platform-service-contracts";

import {
  resolveProjectsAdministrationStore,
  type ProjectsAdministrationStore,
} from "./memory-store";

export {
  getMemoryProjectsAdministrationStore,
  resetProjectsAdministrationStoreForTests,
  setProjectsAdministrationStoreForTests,
  resolveProjectsAdministrationStore,
} from "./memory-store";

const FORBIDDEN_DELEGATION_PERMISSIONS = new Set([
  "checkpoint.waive",
  "projects.superadmin",
  "superadmin",
]);

const DEFAULT_ROLES: readonly Omit<
  OperationalRoleDefinition,
  "id" | "createdAt" | "updatedAt"
>[] = [
  {
    key: "project_owner",
    label: "Project Owner",
    description: "Accountable for project outcomes",
    accountabilityHint: "Accountable",
    status: "active",
  },
  {
    key: "delivery_lead",
    label: "Delivery Lead",
    description: "Responsible for delivery execution",
    accountabilityHint: "Responsible",
    status: "active",
  },
  {
    key: "sponsor",
    label: "Sponsor",
    description: "Executive sponsor",
    accountabilityHint: "Accountable (escalation)",
    status: "active",
  },
  {
    key: "pmo",
    label: "PMO",
    description: "Portfolio / programme office oversight",
    accountabilityHint: "Consulted",
    status: "active",
  },
];

function id(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "")}`;
}

function tenant(ctx: ServiceRequestContext) {
  return ctx.tenantId ?? "default";
}

function now() {
  return new Date().toISOString();
}

function requireUser(ctx: ServiceRequestContext): string {
  const uid = ctx.userId?.trim() ?? "";
  if (!uid) throw new Error("user_required");
  return uid;
}

function requireText(value: string | undefined, field: string): string {
  const t = value?.trim() ?? "";
  if (!t) throw new Error(`${field}_required`);
  return t;
}

export type ProjectsAdministrationService = {
  readonly listDelegations: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly OperationalDelegation[]>;
  readonly createDelegation: (
    ctx: ServiceRequestContext,
    input: CreateOperationalDelegationInput,
  ) => Promise<OperationalDelegation>;
  readonly revokeDelegation: (
    ctx: ServiceRequestContext,
    delegationId: string,
  ) => Promise<OperationalDelegation>;
  readonly expireDueDelegations: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly OperationalDelegation[]>;
  readonly listRetentionPolicies: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly RetentionPolicy[]>;
  readonly createRetentionPolicy: (
    ctx: ServiceRequestContext,
    input: CreateRetentionPolicyInput,
  ) => Promise<RetentionPolicy>;
  readonly publishRetentionPolicy: (
    ctx: ServiceRequestContext,
    policyId: string,
  ) => Promise<RetentionPolicy>;
  readonly listLegalHolds: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly LegalHold[]>;
  readonly placeLegalHold: (
    ctx: ServiceRequestContext,
    input: CreateLegalHoldInput,
  ) => Promise<LegalHold>;
  readonly releaseLegalHold: (
    ctx: ServiceRequestContext,
    holdId: string,
  ) => Promise<LegalHold>;
  readonly canPurgeScope: (
    ctx: ServiceRequestContext,
    scopeType: GovernanceScopeType,
    scopeId: string,
  ) => Promise<{ readonly allowed: boolean; readonly reason?: string }>;
  readonly listGovernedSearches: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly GovernedSearch[]>;
  readonly createGovernedSearch: (
    ctx: ServiceRequestContext,
    input: CreateGovernedSearchInput,
  ) => Promise<GovernedSearch>;
  readonly publishGovernedSearch: (
    ctx: ServiceRequestContext,
    searchId: string,
  ) => Promise<GovernedSearch>;
  readonly listOperationalRoles: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly OperationalRoleDefinition[]>;
  readonly createOperationalRole: (
    ctx: ServiceRequestContext,
    input: CreateOperationalRoleInput,
  ) => Promise<OperationalRoleDefinition>;
  readonly ensureDefaultRoles: (
    ctx: ServiceRequestContext,
  ) => Promise<readonly OperationalRoleDefinition[]>;
  readonly listAdminAudit: (
    ctx: ServiceRequestContext,
    limit?: number,
  ) => Promise<readonly GovernanceAdminAuditEvent[]>;
  readonly assessMaturity: (
    ctx: ServiceRequestContext,
    input: {
      readonly scopeType: GovernanceScopeType;
      readonly scopeId: string;
      readonly publishedProfileCount?: number;
      readonly publishedPolicyCount?: number;
      readonly activeDelegationCount?: number;
      readonly retentionPublished?: boolean;
      readonly governedSearchCount?: number;
    },
  ) => Promise<GovernanceMaturityAssessment>;
  readonly getHierarchyLayers: (
    scopeType: GovernanceScopeType,
    scopeId: string,
  ) => readonly {
    readonly scopeType: GovernanceScopeType;
    readonly scopeId: string;
    readonly label: string;
  }[];
};

async function audit(
  store: ProjectsAdministrationStore,
  ctx: ServiceRequestContext,
  type: string,
  summary: string,
  payload: Record<string, unknown>,
) {
  const row: GovernanceAdminAuditEvent = {
    id: id("gaud"),
    type,
    actorPrincipalId: requireUser(ctx),
    summary,
    payload,
    correlationId: ctx.correlationId,
    at: now(),
  };
  await store.appendAudit(tenant(ctx), row);
}

export function createProjectsAdministrationService(
  store?: ProjectsAdministrationStore,
): ProjectsAdministrationService {
  const s = resolveProjectsAdministrationStore(store);

  async function ensureDefaultRoles(
    ctx: ServiceRequestContext,
  ): Promise<readonly OperationalRoleDefinition[]> {
    const existing = await s.listRoles(tenant(ctx));
    if (existing.length > 0) return existing;
    const ts = now();
    const seeded: OperationalRoleDefinition[] = [];
    for (const def of DEFAULT_ROLES) {
      const row: OperationalRoleDefinition = {
        ...def,
        id: id("orole"),
        createdAt: ts,
        updatedAt: ts,
      };
      await s.upsertRole(tenant(ctx), row);
      seeded.push(row);
    }
    return seeded;
  }

  const service: ProjectsAdministrationService = {
    listDelegations(ctx) {
      return s.listDelegations(tenant(ctx));
    },

    async createDelegation(ctx, input) {
      const actor = requireUser(ctx);
      const from = requireText(input.fromPrincipalId, "fromPrincipalId");
      const to = requireText(input.toPrincipalId, "toPrincipalId");
      if (from === to) throw new Error("delegation_same_principal");
      const scopeId = requireText(input.scopeId, "scopeId");
      const reason = requireText(input.reason, "reason");
      const validFrom = requireText(input.validFrom, "validFrom");
      const validTo = requireText(input.validTo, "validTo");
      if (new Date(validTo).getTime() <= new Date(validFrom).getTime()) {
        throw new Error("delegation_window_invalid");
      }
      const permissionSet = [...(input.permissionSet ?? [])];
      for (const p of permissionSet) {
        if (FORBIDDEN_DELEGATION_PERMISSIONS.has(p)) {
          throw new Error("delegation_sod_forbidden");
        }
      }
      const row: OperationalDelegation = {
        id: id("del"),
        fromPrincipalId: from,
        toPrincipalId: to,
        scopeType: input.scopeType,
        scopeId,
        permissionSet,
        roleKeys: [...(input.roleKeys ?? [])],
        validFrom,
        validTo,
        reason,
        status: "active",
        createdBy: actor,
        createdAt: now(),
      };
      await s.upsertDelegation(tenant(ctx), row);
      await audit(s, ctx, "projects.delegation.created", "Delegation created", {
        id: row.id,
        scopeType: row.scopeType,
        scopeId: row.scopeId,
        toPrincipalId: row.toPrincipalId,
      });
      return row;
    },

    async revokeDelegation(ctx, delegationId) {
      const actor = requireUser(ctx);
      const existing = await s.getDelegation(tenant(ctx), delegationId);
      if (!existing) throw new Error("delegation_not_found");
      if (existing.status !== "active") throw new Error("delegation_not_active");
      const revoked: OperationalDelegation = {
        ...existing,
        status: "revoked",
        revokedAt: now(),
        revokedBy: actor,
      };
      await s.upsertDelegation(tenant(ctx), revoked);
      await audit(s, ctx, "projects.delegation.revoked", "Delegation revoked", {
        id: revoked.id,
      });
      return revoked;
    },

    async expireDueDelegations(ctx) {
      const ts = now();
      const all = await s.listDelegations(tenant(ctx));
      const expired: OperationalDelegation[] = [];
      for (const d of all) {
        if (d.status === "active" && d.validTo <= ts) {
          const row: OperationalDelegation = { ...d, status: "expired" };
          await s.upsertDelegation(tenant(ctx), row);
          expired.push(row);
          await audit(s, ctx, "projects.delegation.expired", "Delegation expired", {
            id: row.id,
          });
        }
      }
      return expired;
    },

    listRetentionPolicies(ctx) {
      return s.listRetentionPolicies(tenant(ctx));
    },

    async createRetentionPolicy(ctx, input) {
      const ts = now();
      const years = input.retainYears;
      if (!Number.isFinite(years) || years < 1) {
        throw new Error("retain_years_invalid");
      }
      const row: RetentionPolicy = {
        id: id("ret"),
        key: requireText(input.key, "key"),
        name: requireText(input.name, "name"),
        classification: requireText(input.classification, "classification"),
        retainYears: years,
        archiveBehaviour: input.archiveBehaviour,
        status: "draft",
        createdAt: ts,
        updatedAt: ts,
      };
      await s.upsertRetentionPolicy(tenant(ctx), row);
      await audit(s, ctx, "projects.retention.created", "Retention policy created", {
        id: row.id,
        key: row.key,
      });
      return row;
    },

    async publishRetentionPolicy(ctx, policyId) {
      const all = await s.listRetentionPolicies(tenant(ctx));
      const existing = all.find((p) => p.id === policyId);
      if (!existing) throw new Error("retention_policy_not_found");
      if (existing.status === "published") return existing;
      const published: RetentionPolicy = {
        ...existing,
        status: "published",
        updatedAt: now(),
      };
      await s.upsertRetentionPolicy(tenant(ctx), published);
      await audit(
        s,
        ctx,
        "projects.retention.published",
        "Retention policy published",
        {
          id: published.id,
        },
      );
      return published;
    },

    listLegalHolds(ctx) {
      return s.listLegalHolds(tenant(ctx));
    },

    async placeLegalHold(ctx, input) {
      const actor = requireUser(ctx);
      const row: LegalHold = {
        id: id("hold"),
        scopeType: input.scopeType,
        scopeId: requireText(input.scopeId, "scopeId"),
        reason: requireText(input.reason, "reason"),
        placedBy: actor,
        placedAt: now(),
        status: "active",
      };
      await s.upsertLegalHold(tenant(ctx), row);
      await audit(s, ctx, "projects.legal_hold.placed", "Legal hold placed", {
        id: row.id,
        scopeType: row.scopeType,
        scopeId: row.scopeId,
      });
      return row;
    },

    async releaseLegalHold(ctx, holdId) {
      const actor = requireUser(ctx);
      const all = await s.listLegalHolds(tenant(ctx));
      const existing = all.find((h) => h.id === holdId);
      if (!existing) throw new Error("legal_hold_not_found");
      if (existing.status !== "active") throw new Error("legal_hold_not_active");
      const released: LegalHold = {
        ...existing,
        status: "released",
        releasedAt: now(),
        releasedBy: actor,
      };
      await s.upsertLegalHold(tenant(ctx), released);
      await audit(s, ctx, "projects.legal_hold.released", "Legal hold released", {
        id: released.id,
      });
      return released;
    },

    async canPurgeScope(ctx, scopeType, scopeId) {
      const holds = await s.listLegalHolds(tenant(ctx));
      const active = holds.find(
        (h) =>
          h.status === "active" && h.scopeType === scopeType && h.scopeId === scopeId,
      );
      if (active) {
        return {
          allowed: false,
          reason: `legal_hold_blocks_purge:${active.id}`,
        };
      }
      return { allowed: true };
    },

    listGovernedSearches(ctx) {
      return s.listGovernedSearches(tenant(ctx));
    },

    async createGovernedSearch(ctx, input) {
      const actor = requireUser(ctx);
      const ts = now();
      const row: GovernedSearch = {
        id: id("gsearch"),
        key: requireText(input.key, "key"),
        name: requireText(input.name, "name"),
        query: requireText(input.query, "query"),
        facets: input.facets ?? {},
        status: "draft",
        audience: input.audience ?? "organisation",
        scopeId: input.scopeId,
        createdBy: actor,
        createdAt: ts,
        updatedAt: ts,
      };
      await s.upsertGovernedSearch(tenant(ctx), row);
      await audit(
        s,
        ctx,
        "projects.governed_search.created",
        "Governed search created",
        {
          id: row.id,
          key: row.key,
        },
      );
      return row;
    },

    async publishGovernedSearch(ctx, searchId) {
      const all = await s.listGovernedSearches(tenant(ctx));
      const existing = all.find((x) => x.id === searchId);
      if (!existing) throw new Error("governed_search_not_found");
      if (existing.status === "published") return existing;
      const published: GovernedSearch = {
        ...existing,
        status: "published",
        publishedAt: now(),
        updatedAt: now(),
      };
      await s.upsertGovernedSearch(tenant(ctx), published);
      await audit(
        s,
        ctx,
        "projects.governed_search.published",
        "Governed search published",
        {
          id: published.id,
        },
      );
      return published;
    },

    async listOperationalRoles(ctx) {
      await ensureDefaultRoles(ctx);
      return s.listRoles(tenant(ctx));
    },

    async createOperationalRole(ctx, input) {
      const ts = now();
      const row: OperationalRoleDefinition = {
        id: id("orole"),
        key: requireText(input.key, "key"),
        label: requireText(input.label, "label"),
        description: input.description?.trim() ?? "",
        accountabilityHint: input.accountabilityHint?.trim() ?? "Responsible",
        status: "active",
        createdAt: ts,
        updatedAt: ts,
      };
      await s.upsertRole(tenant(ctx), row);
      await audit(
        s,
        ctx,
        "projects.operational_role.created",
        "Operational role created",
        {
          id: row.id,
          key: row.key,
        },
      );
      return row;
    },

    ensureDefaultRoles,

    listAdminAudit(ctx, limit) {
      return s.listAudit(tenant(ctx), limit);
    },

    async assessMaturity(ctx, input) {
      await service.expireDueDelegations(ctx);
      const factors = [
        {
          code: "profiles",
          label: "Published governance profiles",
          score: Math.min(100, (input.publishedProfileCount ?? 0) * 25),
        },
        {
          code: "policies",
          label: "Published operational policies",
          score: Math.min(100, (input.publishedPolicyCount ?? 0) * 20),
        },
        {
          code: "delegation",
          label: "Controlled delegation hygiene",
          score:
            (input.activeDelegationCount ?? 0) > 20
              ? 40
              : (input.activeDelegationCount ?? 0) > 0
                ? 70
                : 55,
        },
        {
          code: "retention",
          label: "Retention administration",
          score: input.retentionPublished ? 90 : 30,
        },
        {
          code: "governed_search",
          label: "Governed enterprise searches",
          score: Math.min(100, (input.governedSearchCount ?? 0) * 30),
        },
      ];
      const avg =
        factors.reduce((sum, f) => sum + f.score, 0) / Math.max(factors.length, 1);
      let band: GovernanceMaturityBand = "Initial";
      if (avg >= 85) band = "Optimising";
      else if (avg >= 70) band = "Measured";
      else if (avg >= 55) band = "Defined";
      else if (avg >= 35) band = "Managed";

      return {
        scopeType: input.scopeType,
        scopeId: input.scopeId,
        band,
        factors,
        assessedAt: now(),
      };
    },

    getHierarchyLayers(scopeType, scopeId) {
      const chain: {
        scopeType: GovernanceScopeType;
        scopeId: string;
        label: string;
      }[] = [
        { scopeType: "platform", scopeId: "platform", label: "Platform defaults" },
        {
          scopeType: "organisation",
          scopeId: "organisation",
          label: "Organisation defaults",
        },
      ];
      if (
        scopeType === "portfolio" ||
        scopeType === "initiative" ||
        scopeType === "programme" ||
        scopeType === "project"
      ) {
        chain.push({
          scopeType: "portfolio",
          scopeId: scopeType === "portfolio" ? scopeId : "enterprise",
          label: "Portfolio",
        });
      }
      if (
        scopeType === "initiative" ||
        scopeType === "programme" ||
        scopeType === "project"
      ) {
        chain.push({
          scopeType: "initiative",
          scopeId: scopeType === "initiative" ? scopeId : "inherited",
          label: "Initiative",
        });
      }
      if (scopeType === "programme" || scopeType === "project") {
        chain.push({
          scopeType: "programme",
          scopeId: scopeType === "programme" ? scopeId : "inherited",
          label: "Programme",
        });
      }
      if (scopeType === "project") {
        chain.push({
          scopeType: "project",
          scopeId,
          label: "Project (strictest wins downward)",
        });
      }
      return chain;
    },
  };

  return service;
}
