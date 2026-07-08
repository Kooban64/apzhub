export const LAW_API_DOCUMENT_VIEW_PERMISSION = "legal.document.view";
export const LAW_API_DOCUMENT_CREATE_PERMISSION = "legal.document.create";
export const LAW_API_DOCUMENT_EDIT_PERMISSION = "legal.document.edit";
export const LAW_API_DOCUMENT_ARCHIVE_PERMISSION = "legal.document.archive";

export const DOCUMENT_AUTH = {
  view: LAW_API_DOCUMENT_VIEW_PERMISSION,
  create: LAW_API_DOCUMENT_CREATE_PERMISSION,
  edit: LAW_API_DOCUMENT_EDIT_PERMISSION,
  delete: LAW_API_DOCUMENT_ARCHIVE_PERMISSION,
} as const;
