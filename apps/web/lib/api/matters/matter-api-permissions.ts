export const LAW_API_MATTER_VIEW_PERMISSION = "legal.matter.view";
export const LAW_API_MATTER_CREATE_PERMISSION = "legal.matter.create";
export const LAW_API_MATTER_EDIT_PERMISSION = "legal.matter.edit";
export const LAW_API_MATTER_ARCHIVE_PERMISSION = "legal.matter.archive";

export const MATTER_AUTH = {
  view: LAW_API_MATTER_VIEW_PERMISSION,
  create: LAW_API_MATTER_CREATE_PERMISSION,
  edit: LAW_API_MATTER_EDIT_PERMISSION,
  delete: LAW_API_MATTER_ARCHIVE_PERMISSION,
} as const;
