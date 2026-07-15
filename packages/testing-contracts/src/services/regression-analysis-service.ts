import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type {
  RegressionAnalysisResult,
  RegressionCaseKeyResult,
} from "../domain";

/**
 * Regression analysis by case key — no ML / prediction.
 * Compares baseline vs current execution result sets.
 */
export interface RegressionAnalysisService {
  analyze(
    ctx: ServiceRequestContext,
    input: {
      readonly baselineLabel: string;
      readonly currentLabel: string;
      readonly baselineResults: readonly RegressionCaseKeyResult[];
      readonly currentResults: readonly RegressionCaseKeyResult[];
      readonly baselineCoveragePercent?: number;
      readonly currentCoveragePercent?: number;
      readonly baselineExecutionCount?: number;
      readonly currentExecutionCount?: number;
    },
  ): Promise<RegressionAnalysisResult>;
  get(ctx: ServiceRequestContext, id: string): Promise<RegressionAnalysisResult>;
  list(ctx: ServiceRequestContext): Promise<readonly RegressionAnalysisResult[]>;
}
