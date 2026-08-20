import { getTestManagementService } from "./test-management-runtime";

/**
 * Snapshot hook for certified Test Execution create.
 * Phase 4 Plan→Execution uses freezeExecutionStart directly and fail-closes.
 * Legacy creates that still point at non-Phase-3 specifications skip snapshot
 * only when no Test Case exists — other snapshot failures are not swallowed.
 */
export async function captureExecutionSnapshots(input: {
  readonly tenantId: string;
  readonly executionId: string;
  readonly executionKind: "test_execution" | "workspace_session";
  readonly specificationId?: string;
  readonly planId?: string;
  readonly suiteId?: string;
}): Promise<void> {
  const service = getTestManagementService();
  try {
    await service.freezeExecutionStart(input);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "test_case.not_found") return;
    throw error;
  }
}
