/**
 * Suite reference port — Cap A remains authoritative.
 * Execution Planning validates references; does not duplicate Suite logic.
 */

export type SuiteLookupResult = {
  readonly suiteId: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly name: string;
  readonly status: string;
  readonly version: number;
};

export type SuiteReferencePort = {
  get(tenantId: string, suiteId: string): Promise<SuiteLookupResult | undefined>;
};

/** Compatibility model: bind suiteId + version + display name at plan create/update.
 * Approved plans do not silently mutate when Cap A Suite changes (version drift = readiness warning).
 */
export const SUITE_COMPATIBILITY_MODEL =
  "bind-at-plan-time:suiteId+suiteVersion+suiteName; live drift warned in readiness" as const;
