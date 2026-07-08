import type { TrustReportType } from "./trust-reporting-types";
import {
  composeTrustDashboardSnapshot,
  composeTrustDiagnosticsSnapshot,
  type TrustDashboardSnapshot,
  type TrustDiagnosticsSnapshot,
} from "./trust-dashboard-composition";
import {
  getSharedTrustWorkbench,
  type TrustWorkbenchBundle,
} from "./shared-trust-workbench";

export interface TrustWorkbenchOpenResult {
  readonly ok: boolean;
  readonly actionId: string;
  readonly openedAt: string;
}

/** UI workflow facade over in-memory trust services (LAW-015-09). */
export class TrustWorkbenchService {
  private readonly bundle: TrustWorkbenchBundle;

  constructor(bundle: TrustWorkbenchBundle = getSharedTrustWorkbench()) {
    this.bundle = bundle;
  }

  getBundle(): TrustWorkbenchBundle {
    return this.bundle;
  }

  getDashboardSnapshot(): TrustDashboardSnapshot {
    return composeTrustDashboardSnapshot(this.bundle);
  }

  getDiagnosticsSnapshot(): TrustDiagnosticsSnapshot {
    return composeTrustDiagnosticsSnapshot();
  }

  recordNavigation(actionId: string): TrustWorkbenchOpenResult {
    return {
      ok: true,
      actionId,
      openedAt: new Date().toISOString(),
    };
  }

  runReconciliation(): ReturnType<
    TrustWorkbenchBundle["reconciliationService"]["runReconciliation"]
  > {
    return this.bundle.reconciliationService.runReconciliation({
      tenantId: this.bundle.tenantId,
      trustAccountId: this.bundle.accountId,
      actorUserId: this.bundle.actorUserId,
    });
  }

  generateReport(reportType: TrustReportType) {
    return this.bundle.reportingService.generateReport({
      tenantId: this.bundle.tenantId,
      trustAccountId: this.bundle.accountId,
      reportType,
      generatedByUserId: this.bundle.actorUserId,
    });
  }
}
