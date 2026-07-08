import type { TaskListCriteria } from "@apzhub/law-platform/api";

import {
  compareStrings,
  encodeListCursor,
  getEnumFilter,
  paginateItems,
  parseFiltering,
  parsePagination,
  parseSorting,
  sortItems,
} from "../framework";

export interface TaskListQuery {
  readonly criteria: TaskListCriteria;
  readonly limit: number;
  readonly cursorOffset: number;
  readonly sort: readonly string[];
}

const TASK_FILTER_SPEC = {
  queryParam: "query",
  enumParams: ["taskStatus", "taskPriority", "dueDateFilter"] as const,
};

function readStringFilter(
  searchParams: URLSearchParams,
  param: string,
): string | undefined {
  const raw = searchParams.get(param);
  return raw?.trim() ? raw.trim() : undefined;
}

/** Parse list query parameters for GET /tasks (LAW-014-06). */
export function parseTaskListQuery(searchParams: URLSearchParams): TaskListQuery {
  const pagination = parsePagination(searchParams);
  const filters = parseFiltering(searchParams, TASK_FILTER_SPEC);

  return {
    criteria: {
      query: filters.query,
      taskStatus: getEnumFilter(
        filters,
        "taskStatus",
      ) as TaskListCriteria["taskStatus"],
      taskPriority: getEnumFilter(
        filters,
        "taskPriority",
      ) as TaskListCriteria["taskPriority"],
      assigneeUserId: readStringFilter(searchParams, "assigneeUserId"),
      matterId: readStringFilter(searchParams, "matterId"),
      dueDateFilter: getEnumFilter(
        filters,
        "dueDateFilter",
      ) as TaskListCriteria["dueDateFilter"],
    },
    limit: pagination.limit,
    cursorOffset: pagination.cursorOffset,
    sort: parseSorting(searchParams, { defaultSort: ["dueAt"] }),
  };
}

/** @deprecated Use encodeListCursor from framework */
export const encodeTaskListCursor = encodeListCursor;

export function sortTasksForApi<
  T extends {
    title: string;
    taskStatus: string;
    taskPriority: string;
    dueAt?: string | null;
    createdAt?: string;
  },
>(tasks: readonly T[], sortFields: readonly string[]): T[] {
  return sortItems(
    tasks,
    sortFields,
    {
      title: (left, right) => compareStrings(left.title, right.title),
      taskStatus: (left, right) => compareStrings(left.taskStatus, right.taskStatus),
      taskPriority: (left, right) =>
        compareStrings(left.taskPriority, right.taskPriority),
      dueAt: (left, right) => compareStrings(left.dueAt ?? "", right.dueAt ?? ""),
      createdAt: (left, right) =>
        compareStrings(left.createdAt ?? "", right.createdAt ?? ""),
    },
    ["title"],
  );
}

export function paginateTaskSummaries<T>(
  items: readonly T[],
  limit: number,
  offset: number,
) {
  return paginateItems(items, limit, offset);
}
