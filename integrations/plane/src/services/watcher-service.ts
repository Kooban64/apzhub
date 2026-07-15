import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { AddWatcherInput, Watcher } from "@apzhub/platform-service-contracts";

import type {
  PlanePaginatedResponse,
  PlaneSubscriberRecord,
} from "../internal/plane-api-types";
import { mapPlaneSubscriber } from "../mappers/collaboration-mapper";
import {
  extractPlaneId,
  extractProjectPlaneId,
  extractTaskPlaneId,
  extractWatcherPlaneId,
} from "../mappers/mapper-context";
import type { PageRequest, PageResult } from "../models/query";
import {
  assertValid,
  mergeValidation,
  validatePageRequest,
  validateRequiredString,
} from "../validation/request-validation";
import { validatePlaneSubscriberResponse } from "../validation/response-validation";
import { mapPaginatedResult } from "./list-helpers";
import type { PlaneServiceDeps } from "./plane-operation-runner";

function asSubscriberArray(
  response:
    | PlanePaginatedResponse<PlaneSubscriberRecord>
    | readonly PlaneSubscriberRecord[],
): PlanePaginatedResponse<PlaneSubscriberRecord> {
  if (Array.isArray(response)) {
    return {
      results: response,
      count: response.length,
      total_count: response.length,
      next_cursor: null,
      next_page_results: false,
    };
  }
  return response as PlanePaginatedResponse<PlaneSubscriberRecord>;
}

/**
 * Plane issue subscribers — exposed as APZHUB Watchers.
 */
export class PlaneWatcherService {
  constructor(private readonly deps: PlaneServiceDeps) {}

  async list(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    page: PageRequest = {},
  ): Promise<PageResult<Watcher>> {
    assertValid(
      mergeValidation(
        validatePageRequest(page),
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(taskId, "taskId"),
      ),
      "watchers.list",
    );

    return this.deps.runner.run(context, "plane.watchers.list", async () => {
      const response = asSubscriberArray(
        await this.deps.client.listIssueSubscribers(
          context,
          extractProjectPlaneId(projectId),
          extractTaskPlaneId(taskId),
          { per_page: page.perPage ?? 25, cursor: page.cursor },
        ),
      );

      return mapPaginatedResult(
        response,
        (item) => {
          assertValid(validatePlaneSubscriberResponse(item), "watcher.entity");
          return mapPlaneSubscriber(item, taskId);
        },
        page,
      );
    });
  }

  async add(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    input: AddWatcherInput,
  ): Promise<Watcher> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(taskId, "taskId"),
        validateRequiredString(input.userId, "userId"),
      ),
      "watchers.add",
    );

    return this.deps.runner.run(context, "plane.watchers.add", async () => {
      const record = await this.deps.client.addIssueSubscriber(
        context,
        extractProjectPlaneId(projectId),
        extractTaskPlaneId(taskId),
        { subscriber: extractPlaneId(input.userId, "user") },
      );
      assertValid(validatePlaneSubscriberResponse(record), "watcher.entity");
      return mapPlaneSubscriber(record, taskId);
    });
  }

  async remove(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    watcherId: string,
  ): Promise<void> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(taskId, "taskId"),
        validateRequiredString(watcherId, "watcherId"),
      ),
      "watchers.remove",
    );

    await this.deps.runner.run(context, "plane.watchers.remove", async () => {
      await this.deps.client.removeIssueSubscriber(
        context,
        extractProjectPlaneId(projectId),
        extractTaskPlaneId(taskId),
        extractWatcherPlaneId(watcherId),
      );
    });
  }
}
