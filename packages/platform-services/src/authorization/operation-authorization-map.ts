import type { PlatformPermissionKey } from "./permission-catalogue";

export type AuthorizationResourceType =
  | "workspace"
  | "project"
  | "task"
  | "team"
  | "user"
  | "search"
  | "support_request"
  | "support_organization"
  | "support_group"
  | "support_user"
  | "support_article"
  | "support_search"
  | "support_analytics"
  | "testing_plan"
  | "testing_suite"
  | "testing_case"
  | "testing_requirement"
  | "testing_execution"
  | "testing_evidence"
  | "testing_automation"
  | "testing_coverage"
  | "testing_defect"
  | "testing_quality"
  | "testing_engineering_intelligence"
  | "testing_certification"
  | "testing_release_readiness"
  | "testing_release_governance"
  | "testing_pipeline"
  | "testing_traceability"
  | "testing_approval"
  | "testing_dashboard"
  | "testing_reporting"
  | "platform_reporting"
  | "platform_product"
  | "platform_dependency"
  | "platform_quality"
  | "platform_release"
  | "platform_governance"
  | "platform_dashboard"
  | "platform_traceability"
  | "document"
  | "document_version"
  | "document_storage"
  | "document_collection"
  | "document_folder"
  | "document_tag"
  | "document_relationship"
  | "document_retention"
  | "document_audit"
  | "document_metadata"
  | "document_classification"
  | "document_search_metadata"
  | "document_diagnostics"
  | "search_query"
  | "search_provider"
  | "search_configuration"
  | "search_capabilities"
  | "search_health"
  | "search_diagnostics"
  | "search_collection"
  | "search_source"
  | "search_scope"
  | "search_profile"
  | "search_metadata"
  | "search_audit"
  | "search_statistics"
  | "search_validation"
  | "search_execution"
  | "search_index"
  | "search_document"
  | "search_execution_health"
  | "search_execution_diagnostics"
  | "administration"
  | "provider"
  | "mapping"
  | "platform";

export type AuthorizationActionName =
  | "list"
  | "read"
  | "create"
  | "update"
  | "archive"
  | "delete"
  | "manage"
  | "administer"
  | "execute"
  | "search"
  | "transition"
  | "assign"
  | "label"
  | "schedule"
  | "organise"
  | "parent";

/**
 * Explicit operation → authorisation mapping.
 * Never derived from reflection or fragile string parsing alone.
 */
export interface OperationAuthorizationMapping {
  readonly service: string;
  readonly operation: string;
  readonly resourceType: AuthorizationResourceType;
  readonly action: AuthorizationActionName;
  readonly requiredPermission: PlatformPermissionKey;
  /**
   * 0-based index into invoke args (after context) for the primary resource ID.
   * Undefined for list/create-without-id style operations.
   */
  readonly resourceIdArgIndex?: number;
  /** When true, resource ID may also be read from a known input object field. */
  readonly resourceIdInputField?: string;
}

const workspaceOps: OperationAuthorizationMapping[] = [
  {
    service: "workspace",
    operation: "listWorkspaces",
    resourceType: "workspace",
    action: "list",
    requiredPermission: "workspace.list",
  },
  {
    service: "workspace",
    operation: "getWorkspace",
    resourceType: "workspace",
    action: "read",
    requiredPermission: "workspace.read",
    resourceIdArgIndex: 0,
  },
];

const projectOps: OperationAuthorizationMapping[] = [
  {
    service: "project",
    operation: "listProjects",
    resourceType: "project",
    action: "list",
    requiredPermission: "project.list",
  },
  {
    service: "project",
    operation: "getProject",
    resourceType: "project",
    action: "read",
    requiredPermission: "project.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "createProject",
    resourceType: "project",
    action: "create",
    requiredPermission: "project.create",
  },
  {
    service: "project",
    operation: "updateProject",
    resourceType: "project",
    action: "update",
    requiredPermission: "project.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "archiveProject",
    resourceType: "project",
    action: "archive",
    requiredPermission: "project.archive",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "listStatuses",
    resourceType: "project",
    action: "read",
    requiredPermission: "project.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "getStatus",
    resourceType: "project",
    action: "read",
    requiredPermission: "project.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "createStatus",
    resourceType: "project",
    action: "update",
    requiredPermission: "project.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "updateStatus",
    resourceType: "project",
    action: "update",
    requiredPermission: "project.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "deleteStatus",
    resourceType: "project",
    action: "update",
    requiredPermission: "project.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "listLabels",
    resourceType: "project",
    action: "read",
    requiredPermission: "project.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "createLabel",
    resourceType: "project",
    action: "update",
    requiredPermission: "project.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "updateLabel",
    resourceType: "project",
    action: "update",
    requiredPermission: "project.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "deleteLabel",
    resourceType: "project",
    action: "update",
    requiredPermission: "project.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "listSprints",
    resourceType: "project",
    action: "read",
    requiredPermission: "project.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "getSprint",
    resourceType: "project",
    action: "read",
    requiredPermission: "project.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "createSprint",
    resourceType: "project",
    action: "update",
    requiredPermission: "project.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "updateSprint",
    resourceType: "project",
    action: "update",
    requiredPermission: "project.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "archiveSprint",
    resourceType: "project",
    action: "archive",
    requiredPermission: "project.archive",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "listModules",
    resourceType: "project",
    action: "read",
    requiredPermission: "project.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "getModule",
    resourceType: "project",
    action: "read",
    requiredPermission: "project.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "createModule",
    resourceType: "project",
    action: "update",
    requiredPermission: "project.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "updateModule",
    resourceType: "project",
    action: "update",
    requiredPermission: "project.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "archiveModule",
    resourceType: "project",
    action: "archive",
    requiredPermission: "project.archive",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "listMilestones",
    resourceType: "project",
    action: "read",
    requiredPermission: "project.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "createMilestone",
    resourceType: "project",
    action: "update",
    requiredPermission: "project.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "updateMilestone",
    resourceType: "project",
    action: "update",
    requiredPermission: "project.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "getRoadmap",
    resourceType: "project",
    action: "read",
    requiredPermission: "project.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "project",
    operation: "listProjectActivity",
    resourceType: "project",
    action: "read",
    requiredPermission: "project.read",
    resourceIdArgIndex: 0,
  },
];

const teamOps: OperationAuthorizationMapping[] = [
  {
    service: "team",
    operation: "listTeam",
    resourceType: "team",
    action: "list",
    requiredPermission: "team.list",
  },
  {
    service: "team",
    operation: "getTeamMember",
    resourceType: "team",
    action: "read",
    requiredPermission: "team.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "team",
    operation: "addTeamMember",
    resourceType: "team",
    action: "update",
    requiredPermission: "team.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "team",
    operation: "updateTeamMember",
    resourceType: "team",
    action: "update",
    requiredPermission: "team.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "team",
    operation: "removeTeamMember",
    resourceType: "team",
    action: "update",
    requiredPermission: "team.update",
    resourceIdArgIndex: 0,
  },
];

const userOps: OperationAuthorizationMapping[] = [
  {
    service: "user",
    operation: "listUsers",
    resourceType: "user",
    action: "list",
    requiredPermission: "user.list",
  },
  {
    service: "user",
    operation: "getUser",
    resourceType: "user",
    action: "read",
    requiredPermission: "user.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "user",
    operation: "getUserByEmail",
    resourceType: "user",
    action: "read",
    requiredPermission: "user.read",
  },
  {
    service: "user",
    operation: "getUserProfile",
    resourceType: "user",
    action: "read",
    requiredPermission: "user.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "user",
    operation: "createUser",
    resourceType: "user",
    action: "create",
    requiredPermission: "user.create",
  },
  {
    service: "user",
    operation: "updateUser",
    resourceType: "user",
    action: "update",
    requiredPermission: "user.update",
    resourceIdArgIndex: 0,
  },
];

const searchOps: OperationAuthorizationMapping[] = [
  {
    service: "search",
    operation: "search",
    resourceType: "search",
    action: "execute",
    requiredPermission: "search.execute",
  },
];

const taskOps: OperationAuthorizationMapping[] = [
  {
    service: "task",
    operation: "listTasks",
    resourceType: "task",
    action: "list",
    requiredPermission: "task.list",
    resourceIdArgIndex: 0,
  },
  {
    service: "task",
    operation: "getTask",
    resourceType: "task",
    action: "read",
    requiredPermission: "task.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "task",
    operation: "createTask",
    resourceType: "task",
    action: "create",
    requiredPermission: "task.create",
    resourceIdArgIndex: 0,
  },
  {
    service: "task",
    operation: "updateTask",
    resourceType: "task",
    action: "update",
    requiredPermission: "task.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "task",
    operation: "archiveTask",
    resourceType: "task",
    action: "archive",
    requiredPermission: "task.archive",
    resourceIdArgIndex: 0,
  },
  {
    service: "task",
    operation: "transitionTaskStatus",
    resourceType: "task",
    action: "transition",
    requiredPermission: "task.transition",
    resourceIdArgIndex: 0,
  },
  {
    service: "task",
    operation: "assignTask",
    resourceType: "task",
    action: "assign",
    requiredPermission: "task.assign",
    resourceIdArgIndex: 0,
  },
  {
    service: "task",
    operation: "getBacklog",
    resourceType: "task",
    action: "list",
    requiredPermission: "task.list",
    resourceIdArgIndex: 0,
  },
  {
    service: "task",
    operation: "reorderBacklog",
    resourceType: "task",
    action: "update",
    requiredPermission: "task.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "task",
    operation: "assignTasksToSprint",
    resourceType: "task",
    action: "schedule",
    requiredPermission: "task.schedule",
    resourceIdArgIndex: 0,
  },
  {
    service: "task",
    operation: "listMyTasks",
    resourceType: "task",
    action: "list",
    requiredPermission: "task.list",
  },
  {
    service: "task",
    operation: "listComments",
    resourceType: "task",
    action: "read",
    requiredPermission: "task.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "task",
    operation: "addComment",
    resourceType: "task",
    action: "update",
    requiredPermission: "task.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "task",
    operation: "listAttachments",
    resourceType: "task",
    action: "read",
    requiredPermission: "task.read",
    resourceIdArgIndex: 0,
  },
];

const supportOps: OperationAuthorizationMapping[] = [
  {
    service: "support",
    operation: "listSupportRequests",
    resourceType: "support_request",
    action: "list",
    requiredPermission: "support.requests.list",
  },
  {
    service: "support",
    operation: "getSupportRequest",
    resourceType: "support_request",
    action: "read",
    requiredPermission: "support.requests.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "support",
    operation: "createSupportRequest",
    resourceType: "support_request",
    action: "create",
    requiredPermission: "support.requests.create",
  },
  {
    service: "support",
    operation: "updateSupportRequest",
    resourceType: "support_request",
    action: "update",
    requiredPermission: "support.requests.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "support",
    operation: "closeSupportRequest",
    resourceType: "support_request",
    action: "transition",
    requiredPermission: "support.requests.transition",
    resourceIdArgIndex: 0,
  },
  {
    service: "support",
    operation: "reopenSupportRequest",
    resourceType: "support_request",
    action: "transition",
    requiredPermission: "support.requests.transition",
    resourceIdArgIndex: 0,
  },
  {
    service: "support",
    operation: "assignSupportRequest",
    resourceType: "support_request",
    action: "assign",
    requiredPermission: "support.requests.assign",
    resourceIdArgIndex: 0,
  },
  {
    service: "support",
    operation: "changeSupportRequestPriority",
    resourceType: "support_request",
    action: "update",
    requiredPermission: "support.requests.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "support",
    operation: "changeSupportRequestState",
    resourceType: "support_request",
    action: "transition",
    requiredPermission: "support.requests.transition",
    resourceIdArgIndex: 0,
  },
  {
    service: "support",
    operation: "searchSupportRequests",
    resourceType: "support_request",
    action: "list",
    requiredPermission: "support.requests.list",
  },
];

const supportOrganizationOps: OperationAuthorizationMapping[] = [
  {
    service: "supportOrganization",
    operation: "listOrganizations",
    resourceType: "support_organization",
    action: "list",
    requiredPermission: "support.organizations.list",
  },
  {
    service: "supportOrganization",
    operation: "getOrganization",
    resourceType: "support_organization",
    action: "read",
    requiredPermission: "support.organizations.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "supportOrganization",
    operation: "createOrganization",
    resourceType: "support_organization",
    action: "create",
    requiredPermission: "support.organizations.create",
  },
  {
    service: "supportOrganization",
    operation: "updateOrganization",
    resourceType: "support_organization",
    action: "update",
    requiredPermission: "support.organizations.update",
    resourceIdArgIndex: 0,
  },
  {
    service: "supportOrganization",
    operation: "archiveOrganization",
    resourceType: "support_organization",
    action: "archive",
    requiredPermission: "support.organizations.archive",
    resourceIdArgIndex: 0,
  },
];

const supportGroupOps: OperationAuthorizationMapping[] = [
  {
    service: "supportGroup",
    operation: "listGroups",
    resourceType: "support_group",
    action: "list",
    requiredPermission: "support.groups.list",
  },
  {
    service: "supportGroup",
    operation: "getGroup",
    resourceType: "support_group",
    action: "read",
    requiredPermission: "support.groups.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "supportGroup",
    operation: "createGroup",
    resourceType: "support_group",
    action: "create",
    requiredPermission: "support.groups.create",
  },
  {
    service: "supportGroup",
    operation: "updateGroup",
    resourceType: "support_group",
    action: "update",
    requiredPermission: "support.groups.update",
    resourceIdArgIndex: 0,
  },
];

const supportUserOps: OperationAuthorizationMapping[] = [
  {
    service: "supportUser",
    operation: "listUsers",
    resourceType: "support_user",
    action: "list",
    requiredPermission: "support.users.list",
  },
  {
    service: "supportUser",
    operation: "getUser",
    resourceType: "support_user",
    action: "read",
    requiredPermission: "support.users.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "supportUser",
    operation: "lookup",
    resourceType: "support_user",
    action: "read",
    requiredPermission: "support.users.read",
  },
  {
    service: "supportUser",
    operation: "search",
    resourceType: "support_user",
    action: "list",
    requiredPermission: "support.users.list",
  },
];

const supportArticleOps: OperationAuthorizationMapping[] = [
  {
    service: "supportArticle",
    operation: "list",
    resourceType: "support_article",
    action: "list",
    requiredPermission: "support.articles.list",
    resourceIdArgIndex: 0,
  },
  {
    service: "supportArticle",
    operation: "get",
    resourceType: "support_article",
    action: "read",
    requiredPermission: "support.articles.read",
    resourceIdArgIndex: 1,
  },
  {
    service: "supportArticle",
    operation: "createNote",
    resourceType: "support_article",
    action: "create",
    requiredPermission: "support.articles.create",
  },
  {
    service: "supportArticle",
    operation: "createReply",
    resourceType: "support_article",
    action: "create",
    requiredPermission: "support.articles.create",
  },
  {
    service: "supportArticle",
    operation: "create",
    resourceType: "support_article",
    action: "create",
    requiredPermission: "support.articles.create",
  },
];

const supportSearchOps: OperationAuthorizationMapping[] = [
  {
    service: "supportSearch",
    operation: "search",
    resourceType: "support_search",
    action: "execute",
    requiredPermission: "support.search.execute",
  },
];

const supportHistoryOps: OperationAuthorizationMapping[] = [
  {
    service: "supportHistory",
    operation: "getTimeline",
    resourceType: "support_request",
    action: "read",
    requiredPermission: "support.requests.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "supportHistory",
    operation: "list",
    resourceType: "support_request",
    action: "read",
    requiredPermission: "support.requests.read",
    resourceIdArgIndex: 0,
  },
  {
    service: "supportHistory",
    operation: "getSupportTimeline",
    resourceType: "support_request",
    action: "read",
    requiredPermission: "support.requests.read",
    resourceIdArgIndex: 0,
  },
];

const supportAnalyticsOps: OperationAuthorizationMapping[] = [
  {
    service: "supportAnalytics",
    operation: "getSupportIntelligence",
    resourceType: "support_analytics",
    action: "read",
    requiredPermission: "support.analytics.read",
  },
  {
    service: "supportAnalytics",
    operation: "getSnapshot",
    resourceType: "support_analytics",
    action: "read",
    requiredPermission: "support.analytics.read",
  },
];

function testingOp(
  service: string,
  operation: string,
  resourceType: AuthorizationResourceType,
  action: AuthorizationActionName,
  requiredPermission: PlatformPermissionKey,
  resourceIdArgIndex?: number,
): OperationAuthorizationMapping {
  return {
    service,
    operation,
    resourceType,
    action,
    requiredPermission,
    resourceIdArgIndex,
  };
}

const testingPlanOps: OperationAuthorizationMapping[] = [
  testingOp("testingPlan", "list", "testing_plan", "list", "testing.plans.list"),
  testingOp("testingPlan", "get", "testing_plan", "read", "testing.plans.read", 0),
  testingOp("testingPlan", "create", "testing_plan", "create", "testing.plans.create"),
  testingOp("testingPlan", "update", "testing_plan", "update", "testing.plans.update", 0),
  testingOp("testingPlan", "clone", "testing_plan", "create", "testing.plans.create", 0),
  testingOp("testingPlan", "archive", "testing_plan", "archive", "testing.plans.update", 0),
];

const testingSuiteOps: OperationAuthorizationMapping[] = [
  testingOp("testingSuite", "list", "testing_suite", "list", "testing.suites.list"),
  testingOp("testingSuite", "get", "testing_suite", "read", "testing.suites.read", 0),
  testingOp("testingSuite", "create", "testing_suite", "create", "testing.suites.create"),
  testingOp("testingSuite", "update", "testing_suite", "update", "testing.suites.update", 0),
  testingOp("testingSuite", "clone", "testing_suite", "create", "testing.suites.create", 0),
  testingOp("testingSuite", "archive", "testing_suite", "archive", "testing.suites.update", 0),
];

const testingCaseOps: OperationAuthorizationMapping[] = [
  testingOp("testingCase", "list", "testing_case", "list", "testing.cases.list"),
  testingOp("testingCase", "get", "testing_case", "read", "testing.cases.read", 0),
  testingOp("testingCase", "create", "testing_case", "create", "testing.cases.create"),
  testingOp("testingCase", "update", "testing_case", "update", "testing.cases.update", 0),
  testingOp("testingCase", "clone", "testing_case", "create", "testing.cases.create", 0),
  testingOp("testingCase", "archive", "testing_case", "archive", "testing.cases.update", 0),
  testingOp("testingCase", "transitionStatus", "testing_case", "transition", "testing.cases.update", 0),
];

const testingRequirementOps: OperationAuthorizationMapping[] = [
  testingOp("testingRequirement", "list", "testing_requirement", "list", "testing.requirements.list"),
  testingOp("testingRequirement", "get", "testing_requirement", "read", "testing.requirements.read", 0),
  testingOp("testingRequirement", "create", "testing_requirement", "create", "testing.requirements.create"),
  testingOp("testingRequirement", "update", "testing_requirement", "update", "testing.requirements.update", 0),
  testingOp("testingRequirement", "archive", "testing_requirement", "archive", "testing.requirements.update", 0),
];

const testingExecutionOps: OperationAuthorizationMapping[] = [
  testingOp("testingExecution", "list", "testing_execution", "list", "testing.executions.list"),
  testingOp("testingExecution", "get", "testing_execution", "read", "testing.executions.read", 0),
  testingOp("testingExecution", "create", "testing_execution", "create", "testing.executions.create"),
  testingOp("testingExecution", "assign", "testing_execution", "assign", "testing.executions.execute", 0),
  testingOp("testingExecution", "start", "testing_execution", "execute", "testing.executions.execute", 0),
  testingOp("testingExecution", "pause", "testing_execution", "execute", "testing.executions.execute", 0),
  testingOp("testingExecution", "resume", "testing_execution", "execute", "testing.executions.execute", 0),
  testingOp("testingExecution", "block", "testing_execution", "transition", "testing.executions.execute", 0),
  testingOp("testingExecution", "unblock", "testing_execution", "transition", "testing.executions.execute", 0),
  testingOp("testingExecution", "complete", "testing_execution", "transition", "testing.executions.execute", 0),
  testingOp("testingExecution", "submitForReview", "testing_execution", "transition", "testing.executions.execute", 0),
  testingOp("testingExecution", "approve", "testing_execution", "transition", "approval.decide", 0),
  testingOp("testingExecution", "reject", "testing_execution", "transition", "approval.decide", 0),
  testingOp("testingExecution", "reopen", "testing_execution", "transition", "testing.executions.execute", 0),
  testingOp("testingExecution", "cancel", "testing_execution", "transition", "testing.executions.execute", 0),
  testingOp("testingExecution", "archive", "testing_execution", "archive", "testing.executions.execute", 0),
  testingOp("testingExecution", "restore", "testing_execution", "update", "testing.executions.execute", 0),
  testingOp("testingExecution", "recordStepActual", "testing_execution", "execute", "testing.executions.execute", 0),
  testingOp("testingExecution", "setStepStatus", "testing_execution", "execute", "testing.executions.execute", 0),
];

const testingEvidenceOps: OperationAuthorizationMapping[] = [
  testingOp("testingEvidence", "listEvidence", "testing_evidence", "list", "evidence.list"),
  testingOp("testingEvidence", "getEvidence", "testing_evidence", "read", "evidence.read", 0),
  testingOp("testingEvidence", "registerEvidence", "testing_evidence", "create", "evidence.register"),
  testingOp("testingEvidence", "submitEvidence", "testing_evidence", "transition", "evidence.register", 0),
  testingOp("testingEvidence", "verifyEvidence", "testing_evidence", "transition", "evidence.admin", 0),
  testingOp("testingEvidence", "approveEvidence", "testing_evidence", "transition", "approval.decide", 0),
  testingOp("testingEvidence", "rejectEvidence", "testing_evidence", "transition", "approval.decide", 0),
  testingOp("testingEvidence", "archiveEvidence", "testing_evidence", "archive", "evidence.admin", 0),
];

const testingAutomationOps: OperationAuthorizationMapping[] = [
  testingOp("testingAutomation", "validateImport", "testing_automation", "execute", "automation.import"),
  testingOp("testingAutomation", "importResult", "testing_automation", "create", "automation.import"),
  testingOp("testingAutomation", "listImports", "testing_automation", "list", "automation.view"),
  testingOp("testingAutomation", "getImport", "testing_automation", "read", "automation.view", 0),
  testingOp("testingAutomation", "listImportHistory", "testing_automation", "read", "automation.history", 0),
  testingOp("testingAutomation", "getHistory", "testing_automation", "read", "automation.history"),
  testingOp("testingAutomation", "listRuns", "testing_automation", "list", "automation.view", 0),
  testingOp("testingAutomation", "getRun", "testing_automation", "read", "automation.view", 0),
  testingOp("testingAutomation", "listResultItems", "testing_automation", "read", "automation.view", 0),
  testingOp("testingAutomation", "listCoverageSnapshots", "testing_automation", "read", "automation.coverage", 0),
  testingOp("testingAutomation", "aggregateCoverage", "testing_automation", "read", "automation.coverage", 0),
];

const testingCoverageOps: OperationAuthorizationMapping[] = [
  testingOp("testingCoverage", "recompute", "testing_coverage", "execute", "coverage.compute"),
  testingOp("testingCoverage", "recomputeAll", "testing_coverage", "execute", "coverage.compute"),
  testingOp("testingCoverage", "requestRecompute", "testing_coverage", "execute", "coverage.compute", 0),
  testingOp("testingCoverage", "listMetrics", "testing_coverage", "list", "coverage.view"),
  testingOp("testingCoverage", "getMetric", "testing_coverage", "read", "coverage.view", 0),
  testingOp("testingCoverage", "listMetricsByKind", "testing_coverage", "list", "coverage.view"),
  testingOp("testingCoverage", "listMetricsForPlan", "testing_coverage", "list", "coverage.view", 0),
  testingOp("testingCoverage", "listMetricsForSubject", "testing_coverage", "list", "coverage.view", 0),
];

const testingDefectOps: OperationAuthorizationMapping[] = [
  testingOp("testingDefect", "list", "testing_defect", "list", "defects.view"),
  testingOp("testingDefect", "get", "testing_defect", "read", "defects.view", 0),
  testingOp("testingDefect", "create", "testing_defect", "create", "defects.link"),
  testingOp("testingDefect", "link", "testing_defect", "update", "defects.link", 0),
  testingOp("testingDefect", "update", "testing_defect", "update", "defects.update", 0),
  testingOp("testingDefect", "archive", "testing_defect", "archive", "defects.update", 0),
];

const testingQualityOps: OperationAuthorizationMapping[] = [
  testingOp("testingQuality", "summarize", "testing_quality", "read", "quality.view"),
  testingOp("testingQuality", "getSnapshot", "testing_quality", "read", "quality.view", 0),
  testingOp("testingQuality", "listSnapshots", "testing_quality", "list", "quality.view"),
  testingOp("testingQuality", "computeSnapshot", "testing_quality", "execute", "quality.compute"),
  testingOp("testingQuality", "compareSnapshots", "testing_quality", "read", "quality.view", 0),
  testingOp("testingQuality", "compareWindows", "testing_quality", "read", "quality.view"),
];

const testingEngineeringIntelligenceOps: OperationAuthorizationMapping[] = [
  testingOp("testingEngineeringIntelligence", "score", "testing_engineering_intelligence", "execute", "quality.score"),
  testingOp("testingEngineeringIntelligence", "assessHealth", "testing_engineering_intelligence", "execute", "engineering.health"),
  testingOp("testingEngineeringIntelligence", "computeSnapshot", "testing_engineering_intelligence", "execute", "engineering.compute"),
  testingOp("testingEngineeringIntelligence", "getSnapshot", "testing_engineering_intelligence", "read", "engineering.view", 0),
  testingOp("testingEngineeringIntelligence", "listSnapshots", "testing_engineering_intelligence", "list", "engineering.view"),
  testingOp("testingEngineeringIntelligence", "buildTrend", "testing_engineering_intelligence", "execute", "trend.compute"),
  testingOp("testingEngineeringIntelligence", "listTrends", "testing_engineering_intelligence", "list", "trend.view"),
  testingOp("testingEngineeringIntelligence", "compareBenchmark", "testing_engineering_intelligence", "execute", "benchmark.compute"),
  testingOp("testingEngineeringIntelligence", "listBenchmarks", "testing_engineering_intelligence", "list", "benchmark.view"),
  testingOp("testingEngineeringIntelligence", "recordBaseline", "testing_engineering_intelligence", "create", "benchmark.compute"),
  testingOp("testingEngineeringIntelligence", "listBaselines", "testing_engineering_intelligence", "list", "benchmark.view"),
  testingOp("testingEngineeringIntelligence", "captureHistorical", "testing_engineering_intelligence", "create", "analytics.compute"),
  testingOp("testingEngineeringIntelligence", "listHistorical", "testing_engineering_intelligence", "list", "analytics.view"),
];

const testingCertificationOps: OperationAuthorizationMapping[] = [
  testingOp("testingCertification", "create", "testing_certification", "create", "certification.records.create"),
  testingOp("testingCertification", "get", "testing_certification", "read", "certification.records.read", 0),
  testingOp("testingCertification", "list", "testing_certification", "list", "certification.records.list"),
  testingOp("testingCertification", "prepareForPlan", "testing_certification", "read", "certification.view", 0),
  testingOp("testingCertification", "prepareForCertification", "testing_certification", "read", "certification.view", 0),
  testingOp("testingCertification", "startReview", "testing_certification", "transition", "certification.review", 0),
  testingOp("testingCertification", "requestChanges", "testing_certification", "transition", "certification.review", 0),
  testingOp("testingCertification", "submitForApproval", "testing_certification", "transition", "certification.review", 0),
  testingOp("testingCertification", "approve", "testing_certification", "transition", "certification.approve", 0),
  testingOp("testingCertification", "conditionallyApprove", "testing_certification", "transition", "certification.approve", 0),
  testingOp("testingCertification", "reject", "testing_certification", "transition", "certification.reject", 0),
  testingOp("testingCertification", "expire", "testing_certification", "transition", "certification.records.transition", 0),
  testingOp("testingCertification", "archive", "testing_certification", "archive", "certification.admin", 0),
  testingOp("testingCertification", "evaluateGate", "testing_certification", "execute", "certification.gates.evaluate", 0),
  testingOp("testingCertification", "evaluateGates", "testing_certification", "execute", "certification.gates.evaluate", 0),
  testingOp("testingCertification", "getRecommendation", "testing_certification", "read", "certification.view", 0),
  testingOp("testingCertification", "getAuditHistory", "testing_certification", "read", "certification.audit", 0),
  testingOp("testingCertification", "listAudit", "testing_certification", "read", "certification.audit", 0),
];

const testingReleaseReadinessOps: OperationAuthorizationMapping[] = [
  testingOp("testingReleaseReadiness", "calculateForPlan", "testing_release_readiness", "execute", "release.compute", 0),
  testingOp("testingReleaseReadiness", "calculateForCertification", "testing_release_readiness", "execute", "release.compute", 0),
  testingOp("testingReleaseReadiness", "assessForPlan", "testing_release_readiness", "execute", "release.compute", 0),
  testingOp("testingReleaseReadiness", "assessForCertification", "testing_release_readiness", "execute", "release.compute", 0),
];

const testingReleaseGovernanceOps: OperationAuthorizationMapping[] = [
  testingOp("testingReleaseGovernance", "createRelease", "testing_release_governance", "create", "release.create"),
  testingOp("testingReleaseGovernance", "getRelease", "testing_release_governance", "read", "release.view", 0),
  testingOp("testingReleaseGovernance", "listReleases", "testing_release_governance", "list", "release.view"),
  testingOp("testingReleaseGovernance", "updateReleaseMetadata", "testing_release_governance", "update", "release.update", 0),
  testingOp("testingReleaseGovernance", "addScope", "testing_release_governance", "update", "release.update", 0),
  testingOp("testingReleaseGovernance", "removeScope", "testing_release_governance", "update", "release.update", 0),
  testingOp("testingReleaseGovernance", "attachEvidence", "testing_release_governance", "update", "release.update", 0),
  testingOp("testingReleaseGovernance", "removeEvidence", "testing_release_governance", "update", "release.update", 0),
  testingOp("testingReleaseGovernance", "addPackage", "testing_release_governance", "update", "release.update", 0),
  testingOp("testingReleaseGovernance", "addCandidate", "testing_release_governance", "update", "release.update", 0),
  testingOp("testingReleaseGovernance", "addNote", "testing_release_governance", "update", "release.update", 0),
  testingOp("testingReleaseGovernance", "addDependency", "testing_release_governance", "update", "release.update", 0),
  testingOp("testingReleaseGovernance", "removeDependency", "testing_release_governance", "update", "release.update", 0),
  testingOp("testingReleaseGovernance", "evaluateReadiness", "testing_release_governance", "execute", "release.readiness.evaluate", 0),
  testingOp("testingReleaseGovernance", "evaluateRisk", "testing_release_governance", "execute", "release.risk.evaluate", 0),
  testingOp("testingReleaseGovernance", "evaluateCertification", "testing_release_governance", "execute", "release.readiness.evaluate", 0),
  testingOp("testingReleaseGovernance", "evaluateApprovals", "testing_release_governance", "execute", "release.approvals.view", 0),
  testingOp("testingReleaseGovernance", "generateReleaseSummary", "testing_release_governance", "execute", "release.readiness.evaluate", 0),
  testingOp("testingReleaseGovernance", "submitForReview", "testing_release_governance", "transition", "release.submit", 0),
  testingOp("testingReleaseGovernance", "submitForApproval", "testing_release_governance", "transition", "release.submit", 0),
  testingOp("testingReleaseGovernance", "approveRelease", "testing_release_governance", "transition", "release.approve", 0),
  testingOp("testingReleaseGovernance", "conditionallyApproveRelease", "testing_release_governance", "transition", "release.approve", 0),
  testingOp("testingReleaseGovernance", "rejectRelease", "testing_release_governance", "transition", "release.reject", 0),
  testingOp("testingReleaseGovernance", "withdrawRelease", "testing_release_governance", "transition", "release.withdraw", 0),
  testingOp("testingReleaseGovernance", "archiveRelease", "testing_release_governance", "archive", "release.archive", 0),
  testingOp("testingReleaseGovernance", "restoreRelease", "testing_release_governance", "update", "release.restore", 0),
  testingOp("testingReleaseGovernance", "requestApproval", "testing_release_governance", "create", "release.approvals.request", 0),
  testingOp("testingReleaseGovernance", "decideApproval", "testing_release_governance", "transition", "release.approvals.decide", 0),
  testingOp("testingReleaseGovernance", "listAudit", "testing_release_governance", "list", "release.audit.view", 0),
  testingOp("testingReleaseGovernance", "getManifest", "testing_release_governance", "read", "release.view", 0),
  testingOp("testingReleaseGovernance", "listPackages", "testing_release_governance", "list", "release.view", 0),
  testingOp("testingReleaseGovernance", "listCandidates", "testing_release_governance", "list", "release.view", 0),
  testingOp("testingReleaseGovernance", "listScope", "testing_release_governance", "list", "release.view", 0),
  testingOp("testingReleaseGovernance", "listEvidence", "testing_release_governance", "list", "release.view", 0),
  testingOp("testingReleaseGovernance", "listNotes", "testing_release_governance", "list", "release.view", 0),
  testingOp("testingReleaseGovernance", "listDependencies", "testing_release_governance", "list", "release.view", 0),
  testingOp("testingReleaseGovernance", "listApprovals", "testing_release_governance", "list", "release.approvals.view", 0),
  testingOp("testingReleaseGovernance", "consumePipelineSummary", "testing_release_governance", "update", "release.update", 0),
];

const testingPipelinesOps: OperationAuthorizationMapping[] = [
  testingOp("testingPipelines", "registerPipeline", "testing_pipeline", "create", "pipeline.import"),
  testingOp("testingPipelines", "updatePipeline", "testing_pipeline", "update", "pipeline.import", 0),
  testingOp("testingPipelines", "archivePipeline", "testing_pipeline", "archive", "pipeline.archive", 0),
  testingOp("testingPipelines", "getPipeline", "testing_pipeline", "read", "pipeline.read", 0),
  testingOp("testingPipelines", "listPipelines", "testing_pipeline", "list", "pipeline.read"),
  testingOp("testingPipelines", "importRun", "testing_pipeline", "create", "pipeline.import"),
  testingOp("testingPipelines", "importFromProvider", "testing_pipeline", "create", "pipeline.import"),
  testingOp("testingPipelines", "listImports", "testing_pipeline", "list", "pipeline.read"),
  testingOp("testingPipelines", "getImport", "testing_pipeline", "read", "pipeline.read", 0),
  testingOp("testingPipelines", "listImportHistory", "testing_pipeline", "list", "pipeline.audit", 0),
  testingOp("testingPipelines", "getRun", "testing_pipeline", "read", "pipeline.read", 0),
  testingOp("testingPipelines", "listRuns", "testing_pipeline", "list", "pipeline.read"),
  testingOp("testingPipelines", "listStages", "testing_pipeline", "read", "pipeline.read", 0),
  testingOp("testingPipelines", "listJobs", "testing_pipeline", "read", "pipeline.read", 0),
  testingOp("testingPipelines", "linkArtifacts", "testing_pipeline", "update", "pipeline.link", 0),
  testingOp("testingPipelines", "linkEvidence", "testing_pipeline", "update", "pipeline.link", 0),
  testingOp("testingPipelines", "linkCertifications", "testing_pipeline", "update", "pipeline.link", 0),
  testingOp("testingPipelines", "linkReleases", "testing_pipeline", "update", "pipeline.link", 0),
  testingOp("testingPipelines", "getLinks", "testing_pipeline", "read", "pipeline.read", 0),
  testingOp("testingPipelines", "listProviders", "testing_pipeline", "list", "pipeline.providers"),
];

const testingPipelineLiveOps: OperationAuthorizationMapping[] = [
  testingOp("testingPipelineRepositories", "getRepository", "testing_pipeline", "read", "pipeline.read", 0),
  testingOp("testingPipelineWorkflows", "listWorkflows", "testing_pipeline", "list", "pipeline.read"),
  testingOp("testingPipelineWorkflows", "getWorkflow", "testing_pipeline", "read", "pipeline.read", 0),
  testingOp("testingPipelineRuns", "listRuns", "testing_pipeline", "list", "pipeline.read"),
  testingOp("testingPipelineRuns", "getRun", "testing_pipeline", "read", "pipeline.read", 0),
  testingOp("testingPipelineArtifacts", "listArtifacts", "testing_pipeline", "list", "pipeline.read", 0),
  testingOp("testingPipelineJobs", "listJobs", "testing_pipeline", "list", "pipeline.read", 0),
  testingOp("testingPipelineJobs", "getJob", "testing_pipeline", "read", "pipeline.read", 0),
  testingOp("testingPipelineSteps", "listSteps", "testing_pipeline", "list", "pipeline.read", 0),
  testingOp("testingPipelineSummaries", "retrieveSummary", "testing_pipeline", "read", "pipeline.read", 0),
];

const testingTraceabilityOps: OperationAuthorizationMapping[] = [
  testingOp("testingTraceability", "listLinks", "testing_traceability", "list", "traceability.list"),
  testingOp("testingTraceability", "getLink", "testing_traceability", "read", "traceability.read", 0),
  testingOp("testingTraceability", "createLink", "testing_traceability", "create", "traceability.link"),
  testingOp("testingTraceability", "removeLink", "testing_traceability", "delete", "traceability.link", 0),
  testingOp("testingTraceability", "createRelationship", "testing_traceability", "create", "traceability.link"),
  testingOp("testingTraceability", "removeRelationship", "testing_traceability", "delete", "traceability.link", 0),
  testingOp("testingTraceability", "getMatrixForRequirement", "testing_traceability", "read", "traceability.read", 0),
  testingOp("testingTraceability", "listMatrix", "testing_traceability", "list", "traceability.list"),
];

const testingApprovalOps: OperationAuthorizationMapping[] = [
  testingOp("testingApproval", "list", "testing_approval", "list", "approval.list"),
  testingOp("testingApproval", "get", "testing_approval", "read", "approval.read", 0),
  testingOp("testingApproval", "request", "testing_approval", "create", "approval.request"),
  testingOp("testingApproval", "submitForReview", "testing_approval", "transition", "approval.request"),
  testingOp("testingApproval", "decide", "testing_approval", "transition", "approval.decide", 0),
  testingOp("testingApproval", "listHistory", "testing_approval", "read", "approval.read", 0),
];

const testingDashboardOps: OperationAuthorizationMapping[] = [
  testingOp("testingDashboard", "getDashboardSummary", "testing_dashboard", "read", "dashboard.view"),
];

const testingReportingOps: OperationAuthorizationMapping[] = [
  testingOp("testingReporting", "listReportPlaceholders", "testing_reporting", "list", "reporting.view"),
  testingOp("testingReporting", "listAvailableReports", "testing_reporting", "list", "report.view"),
  testingOp("testingReporting", "listTemplates", "testing_reporting", "list", "report.templates"),
  testingOp("testingReporting", "getTemplate", "testing_reporting", "read", "report.templates", 0),
  testingOp("testingReporting", "registerTemplate", "testing_reporting", "create", "report.templates"),
  testingOp("testingReporting", "validateReport", "testing_reporting", "execute", "report.preview"),
  testingOp("testingReporting", "previewReport", "testing_reporting", "execute", "report.preview"),
  testingOp("testingReporting", "generateReport", "testing_reporting", "execute", "report.generate"),
  testingOp("testingReporting", "renderReport", "testing_reporting", "execute", "report.generate"),
  testingOp("testingReporting", "archiveReportMetadata", "testing_reporting", "archive", "report.audit", 0),
  testingOp("testingReporting", "listReportMetadata", "testing_reporting", "list", "report.audit"),
  testingOp("testingReporting", "getReportMetadata", "testing_reporting", "read", "report.audit", 0),
];

/** Platform-neutral reporting facet (APZREPORT-002) — same report.* permissions. */
const platformReportingOps: OperationAuthorizationMapping[] = [
  testingOp("platformReporting", "listAvailableReports", "platform_reporting", "list", "report.view"),
  testingOp("platformReporting", "listTemplates", "platform_reporting", "list", "report.templates"),
  testingOp("platformReporting", "getTemplate", "platform_reporting", "read", "report.templates", 0),
  testingOp("platformReporting", "registerTemplate", "platform_reporting", "create", "report.templates"),
  testingOp("platformReporting", "validateReport", "platform_reporting", "execute", "report.preview"),
  testingOp("platformReporting", "previewReport", "platform_reporting", "execute", "report.preview"),
  testingOp("platformReporting", "generateReport", "platform_reporting", "execute", "report.generate"),
  testingOp("platformReporting", "renderReport", "platform_reporting", "execute", "report.generate"),
  testingOp("platformReporting", "archiveReportMetadata", "platform_reporting", "archive", "report.audit", 0),
  testingOp("platformReporting", "listReportMetadata", "platform_reporting", "list", "report.audit"),
  testingOp("platformReporting", "getReportMetadata", "platform_reporting", "read", "report.audit", 0),
];

const documentPlatformOps: OperationAuthorizationMapping[] = [
  testingOp("documentService", "create", "document", "create", "document.create"),
  testingOp("documentService", "get", "document", "read", "document.read", 0),
  testingOp("documentService", "summarize", "document", "read", "document.read", 0),
  testingOp("documentService", "archive", "document", "archive", "document.archive", 0),
  testingOp("documentService", "restore", "document", "update", "document.restore", 0),
  testingOp("documentVersion", "list", "document_version", "list", "document.version.read", 0),
  testingOp("documentVersion", "get", "document_version", "read", "document.version.read", 0),
  testingOp("documentStorage", "getStorageMetadata", "document_storage", "read", "document.storage.read", 0),
  testingOp("documentStorage", "verifyIntegrity", "document_storage", "execute", "document.storage.verify", 0),
  testingOp("documentStorage", "inspectReconciliation", "document_storage", "read", "document.reconciliation.read"),
  testingOp("documentCollection", "assign", "document_collection", "assign", "document.collection.write"),
  testingOp("documentFolder", "assign", "document_folder", "assign", "document.folder.write"),
  testingOp("documentTag", "tag", "document_tag", "update", "document.tag.write"),
  testingOp("documentTag", "list", "document_tag", "list", "document.tag.read"),
  testingOp("documentTag", "get", "document_tag", "read", "document.tag.read", 0),
  testingOp("documentRelationship", "relate", "document_relationship", "create", "document.relationship.write"),
  testingOp("documentRetention", "apply", "document_retention", "update", "document.retention"),
  testingOp("documentAudit", "list", "document_audit", "list", "document.audit", 0),
  testingOp("documentMetadata", "update", "document_metadata", "update", "document.metadata.write"),
  testingOp("documentClassification", "classify", "document_classification", "update", "document.classify"),
  testingOp("documentSearchMetadata", "find", "document_search_metadata", "list", "document.read"),
  testingOp("documentDiagnostics", "getDiagnostics", "document_diagnostics", "read", "document.read"),
];

/** APZSEARCH-003 — management plane only; no query execution mapped. */
const searchPlatformOps: OperationAuthorizationMapping[] = [
  testingOp("searchQuery", "validateQuery", "search_query", "execute", "search.validation.execute"),
  testingOp("searchProviders", "listProviders", "search_provider", "list", "search.provider.list"),
  testingOp("searchProviders", "getProvider", "search_provider", "read", "search.provider.read", 0),
  testingOp("searchProviders", "registerProvider", "search_provider", "create", "search.provider.register"),
  testingOp("searchProviders", "updateProvider", "search_provider", "update", "search.provider.update", 0),
  testingOp("searchProviders", "enableProvider", "search_provider", "update", "search.provider.enable", 0),
  testingOp("searchProviders", "disableProvider", "search_provider", "update", "search.provider.disable", 0),
  testingOp("searchProviders", "setActiveProvider", "search_provider", "update", "search.provider.activate", 0),
  testingOp("searchProviders", "clearActiveProvider", "search_provider", "update", "search.provider.activate"),
  testingOp("searchProviders", "unregisterProvider", "search_provider", "delete", "search.provider.unregister", 0),
  testingOp("searchProviders", "getCapabilities", "search_provider", "read", "search.provider.read"),
  testingOp("searchProviders", "getProviderStatus", "search_provider", "read", "search.provider.health", 0),
  testingOp("searchProviders", "validateProviderConfiguration", "search_provider", "execute", "search.provider.read"),
  testingOp("searchProviders", "getActiveProvider", "search_provider", "read", "search.provider.read"),
  testingOp("searchProviders", "initialiseProvider", "search_provider", "update", "search.provider.update", 0),
  testingOp("searchProviders", "validateProviderLifecycleConfiguration", "search_provider", "execute", "search.provider.read", 0),
  testingOp("searchProviders", "getProviderHealth", "search_provider", "read", "search.provider.health", 0),
  testingOp("searchProviders", "getProviderLifecycleCapabilities", "search_provider", "read", "search.provider.read", 0),
  testingOp("searchProviders", "getProviderDiagnostics", "search_provider", "read", "search.provider.diagnostics", 0),
  testingOp("searchProviders", "disposeProvider", "search_provider", "delete", "search.provider.unregister", 0),
  testingOp("searchConfigurations", "create", "search_configuration", "create", "search.configuration.create"),
  testingOp("searchConfigurations", "get", "search_configuration", "read", "search.configuration.read"),
  testingOp("searchConfigurations", "list", "search_configuration", "list", "search.configuration.list"),
  testingOp("searchConfigurations", "update", "search_configuration", "update", "search.configuration.update", 0),
  testingOp("searchConfigurations", "version", "search_configuration", "update", "search.configuration.version", 0),
  testingOp("searchConfigurations", "activate", "search_configuration", "update", "search.configuration.activate", 0),
  testingOp("searchConfigurations", "validate", "search_configuration", "execute", "search.configuration.validate"),
  testingOp("searchConfigurations", "archive", "search_configuration", "archive", "search.configuration.archive", 0),
  testingOp("searchConfigurations", "getConfiguration", "search_configuration", "read", "search.configuration.read"),
  testingOp("searchConfigurations", "putConfiguration", "search_configuration", "update", "search.configuration.update"),
  testingOp("searchCapabilities", "getCapabilities", "search_capabilities", "read", "search.capabilities.read"),
  testingOp("searchCapabilities", "getManagementReadiness", "search_capabilities", "read", "search.capabilities.read"),
  testingOp("searchHealth", "getHealth", "search_health", "read", "search.health.read"),
  testingOp("searchDiagnostics", "getDiagnostics", "search_diagnostics", "read", "search.diagnostics.read"),
  testingOp("searchCollections", "list", "search_collection", "list", "search.collection.list"),
  testingOp("searchCollections", "get", "search_collection", "read", "search.collection.read", 0),
  testingOp("searchCollections", "create", "search_collection", "create", "search.collection.create"),
  testingOp("searchCollections", "update", "search_collection", "update", "search.collection.update", 0),
  testingOp("searchCollections", "enable", "search_collection", "update", "search.collection.enable", 0),
  testingOp("searchCollections", "disable", "search_collection", "update", "search.collection.disable", 0),
  testingOp("searchCollections", "archive", "search_collection", "archive", "search.collection.archive", 0),
  testingOp("searchCollections", "restore", "search_collection", "update", "search.collection.update", 0),
  testingOp("searchSources", "list", "search_source", "list", "search.source.list"),
  testingOp("searchSources", "get", "search_source", "read", "search.source.read", 0),
  testingOp("searchSources", "create", "search_source", "create", "search.source.create"),
  testingOp("searchSources", "update", "search_source", "update", "search.source.update", 0),
  testingOp("searchSources", "enable", "search_source", "update", "search.source.enable", 0),
  testingOp("searchSources", "disable", "search_source", "update", "search.source.disable", 0),
  testingOp("searchSources", "archive", "search_source", "archive", "search.source.archive", 0),
  testingOp("searchSources", "restore", "search_source", "update", "search.source.update", 0),
  testingOp("searchScopes", "list", "search_scope", "list", "search.scope.list"),
  testingOp("searchScopes", "get", "search_scope", "read", "search.scope.read", 0),
  testingOp("searchScopes", "create", "search_scope", "create", "search.scope.create"),
  testingOp("searchScopes", "update", "search_scope", "update", "search.scope.update", 0),
  testingOp("searchScopes", "archive", "search_scope", "archive", "search.scope.archive", 0),
  testingOp("searchScopes", "restore", "search_scope", "update", "search.scope.update", 0),
  testingOp("searchProfiles", "list", "search_profile", "list", "search.profile.list"),
  testingOp("searchProfiles", "get", "search_profile", "read", "search.profile.read", 0),
  testingOp("searchProfiles", "create", "search_profile", "create", "search.profile.create"),
  testingOp("searchProfiles", "update", "search_profile", "update", "search.profile.update", 0),
  testingOp("searchProfiles", "archive", "search_profile", "archive", "search.profile.archive", 0),
  testingOp("searchProfiles", "restore", "search_profile", "update", "search.profile.update", 0),
  testingOp("searchProfiles", "validate", "search_profile", "execute", "search.profile.validate", 0),
  testingOp("searchMetadata", "list", "search_metadata", "list", "search.metadata.list"),
  testingOp("searchMetadata", "get", "search_metadata", "read", "search.metadata.read", 0),
  testingOp("searchMetadata", "create", "search_metadata", "create", "search.metadata.create"),
  testingOp("searchMetadata", "update", "search_metadata", "update", "search.metadata.update", 0),
  testingOp("searchMetadata", "archive", "search_metadata", "archive", "search.metadata.archive", 0),
  testingOp("searchMetadata", "restore", "search_metadata", "update", "search.metadata.update", 0),
  testingOp("searchAudit", "list", "search_audit", "list", "search.audit"),
  testingOp("searchStatistics", "getStatistics", "search_statistics", "read", "search.statistics.read"),
  testingOp("searchValidation", "validateQuery", "search_validation", "execute", "search.validation.execute"),
  testingOp("searchValidation", "validateConfiguration", "search_validation", "execute", "search.validation.execute"),
  testingOp("searchValidation", "validateProviderConfiguration", "search_validation", "execute", "search.validation.execute"),
];

/** APZSEARCH-006 — execution plane; separate from management searchPlatformOps. */
const searchExecutionOps: OperationAuthorizationMapping[] = [
  testingOp("searchExecution", "execute", "search_execution", "execute", "search.query.execute"),
  testingOp("searchExecution", "validateQuery", "search_execution", "execute", "search.query.validate"),
  testingOp("searchExecution", "executeWithFacets", "search_execution", "execute", "search.query.facets"),
  testingOp("searchExecution", "executeWithHighlights", "search_execution", "execute", "search.query.highlights"),
  testingOp("searchExecution", "suggest", "search_execution", "execute", "search.query.execute"),
  testingOp("searchIndexes", "list", "search_index", "list", "search.index.list"),
  testingOp("searchIndexes", "get", "search_index", "read", "search.index.read", 0),
  testingOp("searchIndexes", "create", "search_index", "create", "search.index.create"),
  testingOp("searchIndexes", "update", "search_index", "update", "search.index.update", 0),
  testingOp("searchIndexes", "delete", "search_index", "delete", "search.index.delete", 0),
  testingOp("searchDocuments", "upsert", "search_document", "create", "search.document.upsert"),
  testingOp("searchDocuments", "get", "search_document", "read", "search.document.read"),
  testingOp("searchDocuments", "delete", "search_document", "delete", "search.document.delete"),
  testingOp("searchExecutionHealth", "getHealth", "search_execution_health", "read", "search.execution.health"),
  testingOp("searchExecutionHealth", "getReadiness", "search_execution_health", "read", "search.execution.health"),
  testingOp(
    "searchExecutionDiagnostics",
    "getDiagnostics",
    "search_execution_diagnostics",
    "read",
    "search.execution.diagnostics",
  ),
  testingOp(
    "searchExecutionDiagnostics",
    "getStatistics",
    "search_execution_diagnostics",
    "read",
    "search.execution.statistics",
  ),
  testingOp(
    "searchExecutionDiagnostics",
    "getCapabilities",
    "search_execution_diagnostics",
    "read",
    "search.execution.diagnostics",
  ),
];

const platformProductRegistryOps: OperationAuthorizationMapping[] = [
  testingOp(
    "platformProductRegistry",
    "ensureDefaultRegistry",
    "platform_product",
    "manage",
    "quality.registry.manage",
  ),
  testingOp(
    "platformProductRegistry",
    "listProducts",
    "platform_product",
    "list",
    "quality.registry.view",
  ),
  testingOp(
    "platformProductRegistry",
    "getProduct",
    "platform_product",
    "read",
    "quality.registry.view",
    0,
  ),
  testingOp(
    "platformProductRegistry",
    "getProductByKey",
    "platform_product",
    "read",
    "quality.registry.view",
  ),
  testingOp(
    "platformProductRegistry",
    "upsertProduct",
    "platform_product",
    "manage",
    "quality.registry.manage",
  ),
  testingOp(
    "platformProductRegistry",
    "setEnabled",
    "platform_product",
    "manage",
    "quality.registry.manage",
    0,
  ),
  testingOp(
    "platformProductRegistry",
    "getRegistry",
    "platform_product",
    "read",
    "quality.registry.view",
  ),
];

const platformDependencyOps: OperationAuthorizationMapping[] = [
  testingOp("platformDependency", "addDependency", "platform_dependency", "create", "dependency.manage"),
  testingOp(
    "platformDependency",
    "removeDependency",
    "platform_dependency",
    "delete",
    "dependency.manage",
    0,
  ),
  testingOp("platformDependency", "listDependencies", "platform_dependency", "list", "dependency.view"),
  testingOp(
    "platformDependency",
    "listForProduct",
    "platform_dependency",
    "list",
    "dependency.view",
    0,
  ),
  testingOp("platformDependency", "validate", "platform_dependency", "execute", "dependency.validate"),
  testingOp(
    "platformDependency",
    "healthForProduct",
    "platform_dependency",
    "read",
    "dependency.view",
    0,
  ),
];

const platformQualityAggregateOps: OperationAuthorizationMapping[] = [
  testingOp(
    "platformQualityAggregate",
    "aggregate",
    "platform_quality",
    "execute",
    "platform-quality.aggregate",
  ),
];

const platformMultiCertOps: OperationAuthorizationMapping[] = [
  testingOp(
    "platformMultiCert",
    "aggregate",
    "platform_quality",
    "execute",
    "platform-quality.aggregate",
  ),
];

const platformProductHealthOps: OperationAuthorizationMapping[] = [
  testingOp(
    "platformProductHealth",
    "summarize",
    "platform_quality",
    "read",
    "platform-quality.view",
    0,
  ),
];

const platformQualityDashboardOps: OperationAuthorizationMapping[] = [
  testingOp(
    "platformQualityDashboard",
    "snapshot",
    "platform_dashboard",
    "read",
    "quality.dashboard.view",
  ),
];

const platformQualityTraceabilityOps: OperationAuthorizationMapping[] = [
  testingOp(
    "platformQualityTraceability",
    "link",
    "platform_traceability",
    "create",
    "platform-quality.admin",
  ),
  testingOp(
    "platformQualityTraceability",
    "list",
    "platform_traceability",
    "list",
    "platform-quality.view",
  ),
  testingOp(
    "platformQualityTraceability",
    "listForProduct",
    "platform_traceability",
    "list",
    "platform-quality.view",
  ),
];

const platformReleaseOps: OperationAuthorizationMapping[] = [
  testingOp("platformRelease", "createRelease", "platform_release", "create", "release.create"),
  testingOp("platformRelease", "getRelease", "platform_release", "read", "platform-release.view", 0),
  testingOp("platformRelease", "listReleases", "platform_release", "list", "platform-release.view"),
  testingOp(
    "platformRelease",
    "addProducts",
    "platform_release",
    "update",
    "platform-release.update",
    0,
  ),
  testingOp(
    "platformRelease",
    "removeProducts",
    "platform_release",
    "update",
    "platform-release.update",
    0,
  ),
  testingOp("platformRelease", "addPackage", "platform_release", "update", "platform-release.update", 0),
  testingOp(
    "platformRelease",
    "addCandidate",
    "platform_release",
    "update",
    "platform-release.update",
    0,
  ),
  testingOp(
    "platformRelease",
    "evaluateReadiness",
    "platform_release",
    "execute",
    "platform-release.evaluate",
    0,
  ),
  testingOp(
    "platformRelease",
    "evaluateDependencies",
    "platform_release",
    "execute",
    "platform-release.evaluate",
    0,
  ),
  testingOp(
    "platformRelease",
    "requestApproval",
    "platform_release",
    "create",
    "release.approve",
    0,
  ),
  testingOp(
    "platformRelease",
    "decideApproval",
    "platform_release",
    "transition",
    "release.decide",
    0,
  ),
  testingOp(
    "platformRelease",
    "evaluateCertification",
    "platform_release",
    "execute",
    "platform-release.evaluate",
    0,
  ),
  testingOp(
    "platformRelease",
    "produceSummary",
    "platform_release",
    "read",
    "platform-release.view",
    0,
  ),
  testingOp(
    "platformRelease",
    "recommendRelease",
    "platform_release",
    "execute",
    "platform-release.evaluate",
    0,
  ),
  testingOp(
    "platformRelease",
    "recordHumanDecision",
    "platform_release",
    "transition",
    "release.decide",
    0,
  ),
  testingOp("platformRelease", "getManifest", "platform_release", "read", "platform-release.view", 0),
  testingOp(
    "platformRelease",
    "transitionStatus",
    "platform_release",
    "transition",
    "platform-release.update",
    0,
  ),
];

const platformGovernanceOps: OperationAuthorizationMapping[] = [
  testingOp(
    "platformGovernance",
    "requestApproval",
    "platform_governance",
    "create",
    "governance.approve",
    0,
  ),
  testingOp(
    "platformGovernance",
    "decideApproval",
    "platform_governance",
    "transition",
    "governance.decide",
    0,
  ),
  testingOp(
    "platformGovernance",
    "recordHumanDecision",
    "platform_governance",
    "transition",
    "governance.decide",
    0,
  ),
];

export const OPERATION_AUTHORIZATION_MAPPINGS: readonly OperationAuthorizationMapping[] = [
  ...workspaceOps,
  ...projectOps,
  ...taskOps,
  ...teamOps,
  ...userOps,
  ...searchOps,
  ...supportOps,
  ...supportOrganizationOps,
  ...supportGroupOps,
  ...supportUserOps,
  ...supportArticleOps,
  ...supportSearchOps,
  ...supportHistoryOps,
  ...supportAnalyticsOps,
  ...testingPlanOps,
  ...testingSuiteOps,
  ...testingCaseOps,
  ...testingRequirementOps,
  ...testingExecutionOps,
  ...testingEvidenceOps,
  ...testingAutomationOps,
  ...testingCoverageOps,
  ...testingDefectOps,
  ...testingQualityOps,
  ...testingEngineeringIntelligenceOps,
  ...testingCertificationOps,
  ...testingReleaseReadinessOps,
  ...testingReleaseGovernanceOps,
  ...testingPipelinesOps,
  ...testingPipelineLiveOps,
  ...testingTraceabilityOps,
  ...testingApprovalOps,
  ...testingDashboardOps,
  ...testingReportingOps,
  ...platformReportingOps,
  ...platformProductRegistryOps,
  ...platformDependencyOps,
  ...platformQualityAggregateOps,
  ...platformMultiCertOps,
  ...platformProductHealthOps,
  ...platformQualityDashboardOps,
  ...platformQualityTraceabilityOps,
  ...platformReleaseOps,
  ...platformGovernanceOps,
  ...documentPlatformOps,
  ...searchPlatformOps,
  ...searchExecutionOps,
];

const mappingIndex = new Map<string, OperationAuthorizationMapping>(
  OPERATION_AUTHORIZATION_MAPPINGS.map((entry) => [
    `${entry.service}.${entry.operation}`,
    entry,
  ]),
);

export function resolveOperationAuthorization(
  service: string,
  operation: string,
): OperationAuthorizationMapping | undefined {
  return mappingIndex.get(`${service}.${operation}`);
}

/**
 * Extracts a resource ID from invoke args (context already stripped).
 * Arg index is relative to args after the ServiceRequestContext.
 */
export function extractResourceId(
  mapping: OperationAuthorizationMapping,
  argsAfterContext: readonly unknown[],
): string | undefined {
  if (mapping.resourceIdArgIndex !== undefined) {
    const value = argsAfterContext[mapping.resourceIdArgIndex];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  }

  if (mapping.resourceIdInputField) {
    for (const arg of argsAfterContext) {
      if (
        typeof arg === "object" &&
        arg !== null &&
        mapping.resourceIdInputField in arg &&
        typeof (arg as Record<string, unknown>)[mapping.resourceIdInputField] === "string"
      ) {
        const value = (arg as Record<string, string>)[mapping.resourceIdInputField];
        if (value && value.length > 0) {
          return value;
        }
      }
    }
  }

  return undefined;
}
