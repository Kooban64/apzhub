import {
  EXECUTION_PERMISSIONS,
  type ExecutionPermission,
} from "../application/permissions";

export { EXECUTION_PERMISSIONS, type ExecutionPermission };

export const EXECUTION_PERMISSION_LABELS: Readonly<
  Record<ExecutionPermission, string>
> = {
  "qep.execution.read": "View Test Executions",
  "qep.execution.create": "Create Test Executions",
  "qep.execution.prepare": "Prepare Test Executions",
  "qep.execution.assign": "Assign Test Executions",
  "qep.execution.execute": "Execute Test Executions",
  "qep.execution.control": "Control Test Executions",
  "qep.execution.review": "Review Test Executions",
  "qep.execution.supersede": "Supersede Test Executions",
  "qep.execution.ingest": "Ingest External Test Execution Results",
  "qep.execution.admin": "Administer Test Executions",
  "qep.execution.*": "All Test Execution Permissions",
};
