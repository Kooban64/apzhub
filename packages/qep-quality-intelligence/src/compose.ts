import {
  createPlatformQualityIntelligence,
  type PlatformQualityIntelligence,
  type QiDomainEvent,
  type RecordObservationRequest,
} from "@apzhub/platform-quality-intelligence";

export interface QepQualityIntelligencePorts {
  readonly onEvent?: (event: QiDomainEvent) => void | Promise<void>;
  /** Hook for Automation / SCM / Evidence / QKI / Notifications — no duplication. */
  readonly onQiEvent?: (event: QiDomainEvent) => void | Promise<void>;
}

export interface QepQualityIntelligenceFacade {
  readonly platform: PlatformQualityIntelligence;
  listProviders(): ReturnType<PlatformQualityIntelligence["registry"]["list"]>;
  listObservations(
    tenantId?: string,
  ): ReturnType<PlatformQualityIntelligence["engine"]["listObservations"]>;
  listSignals(
    tenantId?: string,
  ): ReturnType<PlatformQualityIntelligence["engine"]["listSignals"]>;
  listRecommendations(
    tenantId?: string,
  ): ReturnType<PlatformQualityIntelligence["engine"]["listRecommendations"]>;
  getRecommendation(
    id: string,
  ): ReturnType<PlatformQualityIntelligence["engine"]["getRecommendation"]>;
  getExplanation(
    id: string,
  ): ReturnType<PlatformQualityIntelligence["engine"]["getExplanation"]>;
  listScores(
    tenantId?: string,
  ): ReturnType<PlatformQualityIntelligence["engine"]["listScores"]>;
  listHistory(
    tenantId?: string,
  ): ReturnType<PlatformQualityIntelligence["engine"]["listHistory"]>;
  listAudits(
    tenantId?: string,
  ): ReturnType<PlatformQualityIntelligence["engine"]["listAudits"]>;
  listConfidence(
    tenantId?: string,
  ): ReturnType<PlatformQualityIntelligence["engine"]["listConfidence"]>;
  recordObservation(
    request: RecordObservationRequest,
  ): ReturnType<PlatformQualityIntelligence["engine"]["recordObservation"]>;
  calculateSignals(
    tenantId: string,
    correlationId: string,
  ): ReturnType<PlatformQualityIntelligence["engine"]["calculateSignals"]>;
  evaluateProviders(
    tenantId: string,
    correlationId: string,
  ): ReturnType<PlatformQualityIntelligence["engine"]["evaluateProviders"]>;
  /** Record → signals → provider evaluation in one orchestration step. */
  runAnalysis(
    tenantId: string,
    correlationId: string,
  ): Promise<{
    signals: Awaited<
      ReturnType<PlatformQualityIntelligence["engine"]["calculateSignals"]>
    >;
    recommendations: Awaited<
      ReturnType<PlatformQualityIntelligence["engine"]["evaluateProviders"]>
    >["recommendations"];
    scores: Awaited<
      ReturnType<PlatformQualityIntelligence["engine"]["evaluateProviders"]>
    >["scores"];
  }>;
  acceptRecommendation(
    recommendationId: string,
    actorId: string,
    correlationId: string,
  ): ReturnType<PlatformQualityIntelligence["engine"]["acceptRecommendation"]>;
  rejectRecommendation(
    recommendationId: string,
    actorId: string,
    correlationId: string,
  ): ReturnType<PlatformQualityIntelligence["engine"]["rejectRecommendation"]>;
}

export function createQepQualityIntelligence(
  ports: QepQualityIntelligencePorts = {},
): QepQualityIntelligenceFacade {
  const platform = createPlatformQualityIntelligence({
    publishEvent: async (event) => {
      await ports.onEvent?.(event);
      await ports.onQiEvent?.(event);
    },
  });

  return {
    platform,
    listProviders: () => platform.registry.list(),
    listObservations: (tenantId) => platform.engine.listObservations(tenantId),
    listSignals: (tenantId) => platform.engine.listSignals(tenantId),
    listRecommendations: (tenantId) => platform.engine.listRecommendations(tenantId),
    getRecommendation: (id) => platform.engine.getRecommendation(id),
    getExplanation: (id) => platform.engine.getExplanation(id),
    listScores: (tenantId) => platform.engine.listScores(tenantId),
    listHistory: (tenantId) => platform.engine.listHistory(tenantId),
    listAudits: (tenantId) => platform.engine.listAudits(tenantId),
    listConfidence: (tenantId) => platform.engine.listConfidence(tenantId),
    recordObservation: (request) => platform.engine.recordObservation(request),
    calculateSignals: (tenantId, correlationId) =>
      platform.engine.calculateSignals(tenantId, correlationId),
    evaluateProviders: (tenantId, correlationId) =>
      platform.engine.evaluateProviders(tenantId, correlationId),
    runAnalysis: async (tenantId, correlationId) => {
      const signals = await platform.engine.calculateSignals(tenantId, correlationId);
      const { recommendations, scores } = await platform.engine.evaluateProviders(
        tenantId,
        correlationId,
      );
      return { signals, recommendations, scores };
    },
    acceptRecommendation: (id, actorId, correlationId) =>
      platform.engine.acceptRecommendation(id, actorId, correlationId),
    rejectRecommendation: (id, actorId, correlationId) =>
      platform.engine.rejectRecommendation(id, actorId, correlationId),
  };
}
