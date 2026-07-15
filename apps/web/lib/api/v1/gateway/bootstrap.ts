import { createInMemoryAuthorizationService } from "@apzhub/platform-authorization";
import { getDb } from "@apzhub/config/db";
import type { PlatformServiceGateway } from "@apzhub/platform-services";
import {
  createPlatformServices,
  createPlatformServicesFromEnv,
  createEntityMappingStore,
  createTestingPlatformServicesForProduction,
  createDocumentPlatformServicesForProduction,
  createDocumentPlatformServicesForTest,
  createSearchPlatformServicesForProduction,
  PlatformAuthorizationAccessResolver,
  ProviderRegistry,
  resolveAuthorizationProviderMode,
  assertAuthorizationProviderModeAllowed,
  PLATFORM_SERVICES_VERSION,
  isTestingServiceEnabled,
  isDocumentServiceEnabled,
  isSearchServiceEnabled,
  isSearchExecutionMeilisearchConfigured,
  createSearchExecutionServicesForProduction,
} from "@apzhub/platform-services";
import type {
  TestingPlatformServicesBundle,
  TestingReadinessIndicators,
  DocumentPlatformServicesBundle,
  SearchPlatformServicesBundle,
  SearchExecutionServicesBundle,
} from "@apzhub/platform-services";
import type { DocumentStorageConfig } from "@apzhub/document-core";

export interface PlatformApiGatewayBootstrap {
  readonly gateway: PlatformServiceGateway;
  readonly mappingStoreMode: string;
  readonly authorizationMode: string;
  readonly providersRegistered: boolean;
  readonly planeEnabled: boolean;
  readonly zammadEnabled: boolean;
  readonly testingEnabled: boolean;
  readonly documentsEnabled: boolean;
  readonly searchEnabled: boolean;
  readonly searchExecutionEnabled: boolean;
  readonly testingReadiness?: TestingReadinessIndicators;
  readonly documentsReadiness?: DocumentPlatformServicesBundle["readiness"];
  readonly searchReadiness?: SearchPlatformServicesBundle["readiness"];
  readonly searchExecutionReadiness?: SearchExecutionServicesBundle["readiness"];
  readonly platformServicesVersion: string;
}

type GatewayHolder = {
  promise?: Promise<PlatformApiGatewayBootstrap>;
  override?: PlatformApiGatewayBootstrap;
};

const globalForGateway = globalThis as typeof globalThis & {
  __apzhubPlatformApiGateway?: GatewayHolder;
};

function holder(): GatewayHolder {
  if (!globalForGateway.__apzhubPlatformApiGateway) {
    globalForGateway.__apzhubPlatformApiGateway = {};
  }
  return globalForGateway.__apzhubPlatformApiGateway;
}

function isPlaneEnabled(): boolean {
  return process.env.PLANE_INTEGRATION_ENABLED === "true";
}

function isZammadEnabled(): boolean {
  return process.env.ZAMMAD_INTEGRATION_ENABLED === "true";
}

function createTestingServicesBundle(): TestingPlatformServicesBundle {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "TESTING_SERVICE_ENABLED=true requires DATABASE_URL for Testing PostgreSQL persistence",
    );
  }

  return createTestingPlatformServicesForProduction({ postgresDb: getDb() });
}

function resolveDocumentStorageConfig(
  env: NodeJS.ProcessEnv,
): DocumentStorageConfig {
  const mode = (env.DOCUMENT_STORAGE_MODE ?? "filesystem") as
    | "filesystem"
    | "s3";
  const maxObjectBytes = Number(
    env.DOCUMENT_STORAGE_MAX_OBJECT_BYTES ?? 64 * 1024 * 1024,
  );
  if (mode === "s3") {
    return {
      mode: "s3",
      providerId: env.DOCUMENT_STORAGE_PROVIDER_ID ?? "s3",
      s3Endpoint: env.DOCUMENT_STORAGE_S3_ENDPOINT,
      s3Region: env.DOCUMENT_STORAGE_S3_REGION ?? "eu-west-1",
      s3Bucket: env.DOCUMENT_STORAGE_S3_BUCKET ?? "",
      s3ForcePathStyle: env.DOCUMENT_STORAGE_S3_FORCE_PATH_STYLE === "true",
      s3AccessKeyRef: env.DOCUMENT_STORAGE_S3_ACCESS_KEY_REF ?? "",
      s3SecretKeyRef: env.DOCUMENT_STORAGE_S3_SECRET_KEY_REF ?? "",
      s3SessionTokenRef: env.DOCUMENT_STORAGE_S3_SESSION_TOKEN_REF,
      maxObjectBytes,
      checksumAlgorithm: "sha256",
      allowBinaryDeletion: env.DOCUMENT_STORAGE_ALLOW_BINARY_DELETION === "true",
    };
  }
  return {
    mode: "filesystem",
    providerId: env.DOCUMENT_STORAGE_PROVIDER_ID ?? "filesystem",
    filesystemRoot:
      env.DOCUMENT_STORAGE_FILESYSTEM_ROOT ?? "/var/lib/apzhub/documents",
    allowFilesystemInProduction:
      env.DOCUMENT_STORAGE_ALLOW_FILESYSTEM_IN_PRODUCTION === "true",
    maxObjectBytes,
    checksumAlgorithm: "sha256",
    allowBinaryDeletion: env.DOCUMENT_STORAGE_ALLOW_BINARY_DELETION === "true",
    stagingDirectory: env.DOCUMENT_STORAGE_STAGING_DIRECTORY,
  };
}

async function createDocumentServicesBundle(): Promise<DocumentPlatformServicesBundle> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DOCUMENT_SERVICE_ENABLED=true requires DATABASE_URL for Document PostgreSQL persistence",
    );
  }
  const storageConfig = resolveDocumentStorageConfig(process.env);
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.DOCUMENT_STORAGE_ALLOW_TEST_MEMORY === "true"
  ) {
    return createDocumentPlatformServicesForTest({
      postgresDb: getDb(),
      allowInMemoryStorage: true,
      storageConfig: { mode: "memory_test", providerId: "memory" },
    });
  }
  return createDocumentPlatformServicesForProduction({
    postgresDb: getDb(),
    storageConfig,
  });
}

function createSearchServicesBundle(): SearchPlatformServicesBundle {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "SEARCH_SERVICE_ENABLED=true requires DATABASE_URL for Search PostgreSQL persistence",
    );
  }
  return createSearchPlatformServicesForProduction({
    postgresDb: getDb(),
  });
}

async function createSearchExecutionServicesBundle(): Promise<
  SearchExecutionServicesBundle | undefined
> {
  if (!isSearchServiceEnabled(process.env)) {
    return undefined;
  }
  if (!isSearchExecutionMeilisearchConfigured(process.env)) {
    // Management may be on while execution remains unavailable (controlled).
    return undefined;
  }
  return createSearchExecutionServicesForProduction({
    env: process.env,
    tenantId: process.env.SEARCH_BOOTSTRAP_TENANT_ID ?? "platform",
    apiKey: process.env.SEARCH_MEILISEARCH_API_KEY,
  });
}

/**
 * Build (or reuse) the process-level PlatformServiceGateway.
 * Production never silently selects allow-all authz or in-memory mapping.
 */
export async function getPlatformApiGatewayBootstrap(): Promise<PlatformApiGatewayBootstrap> {
  const state = holder();
  if (state.override) {
    return state.override;
  }
  if (!state.promise) {
    state.promise = buildPlatformApiGatewayBootstrap().catch((error) => {
      state.promise = undefined;
      throw error;
    });
  }
  return state.promise;
}

export async function getPlatformServiceGateway(): Promise<PlatformServiceGateway> {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  return bootstrap.gateway;
}

/** Test-only override — clears between tests via resetPlatformApiGatewayBootstrap. */
export function setPlatformApiGatewayBootstrapForTests(
  bootstrap: PlatformApiGatewayBootstrap | undefined,
): void {
  const state = holder();
  state.override = bootstrap;
  state.promise = undefined;
}

export function resetPlatformApiGatewayBootstrap(): void {
  const state = holder();
  state.override = undefined;
  state.promise = undefined;
}

async function buildPlatformApiGatewayBootstrap(): Promise<PlatformApiGatewayBootstrap> {
  const authzMode = resolveAuthorizationProviderMode(process.env);
  assertAuthorizationProviderModeAllowed(authzMode.mode, process.env);

  const { service: authorizationService } = createInMemoryAuthorizationService();
  const accessResolver = new PlatformAuthorizationAccessResolver({
    authorizationService,
  });

  const planeEnabled = isPlaneEnabled();
  const zammadEnabled = isZammadEnabled();
  const testingEnabled = isTestingServiceEnabled(process.env);
  const documentsEnabled = isDocumentServiceEnabled(process.env);
  const searchEnabled = isSearchServiceEnabled(process.env);
  let providersRegistered = false;

  // Mapping store from env (postgres in production by default).
  const mappingStore = await createEntityMappingStore();

  // Provider registration is optional — when disabled, registry stays empty
  // and capability calls surface PROVIDER_UNAVAILABLE (readiness reports this).
  const registry = new ProviderRegistry();

  if (planeEnabled) {
    // Dynamic import keeps Plane out of the default cold path when disabled.
    try {
      const { createPlaneAdapter } = await import("@apzhub/integration-plane");
      const { registerPlaneProviders } = await import("@apzhub/platform-services");
      const tenantId = process.env.PLANE_BOOTSTRAP_TENANT_ID ?? "platform";
      const baseUrl = process.env.PLANE_BASE_URL ?? "http://localhost:18085";
      const apiBaseUrl = process.env.PLANE_API_BASE_URL ?? `${baseUrl.replace(/\/$/, "")}/api`;
      const result = await createPlaneAdapter({
        tenantId,
        plane: {
          baseUrl,
          apiBaseUrl,
          apiTokenRef: "plane/api-token",
          workspaceSlug: process.env.PLANE_WORKSPACE_ID ?? "default",
        },
        apiToken: process.env.PLANE_API_TOKEN,
        autoInitialise: false,
      });
      registerPlaneProviders({ registry, planeCore: result.adapter.core });
      providersRegistered = true;
    } catch (error) {
      if (process.env.NODE_ENV === "production") {
        throw error;
      }
      // Dev: allow gateway without live Plane — readiness will report providers=false.
      providersRegistered = false;
    }
  }

  if (zammadEnabled) {
    // Dynamic import keeps Zammad out of the default cold path when disabled.
    try {
      const { createZammadAdapter } = await import("@apzhub/integration-zammad");
      const { registerZammadProviders } = await import("@apzhub/platform-services");
      const tenantId = process.env.ZAMMAD_BOOTSTRAP_TENANT_ID ?? "platform";
      const baseUrl = process.env.ZAMMAD_BASE_URL ?? "http://localhost:3000";
      const apiBaseUrl =
        process.env.ZAMMAD_API_BASE_URL ?? `${baseUrl.replace(/\/$/, "")}/api/v1`;
      const result = await createZammadAdapter({
        tenantId,
        zammad: {
          baseUrl,
          apiBaseUrl,
          apiTokenRef: "zammad/api-token",
        },
        apiToken: process.env.ZAMMAD_API_TOKEN,
        autoInitialise: false,
      });
      registerZammadProviders({ registry, zammadCore: result.adapter.core as never });
      providersRegistered = true;
    } catch (error) {
      if (process.env.NODE_ENV === "production") {
        throw error;
      }
      // Dev: allow gateway without live Zammad — readiness will report providers=false.
    }
  }

  const testing = testingEnabled ? createTestingServicesBundle() : undefined;
  const documents = documentsEnabled
    ? await createDocumentServicesBundle()
    : undefined;
  const searchPlatform = searchEnabled
    ? createSearchServicesBundle()
    : undefined;
  const searchExecution = await createSearchExecutionServicesBundle();

  const bundle = createPlatformServices({
    registry,
    mappingStore,
    accessResolver,
    authorizationMode: authzMode.mode,
    authorizationEnv: process.env,
    testing,
    documents,
    searchPlatform,
    searchExecution,
  });

  return {
    gateway: bundle.gateway,
    mappingStoreMode: process.env.ENTITY_MAPPING_STORE_MODE ?? "default",
    authorizationMode: authzMode.mode,
    providersRegistered,
    planeEnabled,
    zammadEnabled,
    testingEnabled,
    documentsEnabled,
    searchEnabled,
    searchExecutionEnabled: Boolean(searchExecution),
    testingReadiness: testing?.readiness,
    documentsReadiness: documents?.readiness,
    searchReadiness: searchPlatform?.readiness,
    searchExecutionReadiness: searchExecution?.readiness,
    platformServicesVersion: PLATFORM_SERVICES_VERSION,
  };
}

/** Convenience for tests that need a fully mocked gateway without env bootstrap. */
export function createTestPlatformApiGatewayBootstrap(
  gateway: PlatformServiceGateway,
  overrides: Partial<Omit<PlatformApiGatewayBootstrap, "gateway">> = {},
): PlatformApiGatewayBootstrap {
  return {
    gateway,
    mappingStoreMode: overrides.mappingStoreMode ?? "memory",
    authorizationMode: overrides.authorizationMode ?? "allow-all",
    providersRegistered: overrides.providersRegistered ?? true,
    planeEnabled: overrides.planeEnabled ?? false,
    zammadEnabled: overrides.zammadEnabled ?? false,
    testingEnabled: overrides.testingEnabled ?? false,
    documentsEnabled: overrides.documentsEnabled ?? false,
    searchEnabled: overrides.searchEnabled ?? false,
    searchExecutionEnabled: overrides.searchExecutionEnabled ?? false,
    testingReadiness: overrides.testingReadiness,
    documentsReadiness: overrides.documentsReadiness,
    searchReadiness: overrides.searchReadiness,
    searchExecutionReadiness: overrides.searchExecutionReadiness,
    platformServicesVersion: overrides.platformServicesVersion ?? PLATFORM_SERVICES_VERSION,
  };
}

// Re-export for readiness checks that want createPlatformServicesFromEnv semantics.
export { createPlatformServicesFromEnv };
