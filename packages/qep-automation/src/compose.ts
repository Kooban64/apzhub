import {
  createPlatformAutomation,
  type AutomationDomainEvent,
  type AutomationExecutionRecord,
  type AutomationExecutionRequest,
  type PlatformAutomation,
} from "@apzhub/platform-automation";

export interface QepAutomationPorts {
  readonly onEvent?: (event: AutomationDomainEvent) => void | Promise<void>;
  /** Hook for Evidence Platform / QKI / notifications — no duplication of those systems. */
  readonly onEvidencePublished?: (
    record: AutomationExecutionRecord,
  ) => void | Promise<void>;
  readonly playwrightDryRun?: boolean;
}

export interface QepAutomationFacade {
  readonly platform: PlatformAutomation;
  listProviders(): ReturnType<PlatformAutomation["registry"]["list"]>;
  listExecutions(tenantId?: string): readonly AutomationExecutionRecord[];
  getExecution(id: string): AutomationExecutionRecord | undefined;
  enqueue(request: AutomationExecutionRequest): Promise<AutomationExecutionRecord>;
  run(executionId: string): Promise<AutomationExecutionRecord>;
  enqueueAndRun(
    request: AutomationExecutionRequest,
  ): Promise<AutomationExecutionRecord>;
  cancel(executionId: string): Promise<AutomationExecutionRecord>;
}

export function createQepAutomation(
  ports: QepAutomationPorts = {},
): QepAutomationFacade {
  const platformRef: { current?: PlatformAutomation } = {};
  const platform = createPlatformAutomation({
    playwrightDryRun: ports.playwrightDryRun ?? true,
    publishEvent: async (event) => {
      await ports.onEvent?.(event);
      if (event.type === "platform.automation.evidence.published") {
        const record = platformRef.current?.engine.getExecution(event.executionId);
        if (record) {
          await ports.onEvidencePublished?.(record);
        }
      }
    },
  });
  platformRef.current = platform;

  return {
    platform,
    listProviders: () => platform.registry.list(),
    listExecutions: (tenantId) => platform.engine.listExecutions(tenantId),
    getExecution: (id) => platform.engine.getExecution(id),
    enqueue: (request) => platform.engine.enqueue(request),
    run: (id) => platform.engine.run(id),
    enqueueAndRun: (request) => platform.engine.enqueueAndRun(request),
    cancel: (id) => platform.engine.cancel(id),
  };
}
