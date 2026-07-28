/**
 * QEP Test Execution platform permission catalogue (APZQEP-ENG-100D,
 * OES-ENG-090A PART-04 §2.1). Mirrors `EXECUTION_PERMISSIONS` in
 * `@apzhub/qep-test-execution` application layer exactly — the pipeline
 * authorisation check (this catalogue) and the Domain's `PermissionPort`
 * check (Application layer) must agree on permission string values.
 *
 * Defined locally in `platform-services` — `@apzhub/qep-contracts` remains a
 * placeholder package for this capability (008: never combine module,
 * service, and connector responsibilities).
 */

export const QEP_TEST_EXECUTION_PERMISSIONS = [
  "qep.execution.read",
  "qep.execution.create",
  "qep.execution.prepare",
  "qep.execution.assign",
  "qep.execution.execute",
  "qep.execution.control",
  "qep.execution.review",
  "qep.execution.supersede",
  "qep.execution.ingest",
  "qep.execution.admin",
] as const;

export type QepTestExecutionPermission =
  (typeof QEP_TEST_EXECUTION_PERMISSIONS)[number];
