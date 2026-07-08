export const LAW_API_CLIENT_VIEW_PERMISSION = "legal.client.view";
export const LAW_API_CLIENT_CREATE_PERMISSION = "legal.client.create";
export const LAW_API_CLIENT_EDIT_PERMISSION = "legal.client.edit";
export const LAW_API_CLIENT_DELETE_PERMISSION = "legal.client.delete";

export const CLIENT_AUTH = {
  view: LAW_API_CLIENT_VIEW_PERMISSION,
  create: LAW_API_CLIENT_CREATE_PERMISSION,
  edit: LAW_API_CLIENT_EDIT_PERMISSION,
  delete: LAW_API_CLIENT_DELETE_PERMISSION,
} as const;
