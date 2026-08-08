import {
  createPlatformScm,
  type PlatformScm,
  type RegisterRepositoryRequest,
  type RepositoryStore,
  type ScmDomainEvent,
  type ScmProviderId,
  type ScmAuthCredentials,
} from "@apzhub/platform-scm";

export interface QepScmPorts {
  readonly onEvent?: (event: ScmDomainEvent) => void | Promise<void>;
  /** Hook for Automation / Evidence / QKI / Notifications — no duplication. */
  readonly onScmEvent?: (event: ScmDomainEvent) => void | Promise<void>;
  readonly githubOffline?: boolean;
  readonly webhookSecrets?: Readonly<Partial<Record<ScmProviderId, string>>>;
  readonly store?: RepositoryStore;
}

export interface QepScmFacade {
  readonly platform: PlatformScm;
  listProviders(): ReturnType<PlatformScm["registry"]["list"]>;
  listRepositories(
    tenantId?: string,
  ): ReturnType<PlatformScm["engine"]["listRepositories"]>;
  getRepository(id: string): ReturnType<PlatformScm["engine"]["getRepository"]>;
  registerRepository(
    request: RegisterRepositoryRequest,
  ): ReturnType<PlatformScm["engine"]["registerRepository"]>;
  setRepositoryState(
    repositoryId: string,
    state: "enabled" | "disabled",
    actorId: string,
  ): ReturnType<PlatformScm["engine"]["setRepositoryState"]>;
  connectProvider(
    tenantId: string,
    providerId: ScmProviderId,
    correlationId: string,
    credentials?: ScmAuthCredentials,
  ): ReturnType<PlatformScm["engine"]["connectProvider"]>;
  validateConnection(
    tenantId: string,
    providerId: ScmProviderId,
    correlationId: string,
    credentials?: ScmAuthCredentials,
  ): ReturnType<PlatformScm["engine"]["validateConnection"]>;
  syncRepository(
    repositoryId: string,
    correlationId: string,
  ): ReturnType<PlatformScm["engine"]["syncRepository"]>;
  ingestWebhook(
    input: Parameters<PlatformScm["engine"]["ingestWebhook"]>[0],
  ): ReturnType<PlatformScm["engine"]["ingestWebhook"]>;
  listWebhookAudits(
    tenantId?: string,
  ): ReturnType<PlatformScm["engine"]["listWebhookAudits"]>;
  addTraceabilityLink(
    input: Parameters<PlatformScm["engine"]["addTraceabilityLink"]>[0],
  ): ReturnType<PlatformScm["engine"]["addTraceabilityLink"]>;
  listTraceabilityLinks(
    repositoryId?: string,
  ): ReturnType<PlatformScm["engine"]["listTraceabilityLinks"]>;
}

export function createQepScm(ports: QepScmPorts = {}): QepScmFacade {
  const platform = createPlatformScm({
    githubOffline: ports.githubOffline ?? true,
    webhookSecrets: ports.webhookSecrets,
    store: ports.store,
    publishEvent: async (event) => {
      await ports.onEvent?.(event);
      await ports.onScmEvent?.(event);
    },
  });

  return {
    platform,
    listProviders: () => platform.registry.list(),
    listRepositories: (tenantId) => platform.engine.listRepositories(tenantId),
    getRepository: (id) => platform.engine.getRepository(id),
    registerRepository: (request) => platform.engine.registerRepository(request),
    setRepositoryState: (id, state, actorId) =>
      platform.engine.setRepositoryState(id, state, actorId),
    connectProvider: (tenantId, providerId, correlationId, credentials) =>
      platform.engine.connectProvider(tenantId, providerId, correlationId, credentials),
    validateConnection: (tenantId, providerId, correlationId, credentials) =>
      platform.engine.validateConnection(
        tenantId,
        providerId,
        correlationId,
        credentials,
      ),
    syncRepository: (repositoryId, correlationId) =>
      platform.engine.syncRepository(repositoryId, correlationId),
    ingestWebhook: (input) => platform.engine.ingestWebhook(input),
    listWebhookAudits: (tenantId) => platform.engine.listWebhookAudits(tenantId),
    addTraceabilityLink: (input) => platform.engine.addTraceabilityLink(input),
    listTraceabilityLinks: (repositoryId) =>
      platform.engine.listTraceabilityLinks(repositoryId),
  };
}
