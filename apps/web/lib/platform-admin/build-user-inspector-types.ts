import type { EffectiveAccessInspection } from "@/lib/iam/effective-access-inspector";
import type { FieldAvailability } from "@/lib/platform-admin/overview-types";
import type { InspectorSessionLine } from "@/lib/iam/better-auth-sessions";

export type InspectorPermissionLine = {
  readonly permissionKey: string;
  readonly allowed: boolean;
  readonly provenance: {
    readonly availability: FieldAvailability;
    readonly message: string;
    readonly decision?: "ALLOWED" | "DENIED";
    readonly grantedBy?: string;
    readonly productKey?: string;
    readonly scopes?: readonly string[];
    readonly matchedRoleIds?: readonly string[];
  };
};

export type GapMapRow = {
  readonly requirement: string;
  readonly existingSource: string;
  readonly reusable: boolean;
  readonly gap: string;
  readonly recommendedExtension: string;
};

export type InspectorProductLine = {
  readonly productKey: string;
  readonly displayName: string;
  readonly status:
    "granted" | "org_subscribed_user_denied" | "org_not_subscribed" | "suggested_only";
  readonly roleLabel: string;
  readonly accessSources: readonly {
    readonly sourceKind: "direct" | "team";
    readonly sourceId: string;
    readonly label: string;
    readonly roleName: string;
  }[];
  readonly why: string;
};

export type InspectorRoleLine = {
  readonly source: "authz_assignment" | "team" | "org_job" | "staff_function_hint";
  readonly id: string;
  readonly label: string;
  readonly why: string;
};

export type InspectorScopeLine = {
  readonly kind: string;
  readonly resourceId: string;
  readonly grantKey: string;
  readonly why: string;
  readonly productKey?: string;
  readonly label?: string;
};

export type PlatformAdminUserInspectorPayload = {
  readonly generatedAt: string;
  readonly tenantId: string;
  readonly tenantName: string;
  readonly user: {
    readonly userId: string;
    readonly email: string;
    readonly displayName: string;
    readonly status: string;
  };
  readonly organisational: {
    readonly department: {
      readonly availability: FieldAvailability;
      readonly value?: string;
      readonly message?: string;
    };
    readonly staffFunction: {
      readonly availability: FieldAvailability;
      readonly value?: string;
      readonly message?: string;
    };
    readonly jobTitle: {
      readonly availability: FieldAvailability;
      readonly value?: string;
      readonly message?: string;
    };
    readonly manager: {
      readonly availability: FieldAvailability;
      readonly value?: string;
      readonly message?: string;
    };
  };
  readonly platformAccess: {
    readonly platformRole: {
      readonly availability: FieldAvailability;
      readonly value?: string;
      readonly message?: string;
    };
  };
  readonly manageAccess: {
    readonly availability: FieldAvailability;
    readonly message: string;
  };
  readonly accessSummary: {
    readonly products: number | null;
    readonly productsAvailability: FieldAvailability;
    readonly professionalTools: number | null;
    readonly professionalToolsAvailability: FieldAvailability;
    readonly teams: {
      readonly availability: FieldAvailability;
      readonly value?: number;
      readonly message?: string;
    };
    readonly privileged: {
      readonly availability: FieldAvailability;
      readonly message: string;
    };
  };
  readonly inspection: EffectiveAccessInspection | null;
  readonly products: readonly InspectorProductLine[];
  readonly roles: readonly InspectorRoleLine[];
  readonly scopes: readonly InspectorScopeLine[];
  readonly professionalTools: readonly {
    readonly toolId: string;
    readonly label: string;
    readonly status: "granted" | "not_granted";
    readonly expiresAt?: string;
    readonly why: string;
  }[];
  readonly teams: readonly { readonly id: string; readonly name: string }[];
  readonly permissions: {
    readonly availability: FieldAvailability;
    readonly message?: string;
    readonly lines: readonly InspectorPermissionLine[];
    readonly provenanceNote: string;
  };
  readonly sessions: {
    readonly availability: FieldAvailability;
    readonly lines: readonly InspectorSessionLine[];
    readonly message?: string;
  };
  readonly timeline: {
    readonly activity: unknown;
    readonly audit: unknown;
    readonly sessions: unknown;
  };
  readonly gaps: readonly GapMapRow[];
};
