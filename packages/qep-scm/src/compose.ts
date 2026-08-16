import {
  createPlatformScm,
  type PlatformScm,
  type RegisterRepositoryRequest,
  type RepositoryStore,
  type ScmChangeEventsPersistedHook,
  type ScmDomainEvent,
  type ScmProviderId,
  type ScmAuthCredentials,
} from "@apzhub/platform-scm";

export interface QepScmPorts {
  readonly onEvent?: (event: ScmDomainEvent) => void | Promise<void>;
  /** Hook for Automation / Evidence / QKI / Notifications — no duplication. */
  readonly onScmEvent?: (event: ScmDomainEvent) => void | Promise<void>;
  /** Flagship F9 — after durable change upsert (soft-fail). */
  readonly onChangeEventsPersisted?: ScmChangeEventsPersistedHook;
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
  listChangeEvents(
    filter: Parameters<PlatformScm["engine"]["listChangeEvents"]>[0],
  ): ReturnType<PlatformScm["engine"]["listChangeEvents"]>;
  setDefaultCredentials(
    tenantId: string,
    providerId: ScmProviderId,
    credentials: ScmAuthCredentials,
  ): void;
  listRepositoryBranches(
    repositoryId: string,
    correlationId: string,
  ): ReturnType<PlatformScm["engine"]["listRepositoryBranches"]>;
  listRepositoryCommits(
    repositoryId: string,
    correlationId: string,
    options?: { readonly branch?: string; readonly limit?: number },
  ): ReturnType<PlatformScm["engine"]["listRepositoryCommits"]>;
  listRepositoryTree(
    repositoryId: string,
    correlationId: string,
    options?: { readonly branch?: string; readonly path?: string },
  ): ReturnType<PlatformScm["engine"]["listRepositoryTree"]>;
  getRepositoryFile(
    repositoryId: string,
    correlationId: string,
    options: { readonly path: string; readonly branch?: string },
  ): ReturnType<PlatformScm["engine"]["getRepositoryFile"]>;
  getRepositoryFileDiff(
    repositoryId: string,
    correlationId: string,
    options: {
      readonly path: string;
      readonly baseRef: string;
      readonly headRef: string;
    },
  ): ReturnType<PlatformScm["engine"]["getRepositoryFileDiff"]>;
  createRepositoryBranch(
    repositoryId: string,
    correlationId: string,
    input: { readonly name: string; readonly fromRef: string },
  ): ReturnType<PlatformScm["engine"]["createRepositoryBranch"]>;
  commitRepositoryFiles(
    repositoryId: string,
    correlationId: string,
    input: {
      readonly branch: string;
      readonly message: string;
      readonly files: readonly {
        readonly path: string;
        readonly content: string;
        readonly operation?: "upsert" | "delete";
      }[];
    },
  ): ReturnType<PlatformScm["engine"]["commitRepositoryFiles"]>;
  createRepositoryPullRequest(
    repositoryId: string,
    correlationId: string,
    input: {
      readonly title: string;
      readonly body?: string;
      readonly sourceBranch: string;
      readonly targetBranch: string;
    },
  ): ReturnType<PlatformScm["engine"]["createRepositoryPullRequest"]>;
}

export function createQepScm(ports: QepScmPorts = {}): QepScmFacade {
  const platform = createPlatformScm({
    githubOffline: ports.githubOffline ?? true,
    webhookSecrets: ports.webhookSecrets,
    store: ports.store,
    onChangeEventsPersisted: ports.onChangeEventsPersisted,
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
    listChangeEvents: (filter) => platform.engine.listChangeEvents(filter),
    setDefaultCredentials: (tenantId, providerId, credentials) =>
      platform.engine.setDefaultCredentials(tenantId, providerId, credentials),
    listRepositoryBranches: (repositoryId, correlationId) =>
      platform.engine.listRepositoryBranches(repositoryId, correlationId),
    listRepositoryCommits: (repositoryId, correlationId, options) =>
      platform.engine.listRepositoryCommits(repositoryId, correlationId, options),
    listRepositoryTree: (repositoryId, correlationId, options) =>
      platform.engine.listRepositoryTree(repositoryId, correlationId, options),
    getRepositoryFile: (repositoryId, correlationId, options) =>
      platform.engine.getRepositoryFile(repositoryId, correlationId, options),
    getRepositoryFileDiff: (repositoryId, correlationId, options) =>
      platform.engine.getRepositoryFileDiff(repositoryId, correlationId, options),
    createRepositoryBranch: (repositoryId, correlationId, input) =>
      platform.engine.createRepositoryBranch(repositoryId, correlationId, input),
    commitRepositoryFiles: (repositoryId, correlationId, input) =>
      platform.engine.commitRepositoryFiles(repositoryId, correlationId, input),
    createRepositoryPullRequest: (repositoryId, correlationId, input) =>
      platform.engine.createRepositoryPullRequest(repositoryId, correlationId, input),
  };
}
