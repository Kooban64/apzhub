export const LAW_API_INVOICE_VIEW_PERMISSION = "legal.invoice.view";
export const LAW_API_INVOICE_CREATE_PERMISSION = "legal.invoice.create";
export const LAW_API_INVOICE_EDIT_PERMISSION = "legal.invoice.edit";
export const LAW_API_INVOICE_CANCEL_PERMISSION = "legal.invoice.cancel";

export const INVOICE_AUTH = {
  view: LAW_API_INVOICE_VIEW_PERMISSION,
  create: LAW_API_INVOICE_CREATE_PERMISSION,
  edit: LAW_API_INVOICE_EDIT_PERMISSION,
  delete: LAW_API_INVOICE_CANCEL_PERMISSION,
} as const;
