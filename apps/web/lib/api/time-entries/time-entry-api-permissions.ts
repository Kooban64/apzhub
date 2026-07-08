export const LAW_API_TIME_ENTRY_VIEW_PERMISSION = "legal.time.view";
export const LAW_API_TIME_ENTRY_CREATE_PERMISSION = "legal.time.create";
export const LAW_API_TIME_ENTRY_EDIT_PERMISSION = "legal.time.edit";
export const LAW_API_TIME_ENTRY_DELETE_PERMISSION = "legal.time.delete";

export const TIME_ENTRY_AUTH = {
  view: LAW_API_TIME_ENTRY_VIEW_PERMISSION,
  create: LAW_API_TIME_ENTRY_CREATE_PERMISSION,
  edit: LAW_API_TIME_ENTRY_EDIT_PERMISSION,
  delete: LAW_API_TIME_ENTRY_DELETE_PERMISSION,
} as const;
