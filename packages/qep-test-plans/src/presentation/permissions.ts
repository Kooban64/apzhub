import {
  QEP_TEST_PLAN_PERMISSIONS,
  type QepTestPlanPermission,
} from "@apzhub/qep-contracts";

export { QEP_TEST_PLAN_PERMISSIONS, type QepTestPlanPermission };

export const QEP_TEST_PLAN_PERMISSION_LABELS: Readonly<
  Record<QepTestPlanPermission, string>
> = {
  "qep.plan.read": "View Test Plans",
  "qep.plan.create": "Create Test Plans",
  "qep.plan.update": "Update Test Plans",
  "qep.plan.submit": "Submit Test Plans for Review",
  "qep.plan.approve": "Approve Test Plans",
  "qep.plan.reject": "Reject Test Plans",
  "qep.plan.ready": "Mark Test Plans Ready",
  "qep.plan.execute": "Start Test Plan Execution",
  "qep.plan.complete": "Complete Test Plans",
  "qep.plan.archive": "Archive Test Plans",
  "qep.plan.cancel": "Cancel Test Plans",
  "qep.plan.clone": "Clone Test Plans",
  "qep.plan.supersede": "Supersede Test Plans",
  "qep.plan.assign": "Update Test Plan Assignment",
  "qep.plan.schedule": "Update Test Plan Schedule",
  "qep.plan.search": "Search Test Plans",
  "qep.plan.history.view": "View Test Plan History",
};
