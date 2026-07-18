import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type {
  ActivityEntry,
  ActivityListFilter,
  ActivityPage,
} from "@apzhub/platform-service-contracts";

import type {
  PlaneActivityRecord,
  PlanePaginatedResponse,
} from "../internal/plane-api-types";
import { mapPlaneActivity } from "../mappers/collaboration-mapper";
import { extractProjectPlaneId, extractTaskPlaneId } from "../mappers/mapper-context";
import type { PageRequest } from "../models/query";
import {
  assertValid,
  mergeValidation,
  validatePageRequest,
  validateRequiredString,
} from "../validation/request-validation";
import { validatePlaneActivityResponse } from "../validation/response-validation";
import type { PlaneServiceDeps } from "./plane-operation-runner";

function asActivityArray(
  response:
    readonly PlaneActivityRecord[] | PlanePaginatedResponse<PlaneActivityRecord>,
): readonly PlaneActivityRecord[] {
  if (Array.isArray(response)) {
    return response;
  }
  return (response as PlanePaginatedResponse<PlaneActivityRecord>).results;
}

function applyActivityFilters(
  items: readonly ActivityEntry[],
  filter: ActivityListFilter,
): ActivityEntry[] {
  return items.filter((item) => {
    if (filter.taskId && item.taskId !== filter.taskId) return false;
    if (filter.actorId && item.actorId !== filter.actorId) return false;
    if (filter.action && item.action !== filter.action) return false;
    if (filter.occurredAfter && item.occurredAt < filter.occurredAfter) return false;
    if (filter.occurredBefore && item.occurredAt > filter.occurredBefore) return false;
    return true;
  });
}

function toActivityPage(
  items: readonly ActivityEntry[],
  page: PageRequest,
): ActivityPage {
  const perPage = page.perPage ?? 25;
  const offset = page.cursor ? Number.parseInt(page.cursor, 10) || 0 : 0;
  const slice = items.slice(offset, offset + perPage);
  const nextOffset = offset + perPage;
  const hasNextPage = nextOffset < items.length;
  return {
    items: slice,
    hasNextPage,
    nextCursor: hasNextPage ? String(nextOffset) : undefined,
  };
}

/**
 * Plane issue history / activity — project activity aggregates task histories.
 */
export class PlaneActivityService {
  constructor(private readonly deps: PlaneServiceDeps) {}

  async listTaskActivity(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    filter: ActivityListFilter = {},
    page: PageRequest = {},
  ): Promise<ActivityPage> {
    assertValid(
      mergeValidation(
        validatePageRequest(page),
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(taskId, "taskId"),
      ),
      "activity.listTask",
    );

    return this.deps.runner.run(context, "plane.activity.listTask", async () => {
      const raw = await this.deps.client.listIssueActivities(
        context,
        extractProjectPlaneId(projectId),
        extractTaskPlaneId(taskId),
        {
          per_page: page.perPage ?? 25,
          cursor: page.cursor,
          activity_type: "issue-property",
        },
      );
      const mapped = asActivityArray(raw).map((item) => {
        assertValid(validatePlaneActivityResponse(item), "activity.entity");
        return mapPlaneActivity(item, projectId, taskId);
      });
      const filtered = applyActivityFilters(mapped, filter).sort((a, b) =>
        a.occurredAt.localeCompare(b.occurredAt),
      );
      return toActivityPage(filtered, page);
    });
  }

  /**
   * Project activity — aggregates first-page issue histories (Plane CE has no
   * dedicated project-wide activity collection). Optional filter.taskId narrows
   * to a single task history call.
   */
  async listProjectActivity(
    context: IntegrationRequestContext,
    projectId: string,
    filter: ActivityListFilter = {},
    page: PageRequest = {},
  ): Promise<ActivityPage> {
    assertValid(
      mergeValidation(
        validatePageRequest(page),
        validateRequiredString(projectId, "projectId"),
      ),
      "activity.listProject",
    );

    if (filter.taskId) {
      return this.listTaskActivity(context, projectId, filter.taskId, filter, page);
    }

    return this.deps.runner.run(context, "plane.activity.listProject", async () => {
      const issues = await this.deps.client.listIssues(
        context,
        extractProjectPlaneId(projectId),
        { per_page: Math.min(page.perPage ?? 25, 25) },
      );

      const histories = await Promise.all(
        issues.results.slice(0, 10).map(async (issue) => {
          const raw = await this.deps.client.listIssueActivities(
            context,
            extractProjectPlaneId(projectId),
            issue.id,
            { activity_type: "issue-property" },
          );
          return asActivityArray(raw).map((item) => {
            assertValid(validatePlaneActivityResponse(item), "activity.entity");
            return mapPlaneActivity(item, projectId, `task_plane_${issue.id}`);
          });
        }),
      );

      const flattened = histories
        .flat()
        .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
      const filtered = applyActivityFilters(flattened, filter);
      return toActivityPage(filtered, page);
    });
  }

  /** Alias for listProjectActivity — generic list entrypoint. */
  async list(
    context: IntegrationRequestContext,
    projectId: string,
    filter: ActivityListFilter = {},
    page: PageRequest = {},
  ): Promise<ActivityPage> {
    return this.listProjectActivity(context, projectId, filter, page);
  }
}
