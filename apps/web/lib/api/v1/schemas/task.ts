import { z } from "zod";

import { globalIdWithPrefix, paginationQuerySchema } from "./common";

const taskSortFields = [
  "title",
  "status",
  "priority",
  "rank",
  "createdAt",
  "updatedAt",
] as const;

const taskPriorityValues = ["none", "low", "medium", "high", "urgent"] as const;

/** List query — unknown keys rejected via `.strict()`. */
export const taskListQuerySchema = paginationQuerySchema
  .extend({
    sort: z.enum(taskSortFields).optional(),
    order: z.enum(["asc", "desc"]).optional(),
    projectId: globalIdWithPrefix("proj"),
    workspaceId: globalIdWithPrefix("ws").optional(),
    /** Canonical status ID; HTTP alias for TaskListFilter.statusId. */
    stateId: globalIdWithPrefix("status").optional(),
    assigneeId: globalIdWithPrefix("user").optional(),
    labelId: globalIdWithPrefix("label").optional(),
    priority: z.enum(taskPriorityValues).optional(),
    /** Canonical module ID; maps to TaskListFilter.projectModuleId. */
    moduleId: globalIdWithPrefix("module").optional(),
    sprintId: globalIdWithPrefix("sprint").optional(),
    search: z.string().min(1).max(200).optional(),
  })
  .strict();

export const taskIdParamSchema = globalIdWithPrefix("task");
export const assigneeIdParamSchema = globalIdWithPrefix("user");
export const labelIdParamSchema = globalIdWithPrefix("label");

export const createTaskBodySchema = z
  .object({
    projectId: globalIdWithPrefix("proj"),
    title: z.string().min(1).max(500),
    description: z.string().max(20_000).optional(),
    statusId: globalIdWithPrefix("status").optional(),
    stateId: globalIdWithPrefix("status").optional(),
    priority: z.enum(taskPriorityValues).optional(),
    assigneeId: globalIdWithPrefix("user").optional(),
    assigneeIds: z.array(globalIdWithPrefix("user")).max(50).optional(),
    sprintId: globalIdWithPrefix("sprint").optional(),
    projectModuleId: globalIdWithPrefix("module").optional(),
    moduleId: globalIdWithPrefix("module").optional(),
    parentTaskId: globalIdWithPrefix("task").optional(),
    labelIds: z.array(globalIdWithPrefix("label")).max(50).optional(),
    startDate: z.string().min(1).max(64).optional(),
    dueDate: z.string().min(1).max(64).optional(),
    estimate: z
      .object({
        points: z.number().finite().optional(),
        minutes: z.number().finite().optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .refine(
    (value) => !(value.statusId && value.stateId && value.statusId !== value.stateId),
    {
      message: "statusId and stateId must match when both are provided.",
    },
  )
  .refine(
    (value) =>
      !(
        value.projectModuleId &&
        value.moduleId &&
        value.projectModuleId !== value.moduleId
      ),
    { message: "projectModuleId and moduleId must match when both are provided." },
  );

export const updateTaskBodySchema = z
  .object({
    title: z.string().min(1).max(500).optional(),
    description: z.string().max(20_000).optional(),
    statusId: globalIdWithPrefix("status").optional(),
    stateId: globalIdWithPrefix("status").optional(),
    priority: z.enum(taskPriorityValues).optional(),
    assigneeId: globalIdWithPrefix("user").nullable().optional(),
    assigneeIds: z.array(globalIdWithPrefix("user")).max(50).nullable().optional(),
    sprintId: globalIdWithPrefix("sprint").nullable().optional(),
    projectModuleId: globalIdWithPrefix("module").nullable().optional(),
    moduleId: globalIdWithPrefix("module").nullable().optional(),
    parentTaskId: globalIdWithPrefix("task").nullable().optional(),
    labelIds: z.array(globalIdWithPrefix("label")).max(50).optional(),
    startDate: z.string().min(1).max(64).nullable().optional(),
    dueDate: z.string().min(1).max(64).nullable().optional(),
    estimate: z
      .object({
        points: z.number().finite().optional(),
        minutes: z.number().finite().optional(),
      })
      .strict()
      .nullable()
      .optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for update.",
  });

export const transitionTaskBodySchema = z
  .object({
    statusId: globalIdWithPrefix("status").optional(),
    stateId: globalIdWithPrefix("status").optional(),
  })
  .strict()
  .refine((value) => Boolean(value.statusId ?? value.stateId), {
    message: "statusId or stateId is required.",
  });

export const assignTaskBodySchema = z
  .object({
    assigneeId: globalIdWithPrefix("user").optional(),
    assigneeIds: z.array(globalIdWithPrefix("user")).min(1).max(50).optional(),
  })
  .strict()
  .refine((value) => Boolean(value.assigneeId ?? value.assigneeIds?.length), {
    message: "assigneeId or assigneeIds is required.",
  });

export const addLabelsBodySchema = z
  .object({
    labelId: globalIdWithPrefix("label").optional(),
    labelIds: z.array(globalIdWithPrefix("label")).min(1).max(50).optional(),
  })
  .strict()
  .refine((value) => Boolean(value.labelId ?? value.labelIds?.length), {
    message: "labelId or labelIds is required.",
  });

export const setSprintBodySchema = z
  .object({
    sprintId: globalIdWithPrefix("sprint"),
  })
  .strict();

export const setModuleBodySchema = z
  .object({
    moduleId: globalIdWithPrefix("module").optional(),
    projectModuleId: globalIdWithPrefix("module").optional(),
  })
  .strict()
  .refine((value) => Boolean(value.moduleId ?? value.projectModuleId), {
    message: "moduleId or projectModuleId is required.",
  });

export const setParentBodySchema = z
  .object({
    parentTaskId: globalIdWithPrefix("task"),
  })
  .strict();

export type CreateTaskBody = z.infer<typeof createTaskBodySchema>;
export type UpdateTaskBody = z.infer<typeof updateTaskBodySchema>;
