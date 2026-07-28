import {
  QEP_TEST_SPECIFICATION_PERMISSIONS,
  type QepTestSpecificationPermission,
} from "@apzhub/qep-contracts";

export { QEP_TEST_SPECIFICATION_PERMISSIONS, type QepTestSpecificationPermission };

export const QEP_TEST_SPECIFICATION_PERMISSION_LABELS: Readonly<
  Record<QepTestSpecificationPermission, string>
> = {
  "qep.specification.create": "Create Test Specifications",
  "qep.specification.read": "View Test Specifications",
  "qep.specification.update": "Update Test Specifications",
  "qep.specification.review": "Submit Test Specifications for Review",
  "qep.specification.approve": "Approve Test Specifications",
  "qep.specification.reject": "Reject Test Specifications",
  "qep.specification.withdraw": "Withdraw Test Specifications",
  "qep.specification.retire": "Retire Test Specifications",
  "qep.specification.cancel": "Cancel Test Specifications",
  "qep.specification.search": "Search Test Specifications",
  "qep.specification.history.view": "View Test Specification History",
};
