import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type {
  BurndownSnapshot,
  CycleProgressSnapshot,
  ProjectStatistics,
  TaskStatistics,
  VelocitySnapshot,
} from "@apzhub/platform-service-contracts";

import {
  mapBurndownSnapshot,
  mapCycleProgress,
  mapProjectStatisticsFromTasks,
  mapTaskStatistics,
  mapVelocitySnapshot,
} from "../mappers/analytics-mapper";
import {
  extractPlaneId,
  extractProjectPlaneId,
  extractTaskPlaneId,
} from "../mappers/mapper-context";
import { mapPlaneIssue } from "../mappers/task-mapper";
import {
  assertValid,
  mergeValidation,
  validateRequiredString,
} from "../validation/request-validation";
import { validatePlaneIssueResponse } from "../validation/response-validation";
import type { PlaneServiceDeps } from "./plane-operation-runner";

/**
 * Read-only Plane project intelligence — progress, velocity, burn-down, distributions.
 */
export class PlaneAnalyticsService {
  constructor(private readonly deps: PlaneServiceDeps) {}

  async getProjectStatistics(
    context: IntegrationRequestContext,
    projectId: string,
  ): Promise<ProjectStatistics> {
    assertValid(
      validateRequiredString(projectId, "projectId"),
      "analytics.projectStats",
    );

    return this.deps.runner.run(context, "plane.analytics.projectStats", async () => {
      const planeProjectId = extractProjectPlaneId(projectId);
      const nowIso = new Date().toISOString();

      const [statsList, issues] = await Promise.all([
        this.deps.client.getProjectStats(context, {
          project_ids: planeProjectId,
          fields:
            "total_issues,completed_issues,total_members,total_cycles,total_modules",
        }),
        this.deps.client.listIssues(context, planeProjectId, {
          per_page: 100,
          archived: false,
        }),
      ]);

      const stats =
        statsList.find((entry) => entry.id === planeProjectId) ?? statsList[0];
      const tasks = issues.results.map((item) => {
        assertValid(validatePlaneIssueResponse(item), "task.entity");
        return mapPlaneIssue(item, projectId);
      });

      return mapProjectStatisticsFromTasks(projectId, tasks, stats, nowIso);
    });
  }

  async getTaskStatistics(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
  ): Promise<TaskStatistics> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(taskId, "taskId"),
      ),
      "analytics.taskStats",
    );

    return this.deps.runner.run(context, "plane.analytics.taskStats", async () => {
      const planeProjectId = extractProjectPlaneId(projectId);
      const planeTaskId = extractTaskPlaneId(taskId);
      const nowIso = new Date().toISOString();

      const [issue, comments, watchers] = await Promise.all([
        this.deps.client.getIssue(context, planeProjectId, planeTaskId),
        this.deps.client.listIssueComments(context, planeProjectId, planeTaskId, {
          per_page: 1,
        }),
        this.deps.client.listIssueSubscribers(context, planeProjectId, planeTaskId, {
          per_page: 1,
        }),
      ]);

      assertValid(validatePlaneIssueResponse(issue), "task.entity");
      const task = mapPlaneIssue(issue, projectId);
      const commentCount = Array.isArray(comments)
        ? comments.length
        : ((comments as { total_count?: number; count?: number; results: unknown[] })
            .total_count ??
          (comments as { count?: number }).count ??
          (comments as { results: unknown[] }).results.length);
      const watcherCount = Array.isArray(watchers)
        ? watchers.length
        : ((watchers as { total_count?: number; count?: number; results: unknown[] })
            .total_count ??
          (watchers as { count?: number }).count ??
          (watchers as { results: unknown[] }).results.length);

      return mapTaskStatistics(task, { commentCount, watcherCount }, nowIso);
    });
  }

  async getCycleProgress(
    context: IntegrationRequestContext,
    projectId: string,
    sprintId: string,
  ): Promise<CycleProgressSnapshot> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(sprintId, "sprintId"),
      ),
      "analytics.cycleProgress",
    );

    return this.deps.runner.run(context, "plane.analytics.cycleProgress", async () => {
      const record = await this.deps.client.getCycleProgress(
        context,
        extractProjectPlaneId(projectId),
        extractPlaneId(sprintId, "sprint"),
      );
      return mapCycleProgress(projectId, sprintId, record, new Date().toISOString());
    });
  }

  async getVelocitySnapshot(
    context: IntegrationRequestContext,
    projectId: string,
    sprintId: string,
  ): Promise<VelocitySnapshot> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(sprintId, "sprintId"),
      ),
      "analytics.velocity",
    );

    return this.deps.runner.run(context, "plane.analytics.velocity", async () => {
      const record = await this.deps.client.getCycleAnalytics(
        context,
        extractProjectPlaneId(projectId),
        extractPlaneId(sprintId, "sprint"),
      );
      return mapVelocitySnapshot(projectId, sprintId, record, new Date().toISOString());
    });
  }

  async getBurndownSnapshot(
    context: IntegrationRequestContext,
    projectId: string,
    sprintId: string,
  ): Promise<BurndownSnapshot> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(sprintId, "sprintId"),
      ),
      "analytics.burndown",
    );

    return this.deps.runner.run(context, "plane.analytics.burndown", async () => {
      const planeProjectId = extractProjectPlaneId(projectId);
      const planeCycleId = extractPlaneId(sprintId, "sprint");
      const [progress, analytics, cycle] = await Promise.all([
        this.deps.client.getCycleProgress(context, planeProjectId, planeCycleId),
        this.deps.client.getCycleAnalytics(context, planeProjectId, planeCycleId),
        this.deps.client.getCycle(context, planeProjectId, planeCycleId),
      ]);

      return mapBurndownSnapshot(
        projectId,
        sprintId,
        progress,
        analytics,
        new Date().toISOString(),
        {
          startDate: cycle.start_date ?? undefined,
          endDate: cycle.end_date ?? undefined,
        },
      );
    });
  }
}
