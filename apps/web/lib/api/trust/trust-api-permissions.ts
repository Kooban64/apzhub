export const LAW_API_TRUST_VIEW_PERMISSION = "legal.trust.view";
export const LAW_API_TRUST_MANAGE_PERMISSION = "legal.trust.manage";
export const LAW_API_TRUST_POST_PERMISSION = "legal.trust.post";
export const LAW_API_TRUST_TRANSFER_PERMISSION = "legal.trust.transfer";
export const LAW_API_TRUST_RECONCILE_PERMISSION = "legal.trust.reconcile";
export const LAW_API_TRUST_INTEREST_PERMISSION = "legal.trust.interest";
export const LAW_API_TRUST_REPORT_PERMISSION = "legal.trust.report";
export const LAW_API_TRUST_AUDIT_PERMISSION = "legal.trust.audit";
export const LAW_API_TRUST_REVERSE_PERMISSION = "legal.trust.reverse";

export const TRUST_AUTH = {
  view: LAW_API_TRUST_VIEW_PERMISSION,
  manage: LAW_API_TRUST_MANAGE_PERMISSION,
  post: LAW_API_TRUST_POST_PERMISSION,
  transfer: LAW_API_TRUST_TRANSFER_PERMISSION,
  reconcile: LAW_API_TRUST_RECONCILE_PERMISSION,
  interest: LAW_API_TRUST_INTEREST_PERMISSION,
  report: LAW_API_TRUST_REPORT_PERMISSION,
  audit: LAW_API_TRUST_AUDIT_PERMISSION,
  reverse: LAW_API_TRUST_REVERSE_PERMISSION,
} as const;
