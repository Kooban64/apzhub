import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type {
  AddCommentInput,
  Comment,
  CommentListFilter,
  UpdateCommentInput,
} from "@apzhub/platform-service-contracts";

import type {
  PlaneCommentRecord,
  PlanePaginatedResponse,
} from "../internal/plane-api-types";
import {
  mapCommentToPlaneCreateBody,
  mapCommentToPlaneUpdateBody,
  mapPlaneComment,
} from "../mappers/collaboration-mapper";
import {
  extractCommentPlaneId,
  extractProjectPlaneId,
  extractTaskPlaneId,
} from "../mappers/mapper-context";
import type { PageRequest, PageResult } from "../models/query";
import {
  assertValid,
  mergeValidation,
  validatePageRequest,
  validateRequiredString,
} from "../validation/request-validation";
import { validatePlaneCommentResponse } from "../validation/response-validation";
import { mapPaginatedResult } from "./list-helpers";
import type { PlaneServiceDeps } from "./plane-operation-runner";

function asCommentArray(
  response: PlanePaginatedResponse<PlaneCommentRecord> | readonly PlaneCommentRecord[],
): PlanePaginatedResponse<PlaneCommentRecord> {
  if (Array.isArray(response)) {
    return {
      results: response,
      count: response.length,
      total_count: response.length,
      next_cursor: null,
      next_page_results: false,
    };
  }
  return response as PlanePaginatedResponse<PlaneCommentRecord>;
}

/**
 * Plane issue comments — adapter boundary uses APZHUB Comment terminology.
 */
export class PlaneCommentService {
  constructor(private readonly deps: PlaneServiceDeps) {}

  async list(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    filter: CommentListFilter = {},
    page: PageRequest = {},
  ): Promise<PageResult<Comment>> {
    assertValid(
      mergeValidation(
        validatePageRequest(page),
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(taskId, "taskId"),
      ),
      "comments.list",
    );

    return this.deps.runner.run(context, "plane.comments.list", async () => {
      const response = asCommentArray(
        await this.deps.client.listIssueComments(
          context,
          extractProjectPlaneId(projectId),
          extractTaskPlaneId(taskId),
          { per_page: page.perPage ?? 25, cursor: page.cursor },
        ),
      );

      let result = mapPaginatedResult(
        response,
        (item) => {
          assertValid(validatePlaneCommentResponse(item), "comment.entity");
          return mapPlaneComment(item, taskId);
        },
        page,
      );

      if (filter.authorId) {
        result = {
          ...result,
          items: result.items.filter((item) => item.authorId === filter.authorId),
        };
      }
      if (filter.search) {
        const needle = filter.search.toLowerCase();
        result = {
          ...result,
          items: result.items.filter((item) =>
            item.body.toLowerCase().includes(needle),
          ),
        };
      }
      return result;
    });
  }

  async get(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    commentId: string,
  ): Promise<Comment> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(taskId, "taskId"),
        validateRequiredString(commentId, "commentId"),
      ),
      "comments.get",
    );

    return this.deps.runner.run(context, "plane.comments.get", async () => {
      const record = await this.deps.client.getIssueComment(
        context,
        extractProjectPlaneId(projectId),
        extractTaskPlaneId(taskId),
        extractCommentPlaneId(commentId),
      );
      assertValid(validatePlaneCommentResponse(record), "comment.entity");
      return mapPlaneComment(record, taskId);
    });
  }

  async create(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    input: AddCommentInput,
  ): Promise<Comment> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(taskId, "taskId"),
        validateRequiredString(input.body, "body"),
      ),
      "comments.create",
    );

    return this.deps.runner.run(context, "plane.comments.create", async () => {
      const record = await this.deps.client.createIssueComment(
        context,
        extractProjectPlaneId(projectId),
        extractTaskPlaneId(taskId),
        mapCommentToPlaneCreateBody(input.body),
      );
      assertValid(validatePlaneCommentResponse(record), "comment.entity");
      return mapPlaneComment(record, taskId);
    });
  }

  async update(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    commentId: string,
    input: UpdateCommentInput,
  ): Promise<Comment> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(taskId, "taskId"),
        validateRequiredString(commentId, "commentId"),
        validateRequiredString(input.body, "body"),
      ),
      "comments.update",
    );

    return this.deps.runner.run(context, "plane.comments.update", async () => {
      const record = await this.deps.client.updateIssueComment(
        context,
        extractProjectPlaneId(projectId),
        extractTaskPlaneId(taskId),
        extractCommentPlaneId(commentId),
        mapCommentToPlaneUpdateBody(input.body),
      );
      assertValid(validatePlaneCommentResponse(record), "comment.entity");
      return mapPlaneComment(record, taskId);
    });
  }

  async delete(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    commentId: string,
  ): Promise<void> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(taskId, "taskId"),
        validateRequiredString(commentId, "commentId"),
      ),
      "comments.delete",
    );

    await this.deps.runner.run(context, "plane.comments.delete", async () => {
      await this.deps.client.deleteIssueComment(
        context,
        extractProjectPlaneId(projectId),
        extractTaskPlaneId(taskId),
        extractCommentPlaneId(commentId),
      );
    });
  }
}
