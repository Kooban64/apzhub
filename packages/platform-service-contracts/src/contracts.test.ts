import { describe, expect, it } from "vitest";

import {
  PLATFORM_SERVICE_CONTRACTS_VERSION,
  PLATFORM_SERVICE_IDS,
  PlatformServiceError,
  isPlatformServiceError,
} from "./index";

describe("platform service contracts registry", () => {
  it("exports the expected contract version", () => {
    expect(PLATFORM_SERVICE_CONTRACTS_VERSION).toBe("0.16.0");
  });

  it("registers all platform service ids", () => {
    expect(PLATFORM_SERVICE_IDS).toEqual([
      "workspace-service",
      "project-service",
      "task-service",
      "team-service",
      "user-service",
      "search-service",
      "support-service",
      "support-organization-service",
      "support-group-service",
      "support-user-service",
      "support-article-service",
      "support-search-service",
      "support-history-service",
      "support-analytics-service",
      "testing-plan-service",
      "testing-suite-service",
      "testing-case-service",
      "testing-requirement-service",
      "testing-execution-service",
      "testing-evidence-service",
      "testing-automation-service",
      "testing-coverage-service",
      "testing-defect-service",
      "testing-quality-service",
      "testing-engineering-intelligence-service",
      "testing-certification-service",
      "testing-release-readiness-service",
      "testing-traceability-service",
      "testing-approval-service",
      "testing-dashboard-service",
      "testing-reporting-service",
      "platform-quality-service",
      "platform-release-service",
      "platform-governance-service",
    ]);
  });
});

describe("PlatformServiceError", () => {
  it("implements the vendor-neutral error contract", () => {
    const error = new PlatformServiceError({
      category: "not_found",
      code: "NOT_FOUND",
      message: "Project not found",
      correlationId: "corr_test",
      retryable: false,
    });

    expect(isPlatformServiceError(error)).toBe(true);
    expect(error.category).toBe("not_found");
    expect(error.code).toBe("NOT_FOUND");
    expect(error.correlationId).toBe("corr_test");
    expect(error.retryable).toBe(false);
    expect(error.message).toBe("Project not found");
  });

  it("does not expose backend details in the contract shape", () => {
    const error = new PlatformServiceError({
      category: "connector",
      code: "CONNECTOR_ERROR",
      message: "Integration temporarily unavailable",
      correlationId: "corr_test",
      retryable: true,
    });

    expect(JSON.stringify(error)).not.toMatch(/plane/i);
  });
});

describe("service interface contracts", () => {
  it("defines ProjectService with project-scoped operations", () => {
    type ProjectOps = keyof import("./services/project-service").ProjectService;
    const required: ProjectOps[] = [
      "listProjects",
      "getProject",
      "createProject",
      "updateProject",
      "archiveProject",
      "listStatuses",
      "listLabels",
      "listSprints",
      "getRoadmap",
    ];

    const contract: Record<ProjectOps, unknown> = {
      listProjects: undefined,
      getProject: undefined,
      createProject: undefined,
      updateProject: undefined,
      archiveProject: undefined,
      listStatuses: undefined,
      getStatus: undefined,
      createStatus: undefined,
      updateStatus: undefined,
      deleteStatus: undefined,
      listLabels: undefined,
      createLabel: undefined,
      updateLabel: undefined,
      deleteLabel: undefined,
      listSprints: undefined,
      getSprint: undefined,
      createSprint: undefined,
      updateSprint: undefined,
      archiveSprint: undefined,
      startSprint: undefined,
      completeSprint: undefined,
      listModules: undefined,
      getModule: undefined,
      createModule: undefined,
      updateModule: undefined,
      archiveModule: undefined,
      listMilestones: undefined,
      createMilestone: undefined,
      updateMilestone: undefined,
      getRoadmap: undefined,
      listProjectActivity: undefined,
    };

    for (const op of required) {
      expect(op in contract).toBe(true);
    }
  });

  it("defines TaskService with backlog and assignment operations", () => {
    type TaskOps = keyof import("./services/task-service").TaskService;
    const contract: Record<TaskOps, unknown> = {
      listTasks: undefined,
      getTask: undefined,
      createTask: undefined,
      updateTask: undefined,
      archiveTask: undefined,
      transitionTaskStatus: undefined,
      assignTask: undefined,
      getBacklog: undefined,
      reorderBacklog: undefined,
      assignTasksToSprint: undefined,
      listMyTasks: undefined,
      listComments: undefined,
      addComment: undefined,
      listAttachments: undefined,
    };

    expect(Object.keys(contract).length).toBe(14);
  });

  it("defines WorkspaceService, TeamService, UserService, and SearchService", () => {
    type WorkspaceOps = keyof import("./services/workspace-service").WorkspaceService;
    type TeamOps = keyof import("./services/team-service").TeamService;
    type UserOps = keyof import("./services/user-service").UserService;
    type SearchOps = keyof import("./services/search-service").SearchService;

    expect(["listWorkspaces", "getWorkspace"] satisfies WorkspaceOps[]).toHaveLength(2);
    expect([
      "listTeam",
      "getTeamMember",
      "addTeamMember",
      "updateTeamMember",
      "removeTeamMember",
    ] satisfies TeamOps[]).toHaveLength(5);
    expect([
      "listUsers",
      "getUser",
      "getUserByEmail",
      "getUserProfile",
      "createUser",
      "updateUser",
    ] satisfies UserOps[]).toHaveLength(6);
    expect(["search", "suggest"] satisfies SearchOps[]).toHaveLength(2);
  });

  it("defines SupportService with request lifecycle operations", () => {
    type SupportOps = keyof import("./services/support-service").SupportService;
    const contract: Record<SupportOps, unknown> = {
      listSupportRequests: undefined,
      getSupportRequest: undefined,
      createSupportRequest: undefined,
      updateSupportRequest: undefined,
      closeSupportRequest: undefined,
      reopenSupportRequest: undefined,
      assignSupportRequest: undefined,
      changeSupportRequestPriority: undefined,
      changeSupportRequestState: undefined,
      searchSupportRequests: undefined,
    };
    expect(Object.keys(contract).length).toBe(10);
  });

  it("defines TestingPlanService and TestingPlatformGateway contracts", () => {
    type TestingPlanOps = keyof import("./services/testing").TestingPlanService;
    type TestingGatewaySlots =
      keyof import("./services/testing").TestingPlatformGateway;
    type TestPlan = import("@apzhub/testing-contracts").TestPlan;

    const planOps: TestingPlanOps[] = [
      "list",
      "get",
      "create",
      "update",
      "clone",
      "archive",
    ];
    const gatewaySlots: TestingGatewaySlots[] = [
      "plans",
      "suites",
      "cases",
      "requirements",
      "executions",
      "evidence",
      "automation",
      "coverage",
      "defects",
      "quality",
      "certification",
      "releaseReadiness",
      "releaseGovernance",
      "traceability",
      "approvals",
      "dashboard",
    ];
    const _assertTestingContractsImport: TestPlan | undefined = undefined;

    expect(planOps).toHaveLength(6);
    expect(gatewaySlots).toHaveLength(16);
    expect(_assertTestingContractsImport).toBeUndefined();
  });

  it("defines PlatformQualityGateway, PlatformReleaseGateway, and PlatformGovernanceGateway", () => {
    type QualitySlots =
      keyof import("./services/platform-quality").PlatformQualityGateway;
    type ReleaseSlots =
      keyof import("./services/platform-quality").PlatformReleaseGateway;
    type GovernanceSlots =
      keyof import("./services/platform-quality").PlatformGovernanceGateway;
    type GovernedProduct = import("@apzhub/testing-contracts").GovernedProduct;

    const qualitySlots: QualitySlots[] = [
      "products",
      "dependencies",
      "aggregation",
      "certifications",
      "health",
      "dashboard",
      "traceability",
    ];
    const releaseSlots: ReleaseSlots[] = ["releases"];
    const governanceSlots: GovernanceSlots[] = ["approvals"];
    const _assertPlatformQualityImport: GovernedProduct | undefined = undefined;

    expect(qualitySlots).toHaveLength(7);
    expect(releaseSlots).toHaveLength(1);
    expect(governanceSlots).toHaveLength(1);
    expect(_assertPlatformQualityImport).toBeUndefined();
  });
});

describe("domain model contracts", () => {
  it("uses APZHUB identifier prefixes in documentation examples", () => {
    const sampleProject = {
      id: "proj_plane_test",
      tenantId: "t0000001-0000-4000-8000-000000000001",
      workspaceId: "ws_plane_test",
      name: "Alpha",
      identifier: "APZ",
      status: "active" as const,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    };

    expect(sampleProject.id.startsWith("proj_")).toBe(true);
    expect(sampleProject.workspaceId.startsWith("ws_")).toBe(true);
  });

  it("defines SupportTicket distinctly from Projects Task", () => {
    type SupportTicket = import("./domain/support").SupportTicket;
    type Task = import("./domain/task").Task;

    const ticket: SupportTicket = {
      id: "sreq_example",
      tenantId: "t1",
      title: "Example",
      groupId: "sgrp_example",
      requesterId: "suser_example",
      status: "open",
      priority: "normal",
      createdAt: "2026-07-10T00:00:00.000Z",
      updatedAt: "2026-07-10T00:00:00.000Z",
    };

    expect(ticket.id).toMatch(/^sreq_/);
    expect("projectId" in ticket).toBe(false);
    const _assertDistinct: SupportTicket extends Task ? never : true = true;
    expect(_assertDistinct).toBe(true);
  });

  it("defines SupportArticle distinctly from Projects Comment", () => {
    type SupportArticle = import("./domain/support").SupportArticle;
    type Comment = import("./domain/activity").Comment;

    const article: SupportArticle = {
      id: "sart_example",
      tenantId: "t1",
      supportTicketId: "sreq_example",
      body: "Hello",
      bodyFormat: "text/plain",
      channel: "note",
      visibility: "internal",
      senderType: "agent",
      author: { senderType: "agent" },
      deliveryStatus: "none",
      attachments: [],
      createdAt: "2026-07-11T00:00:00.000Z",
      updatedAt: "2026-07-11T00:00:00.000Z",
    };

    expect(article.id).toMatch(/^sart_/);
    expect("taskId" in article).toBe(false);
    const _assertDistinct: SupportArticle extends Comment ? never : true = true;
    expect(_assertDistinct).toBe(true);
  });
});
