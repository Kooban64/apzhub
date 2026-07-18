/** Engineering Intelligence view-model types (APZTCMS-022). */

export type EngineeringClientRequestOptions = {
  readonly signal?: AbortSignal;
  readonly correlationId?: string;
};

export type EngineeringCollectionResult<T> = {
  readonly items: readonly T[];
  readonly total: number;
};

export type EngineeringScopeInput = {
  readonly tenantId?: string;
  readonly organisationId?: string;
  readonly planId?: string;
  readonly releaseId?: string;
  readonly releaseLabel?: string;
  readonly subjectId?: string;
};

export type QualityScoreViewModel = {
  readonly id: string;
  readonly score: number;
  readonly computedAt: string;
  readonly scope: Readonly<Record<string, unknown>>;
  readonly inputs: Readonly<Record<string, number>>;
  readonly components: readonly {
    readonly key: string;
    readonly weight: number;
    readonly input: number;
    readonly contribution: number;
    readonly inverted: boolean;
  }[];
};

export type EngineeringHealthViewModel = {
  readonly status: string;
  readonly overallScore: number;
  readonly qualityScore: number;
  readonly stabilityScore: number;
  readonly releaseReadinessScore: number;
  readonly riskScore: number;
  readonly coverageScore: number;
  readonly automationScore: number;
  readonly certificationScore: number;
  readonly pipelineHealthScore: number;
  readonly computedAt: string;
  readonly isDecision: false;
  readonly risk: EngineeringRiskViewModel;
};

export type EngineeringRiskViewModel = {
  readonly overallScore: number;
  readonly overallLevel: string;
  readonly factors: readonly {
    readonly key: string;
    readonly score: number;
    readonly level: string;
    readonly reasons: readonly string[];
  }[];
  readonly computedAt: string;
};

export type EngineeringSnapshotViewModel = {
  readonly id: string;
  readonly label?: string;
  readonly computedAt: string;
  readonly qualityScore: QualityScoreViewModel;
  readonly health: EngineeringHealthViewModel;
  readonly risk: EngineeringRiskViewModel;
};

export type TrendSeriesViewModel = {
  readonly id: string;
  readonly kind: string;
  readonly direction: string;
  readonly delta: number;
  readonly periodKind: string;
  readonly points: readonly {
    readonly at: string;
    readonly value: number;
    readonly label?: string;
  }[];
  readonly computedAt: string;
};

export type BenchmarkViewModel = {
  readonly id: string;
  readonly metricKey: string;
  readonly label?: string;
  readonly comparison: {
    readonly current: number;
    readonly previous?: number;
    readonly rollingAverage?: number;
    readonly baseline?: number;
    readonly best?: number;
    readonly worst?: number;
    readonly direction: string;
  };
  readonly computedAt: string;
};

export type BaselineViewModel = {
  readonly id: string;
  readonly kind: string;
  readonly metricKey: string;
  readonly value: number;
  readonly label?: string;
  readonly computedAt: string;
};

export type HistoricalSnapshotViewModel = {
  readonly id: string;
  readonly qualityScore: number;
  readonly engineeringHealthScore: number;
  readonly immutable: true;
  readonly period: {
    readonly kind: string;
    readonly startAt: string;
    readonly endAt: string;
    readonly label?: string;
  };
  readonly computedAt: string;
};
