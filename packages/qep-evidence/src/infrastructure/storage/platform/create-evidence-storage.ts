/**
 * Evidence Storage Platform factory — APZQEP-120-S03 / ADR-0094.
 *
 * Registers providers and returns EvidenceStorageManager as StoragePort.
 * Active provider is selected from configuration — never hard-coded to Local.
 */

import { EvidenceStorageError } from "../../../shared/errors";
import { createLocalEvidenceStorageProvider } from "../providers/local/local-evidence-storage-provider";
import { createMemoryEvidenceStorageProvider } from "../providers/memory/memory-evidence-storage-provider";
import {
  createEvidenceStorageManager,
  type EvidenceStorageAuditHook,
  type EvidenceStorageManager,
} from "./evidence-storage-manager";
import { createEvidenceStorageProviderRegistry } from "./registry";
import type { EvidenceStoragePlatformConfig } from "./types";

export type CreateEvidenceStorageResult = {
  readonly manager: EvidenceStorageManager;
  readonly config: EvidenceStoragePlatformConfig;
};

export type { EvidenceStorageAuditHook };

function validateConfig(config: EvidenceStoragePlatformConfig): void {
  if (config.provider !== "memory" && config.provider !== "local") {
    throw new EvidenceStorageError(
      "STORAGE_PROVIDER_UNKNOWN",
      "Storage provider kind is not available",
    );
  }
  if (config.provider === "local") {
    const root = config.local?.rootDirectory?.trim();
    if (!root) {
      throw new EvidenceStorageError(
        "STORAGE_INVALID_REQUEST",
        "Local storage root directory is required",
      );
    }
  }
}

function assemble(
  config: EvidenceStoragePlatformConfig,
  options?: {
    readonly onAudit?: EvidenceStorageAuditHook;
  },
) {
  validateConfig(config);

  const registry = createEvidenceStorageProviderRegistry();

  const memory = createMemoryEvidenceStorageProvider({
    maxObjectBytes: config.memory?.maxObjectBytes,
  });
  registry.register(memory);

  if (config.local?.rootDirectory?.trim()) {
    registry.register(
      createLocalEvidenceStorageProvider({
        rootDirectory: config.local.rootDirectory,
        maxObjectBytes: config.local.maxObjectBytes,
      }),
    );
  } else if (config.provider === "local") {
    throw new EvidenceStorageError(
      "STORAGE_INVALID_REQUEST",
      "Local storage root directory is required",
    );
  }

  const active = registry.getByKind(config.provider);
  const manager = createEvidenceStorageManager({
    registry,
    config,
    onAudit: options?.onAudit,
  });

  return { manager, config, active };
}

/**
 * Build the Storage Platform and initialise the active provider.
 */
export async function createEvidenceStorage(
  config: EvidenceStoragePlatformConfig,
  options?: {
    readonly onAudit?: EvidenceStorageAuditHook;
  },
): Promise<CreateEvidenceStorageResult> {
  const { manager, config: cfg, active } = assemble(config, options);
  await active.initialise();
  return { manager, config: cfg };
}

/**
 * Synchronous factory for DI bootstrap.
 */
export function createEvidenceStorageSync(
  config: EvidenceStoragePlatformConfig,
  options?: {
    readonly onAudit?: EvidenceStorageAuditHook;
  },
): CreateEvidenceStorageResult {
  const { manager, config: cfg, active } = assemble(config, options);
  if (active.initialiseSync) {
    active.initialiseSync();
  }
  return { manager, config: cfg };
}

/**
 * Resolve platform config from environment (LA / ops).
 * Defaults to memory when unset — Local is never assumed.
 */
export function resolveEvidenceStorageConfigFromEnv(
  env: Record<string, string | undefined> = process.env,
): EvidenceStoragePlatformConfig {
  const providerRaw = (env.APZQEP_EVIDENCE_STORAGE_PROVIDER ?? "memory")
    .trim()
    .toLowerCase();
  const provider = providerRaw === "local" ? ("local" as const) : ("memory" as const);

  const maxRaw = env.APZQEP_EVIDENCE_STORAGE_MAX_BYTES;
  const maxObjectBytes = maxRaw ? Number(maxRaw) : undefined;
  const safeMax =
    maxObjectBytes !== undefined &&
    Number.isFinite(maxObjectBytes) &&
    maxObjectBytes > 0
      ? maxObjectBytes
      : undefined;

  if (provider === "local") {
    return {
      provider: "local",
      local: {
        rootDirectory: env.APZQEP_EVIDENCE_STORAGE_ROOT ?? "",
        maxObjectBytes: safeMax,
      },
    };
  }

  return {
    provider: "memory",
    memory: { maxObjectBytes: safeMax },
  };
}
