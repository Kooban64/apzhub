/**
 * Document storage factories (APZDOCS-002).
 * Production requires an explicitly configured provider — no silent memory fallback.
 */

import type { DocumentStorageProvider } from "@apzhub/document-core";
import {
  createDocumentStorageProviderRegistry,
  type DocumentStorageConfig,
  validateDocumentStorageConfig,
} from "@apzhub/document-core";

import { createFilesystemDocumentStorageProvider } from "./filesystem/filesystem-provider";
import { createMemoryDocumentStorageProvider } from "./memory/memory-provider";
import {
  createS3DocumentStorageProvider,
  type DocumentSecretResolver,
  type S3DocumentStorageOptions,
} from "./s3/s3-provider";

export type CreateDocumentStorageForProductionInput = {
  readonly config: DocumentStorageConfig;
  readonly secretResolver?: DocumentSecretResolver;
  readonly s3Client?: S3DocumentStorageOptions["client"];
};

export type CreateDocumentStorageForTestInput = {
  readonly config?: Partial<DocumentStorageConfig>;
  readonly secretResolver?: DocumentSecretResolver;
  readonly s3Client?: S3DocumentStorageOptions["client"];
  /** Explicit opt-in when using memory provider. Default true for tests. */
  readonly allowInMemoryStorage?: boolean;
  readonly provider?: DocumentStorageProvider;
};

export type DocumentStorageBundle = {
  readonly provider: DocumentStorageProvider;
  readonly registry: ReturnType<typeof createDocumentStorageProviderRegistry>;
  readonly config: DocumentStorageConfig;
};

function defaultTestConfig(
  overrides: Partial<DocumentStorageConfig> = {},
): DocumentStorageConfig {
  return {
    mode: "memory_test",
    providerId: "memory",
    maxObjectBytes: 8 * 1024 * 1024,
    checksumAlgorithm: "sha256",
    allowBinaryDeletion: true,
    ...overrides,
  };
}

async function buildProvider(
  config: DocumentStorageConfig,
  options: {
    readonly production: boolean;
    readonly secretResolver?: DocumentSecretResolver;
    readonly s3Client?: S3DocumentStorageOptions["client"];
  },
): Promise<DocumentStorageProvider> {
  const validation = validateDocumentStorageConfig(config, {
    production: options.production,
  });
  if (!validation.ok) {
    throw new Error(`Invalid document storage config: ${validation.errors.join("; ")}`);
  }

  if (config.mode === "memory_test") {
    if (options.production) {
      throw new Error("memory_test storage is forbidden in production");
    }
    const provider = createMemoryDocumentStorageProvider({
      id: config.providerId,
      maxObjectBytes: config.maxObjectBytes,
    });
    await provider.initialise();
    return provider;
  }

  if (config.mode === "filesystem") {
    const provider = createFilesystemDocumentStorageProvider({
      id: config.providerId,
      rootDirectory: config.filesystemRoot!,
      maxObjectBytes: config.maxObjectBytes,
      stagingDirectory: config.stagingDirectory,
    });
    await provider.initialise();
    await provider.validateConfiguration();
    return provider;
  }

  if (config.mode === "s3") {
    if (!options.secretResolver && !options.s3Client) {
      throw new Error(
        "S3 storage requires secretResolver (or injected s3Client for tests)",
      );
    }
    const provider = await createS3DocumentStorageProvider({
      id: config.providerId,
      endpoint: config.s3Endpoint,
      region: config.s3Region!,
      bucket: config.s3Bucket!,
      forcePathStyle: config.s3ForcePathStyle,
      accessKeyRef: config.s3AccessKeyRef ?? "unused",
      secretKeyRef: config.s3SecretKeyRef ?? "unused",
      sessionTokenRef: config.s3SessionTokenRef,
      secretResolver:
        options.secretResolver ??
        ({
          async resolve() {
            throw new Error("secretResolver required");
          },
        } satisfies DocumentSecretResolver),
      maxObjectBytes: config.maxObjectBytes,
      client: options.s3Client,
    });
    await provider.initialise();
    await provider.validateConfiguration();
    return provider;
  }

  throw new Error(
    `Unsupported document storage mode: ${(config as DocumentStorageConfig).mode}`,
  );
}

/**
 * Production storage — configured filesystem or S3 only.
 * Never falls back to in-memory.
 */
export async function createDocumentStorageForProduction(
  input: CreateDocumentStorageForProductionInput,
): Promise<DocumentStorageBundle> {
  if (input.config.mode === "memory_test") {
    throw new Error(
      "createDocumentStorageForProduction forbids memory_test — configure filesystem or s3",
    );
  }
  const provider = await buildProvider(input.config, {
    production: true,
    secretResolver: input.secretResolver,
    s3Client: input.s3Client,
  });
  const registry = createDocumentStorageProviderRegistry();
  registry.register(provider);
  registry.setActive(provider.id);
  return { provider, registry, config: input.config };
}

/**
 * Test storage — in-memory by default; filesystem/S3 when configured.
 */
export async function createDocumentStorageForTest(
  input: CreateDocumentStorageForTestInput = {},
): Promise<DocumentStorageBundle> {
  if (input.provider) {
    const config = defaultTestConfig(input.config);
    const registry = createDocumentStorageProviderRegistry();
    registry.register(input.provider);
    registry.setActive(input.provider.id);
    return { provider: input.provider, registry, config };
  }

  const config = defaultTestConfig(input.config);
  if (config.mode === "memory_test" && input.allowInMemoryStorage === false) {
    throw new Error(
      "In-memory storage denied — set allowInMemoryStorage or configure filesystem/s3",
    );
  }
  if (
    config.mode !== "memory_test" &&
    config.mode !== "filesystem" &&
    config.mode !== "s3"
  ) {
    throw new Error(`Unsupported test storage mode: ${config.mode}`);
  }

  const provider = await buildProvider(config, {
    production: false,
    secretResolver: input.secretResolver,
    s3Client: input.s3Client,
  });
  const registry = createDocumentStorageProviderRegistry();
  registry.register(provider);
  registry.setActive(provider.id);
  return { provider, registry, config };
}
