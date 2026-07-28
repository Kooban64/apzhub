/** Permission catalogue — APZQEP-OES-ENG-090A PART-04 §2.1 */

export const EXECUTION_PERMISSIONS = {
  READ: "qep.execution.read",
  CREATE: "qep.execution.create",
  PREPARE: "qep.execution.prepare",
  ASSIGN: "qep.execution.assign",
  EXECUTE: "qep.execution.execute",
  CONTROL: "qep.execution.control",
  REVIEW: "qep.execution.review",
  SUPERSEDE: "qep.execution.supersede",
  INGEST: "qep.execution.ingest",
  ADMIN: "qep.execution.admin",
  WILDCARD: "qep.execution.*",
} as const;

export type ExecutionPermission =
  (typeof EXECUTION_PERMISSIONS)[keyof typeof EXECUTION_PERMISSIONS];
