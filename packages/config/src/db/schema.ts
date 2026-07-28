import { boolean, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const roles = pgTable("roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 64 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  roleId: uuid("role_id").references(() => roles.id),
  activeTenantId: text("active_tenant_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  roleId: uuid("role_id")
    .notNull()
    .references(() => roles.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const schema = {
  roles,
  user,
  session,
  account,
  verification,
  userRoles,
};

export { legalSchema, lawClient, lawMatter, lawOutboxEvent } from "./legal-schema";
export {
  platformIdentitySchema,
  platformTenant,
  platformUserTenant,
} from "./platform-identity-schema";
export {
  platformAuthorizationSchema,
  platformAuthorizationPermission,
  platformAuthorizationRole,
  platformAuthorizationRoleAssignment,
  platformAuthorizationRolePermission,
} from "./platform-authorization-schema";
export {
  platformPersonalisationSchema,
  platformUserPreference,
  platformUserFavorite,
  platformUserRecentItem,
  platformUserWorkbenchLayout,
} from "./platform-personalisation-schema";
export {
  platformGovernanceSchema,
  platformCapability,
  platformCapabilityDependency,
  platformGovernanceEnablement,
  platformProvisioningRecord,
  platformFeatureFlag,
  platformFeatureFlagOverride,
} from "./platform-governance-schema";
export {
  platformDocumentSchema,
  platformDocument,
  platformDocumentMetadata,
  platformDocumentTag,
  platformDocumentCategory,
  platformDocumentRelationship,
  platformDocumentRetention,
  platformDocumentAudit,
  platformDocumentVersion,
  platformDocumentStorageObject,
} from "./platform-document-schema";
export {
  platformSearchSchema,
  platformSearchProvider,
  platformSearchProviderRegistration,
  platformSearchProviderStatus,
  platformSearchConfiguration,
  platformSearchConfigurationVersion,
  platformSearchProfile,
  platformSearchCollection,
  platformSearchSource,
  platformSearchScope,
  platformSearchMetadata,
  platformSearchSession,
  platformSearchAudit,
  platformSearchDiagnostics,
  platformSearchHealth,
  platformSearchStatistics,
  platformSearchCapabilities,
} from "./platform-search-schema";
export {
  platformWorkflowSchema,
  platformWorkflow,
  platformWorkflowVersion,
  platformWorkflowTemplate,
  platformWorkflowCategory,
  platformWorkflowFolder,
  platformWorkflowAudit,
} from "./platform-workflow-schema";
export {
  platformNotificationSchema,
  platformNotification,
  platformNotificationRecipient,
  platformNotificationTemplate,
  platformNotificationCategory,
  platformNotificationChannel,
  platformNotificationPreference,
  platformNotificationRule,
  platformNotificationReference,
  platformNotificationAttachmentMetadata,
  platformNotificationDeliveryAttempt,
  platformNotificationAudit,
} from "./platform-notification-schema";
export {
  platformNotificationDeliverySchema,
  platformNotificationIntent,
  platformNotificationDeliveryRecord,
  platformNotificationDeliveryTry,
  platformNotificationInAppItem,
} from "./platform-notification-delivery-schema";
export {
  platformConfigurationSchema,
  platformConfigurationNamespace,
  platformConfigurationGroup,
  platformConfigurationKey,
  platformConfiguration,
  platformConfigurationValue,
  platformConfigurationVersion,
  platformConfigurationOverride,
  platformConfigurationValidation,
  platformConfigurationReference,
  platformConfigurationHistory,
  platformConfigurationAudit,
} from "./platform-configuration-schema";
export {
  platformObserveSchema,
  platformObserveHealthCheck,
  platformObserveReadinessCheck,
  platformObserveLivenessCheck,
  platformObserveServiceHealth,
  platformObserveServiceStatus,
  platformObserveComponentStatus,
  platformObserveMetricDefinition,
  platformObserveMetricSample,
  platformObserveAlertDefinition,
  platformObserveAlertState,
  platformObserveDashboard,
  platformObserveLogSource,
  platformObserveTraceDefinition,
  platformObserveTraceSpan,
  platformObserveIncidentReference,
  platformObserveMaintenanceWindow,
  platformObserveHealthSummary,
  platformObserveDiagnostic,
  platformObserveMetadata,
} from "./platform-observe-schema";
export {
  platformMetricsSchema,
  platformMetricsMetric,
  platformMetricsDefinition,
  platformMetricsVersion,
  platformMetricsCategory,
  platformMetricsGroup,
  platformMetricsDimension,
  platformMetricsLabel,
  platformMetricsUnit,
  platformMetricsFormula,
  platformMetricsAggregation,
  platformMetricsThreshold,
  platformMetricsOwner,
  platformMetricsConsumer,
  platformMetricsRetentionPolicy,
  platformMetricsClassification,
  platformMetricsDependency,
  platformMetricsKpi,
  platformMetricsKpiGroup,
  platformMetricsKpiTarget,
  platformMetricsRelationship,
  platformMetricsMetadata,
} from "./platform-metrics-schema";
export {
  qepRequirementsSchema,
  qepRequirement,
  qepRequirementAudit,
  qepRequirementLifecycleHistory,
  qepRequirementContentVersion,
  qepRequirementBaseline,
  qepRequirementBaselineItem,
  qepRequirementsRelationship,
  qepRequirementsRelationshipHistory,
  qepRequirementsRelationshipTaxonomy,
} from "./qep-requirements-schema";
export {
  platformAdminSchema,
  platformAdminModule,
  platformAdminCategory,
  platformAdminSection,
  platformAdminAction,
  platformAdminPermission,
  platformAdminAudit,
  platformAdminHistory,
  platformAdminDiagnostic,
  platformAdminRegistration,
  platformAdminMetadata,
  platformAdminPolicy,
  platformAdminReference,
  platformAdminCapability,
  platformAdminNavigation,
  platformAdminShortcut,
  platformAdminDashboard,
  platformAdminWidget,
} from "./platform-admin-schema";
export {
  platformIamSchema,
  platformIamUser,
  platformIamGroup,
  platformIamRole,
  platformIamPermissionAssignment,
  platformIamOrganization,
  platformIamTenant,
  platformIamDepartment,
  platformIamPosition,
  platformIamEmployment,
  platformIamServiceAssignment,
  platformIamMembership,
  platformIamInvitation,
  platformIamActivation,
  platformIamDeactivation,
  platformIamStatus,
  platformIamPolicy,
  platformIamAudit,
  platformIamHistory,
  platformIamReference,
  platformIamMetadata,
} from "./platform-iam-schema";
