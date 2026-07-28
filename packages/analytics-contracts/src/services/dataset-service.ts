/**
 * DatasetService — dataset descriptor port (interfaces only).
 * APZHUB-PLATFORM-ANALYTICS-003 — no business logic.
 */

import type { AnalyticsRequestContext } from "../common/context";
import type { AnalyticsDataset } from "../domain/analytics";
import type { AnalyticsDatasetId } from "../identifiers";

export type UpsertDatasetInput = {
  readonly dataset: Omit<
    AnalyticsDataset,
    "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "revision"
  > &
    Partial<
      Pick<
        AnalyticsDataset,
        "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "revision"
      >
    >;
};

export type DatasetService = {
  readonly listDatasets: (
    ctx: AnalyticsRequestContext,
  ) => Promise<readonly AnalyticsDataset[]>;
  readonly getDataset: (
    ctx: AnalyticsRequestContext,
    datasetId: AnalyticsDatasetId,
  ) => Promise<AnalyticsDataset>;
  readonly upsertDataset: (
    ctx: AnalyticsRequestContext,
    input: UpsertDatasetInput,
  ) => Promise<AnalyticsDataset>;
};
