export interface TestingReadinessIndicators {
  readonly enabled: boolean;
  readonly persistence: "provided" | "postgres" | "in-memory-test";
  readonly domain: "provided" | "created";
  readonly binaryEvidenceStorage: "out-of-scope";
  readonly eventBus: "not-wired";
  readonly httpRoutes: "not-wired";
  readonly generatedAt: string;
}

export function createTestingReadinessIndicators(input: {
  readonly enabled: boolean;
  readonly persistence: TestingReadinessIndicators["persistence"];
  readonly domain: TestingReadinessIndicators["domain"];
}): TestingReadinessIndicators {
  return {
    enabled: input.enabled,
    persistence: input.persistence,
    domain: input.domain,
    binaryEvidenceStorage: "out-of-scope",
    eventBus: "not-wired",
    httpRoutes: "not-wired",
    generatedAt: new Date().toISOString(),
  };
}
