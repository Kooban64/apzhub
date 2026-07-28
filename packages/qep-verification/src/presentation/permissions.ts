import {
  QEP_VERIFICATION_PERMISSIONS,
  type QepVerificationPermission,
} from "@apzhub/qep-contracts";

export { QEP_VERIFICATION_PERMISSIONS, type QepVerificationPermission };

export const QEP_VERIFICATION_PERMISSION_LABELS: Readonly<
  Record<QepVerificationPermission, string>
> = {
  "qep.verification.view": "View Verifications",
  "qep.verification.create": "Create Verifications",
  "qep.verification.request": "Request Verifications",
  "qep.verification.assign": "Assign Verifications",
  "qep.verification.start": "Start Verifications",
  "qep.verification.complete": "Complete Verifications",
  "qep.verification.reject": "Reject Verifications",
  "qep.verification.expire": "Expire Verifications",
  "qep.verification.withdraw": "Withdraw Verifications",
  "qep.verification.supersede": "Supersede Verifications",
  "qep.verification.cancel": "Cancel Verifications",
  "qep.verification.retire": "Retire Verifications",
  "qep.verification.modify": "Modify Verifications",
  "qep.verification.history.view": "View Verification History",
  "qep.verification.search": "Search Verifications",
};
