export const LAW_API_TASK_VIEW_PERMISSION = "legal.task.view";
export const LAW_API_TASK_CREATE_PERMISSION = "legal.task.create";
export const LAW_API_TASK_EDIT_PERMISSION = "legal.task.edit";
export const LAW_API_TASK_ARCHIVE_PERMISSION = "legal.task.archive";

export const TASK_AUTH = {
  view: LAW_API_TASK_VIEW_PERMISSION,
  create: LAW_API_TASK_CREATE_PERMISSION,
  edit: LAW_API_TASK_EDIT_PERMISSION,
  delete: LAW_API_TASK_ARCHIVE_PERMISSION,
} as const;
