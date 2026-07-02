import { withCapabilityLifecycleState } from "../capability/factory";
import type { Capability } from "../capability/types";
import { validateCapabilityManifest } from "../manifest-engine/validate";
import { satisfiesPlatformVersion } from "../version-manager/semver";
import { registryError } from "./errors";
import { RegistryOperationGuard } from "./guard";
import { CapabilityRegistryStore } from "./store";
import type {
  CapabilityRegistryExtensionPoints,
  RegisteredCapabilityRecord,
  RegistrationOptions,
  RegistrationResult,
  RegistrySnapshot,
  RuntimeStatus,
} from "./types";
import type {
  CapabilityHealthState,
  CapabilityLifecycleState,
} from "../capability/types";
import type { CapabilityKind } from "../manifest-engine/capability-kinds";

function getPlatformVersionConstraint(
  manifest: Capability["manifest"],
): string | undefined {
  return "compatibility" in manifest
    ? manifest.compatibility?.platformVersion
    : undefined;
}

function toRegisteredRecord(
  capability: Capability,
  _platformVersion: string,
): RegisteredCapabilityRecord {
  const registered = withCapabilityLifecycleState(capability, "registered");
  return {
    id: registered.id,
    name: registered.manifest.name,
    kind: registered.kind,
    version: registered.version,
    lifecycleState: registered.lifecycleState,
    healthState: registered.healthState,
    dependencies: registered.dependencies,
    metadata: registered.metadata,
    manifest: registered.manifest,
    registrationTimestamp: new Date().toISOString(),
    platformVersionCompatibility: getPlatformVersionConstraint(registered.manifest),
    runtimeStatus: "registered",
  };
}

function validateRegistrationPreconditions(
  capability: Capability,
  options: RegistrationOptions,
): RegistrationResult | null {
  const errors = [];

  if (!capability.id) {
    errors.push(
      registryError("REGISTRY_INVALID_INPUT", "Capability id is required", {
        field: "id",
      }),
    );
  }

  if (capability.lifecycleState !== "dependencies-resolved") {
    errors.push(
      registryError(
        "REGISTRY_INVALID_LIFECYCLE",
        `Capability "${capability.id}" must be in "dependencies-resolved" state before registration (got "${capability.lifecycleState}")`,
        { capabilityId: capability.id, field: "lifecycleState" },
      ),
    );
  }

  const manifestResult = validateCapabilityManifest(capability.manifest);
  if (!manifestResult.success) {
    errors.push(
      registryError(
        "REGISTRY_MANIFEST_INVALID",
        manifestResult.errors[0]?.message ?? "Manifest validation failed",
        { capabilityId: capability.id, field: manifestResult.errors[0]?.field },
      ),
    );
  }

  const platformConstraint = getPlatformVersionConstraint(capability.manifest);
  if (!satisfiesPlatformVersion(platformConstraint, options.platformVersion)) {
    errors.push(
      registryError(
        "REGISTRY_VERSION_INCOMPATIBLE",
        `Capability "${capability.id}" requires platform version ${platformConstraint ?? "unknown"}, current is ${options.platformVersion}`,
        { capabilityId: capability.id, field: "compatibility.platformVersion" },
      ),
    );
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return null;
}

/**
 * Capability Registry — runtime catalogue of platform capabilities.
 *
 * **Responsibilities:** registration, lookup, runtime metadata, lifecycle/health recording.
 * **Not responsible for:** discovery, manifest parsing, dependency resolution, health probes.
 *
 * **Thread safety:** single-process synchronous implementation. See `RegistryOperationGuard`.
 *
 * **Extension points:** `CapabilityRegistryExtensionPoints` for hot-reload and distributed registry (future).
 */
export class CapabilityRegistry {
  private readonly store = new CapabilityRegistryStore();
  private readonly guard = new RegistryOperationGuard();
  private platformVersion: string;
  private readonly extensions: CapabilityRegistryExtensionPoints;

  constructor(
    platformVersion: string,
    extensions: CapabilityRegistryExtensionPoints = {},
  ) {
    this.platformVersion = platformVersion;
    this.extensions = extensions;
  }

  register(capability: Capability, options?: RegistrationOptions): RegistrationResult {
    const resolvedOptions = options ?? { platformVersion: this.platformVersion };

    if (this.store.has(capability.id)) {
      return {
        success: false,
        errors: [
          registryError(
            "REGISTRY_DUPLICATE_ID",
            `Capability "${capability.id}" is already registered`,
            { capabilityId: capability.id },
          ),
        ],
      };
    }

    const preconditionFailure = validateRegistrationPreconditions(
      capability,
      resolvedOptions,
    );
    if (preconditionFailure) {
      return preconditionFailure;
    }

    const record = toRegisteredRecord(capability, resolvedOptions.platformVersion);

    if (this.extensions.beforeRegister && !this.extensions.beforeRegister(record)) {
      return {
        success: false,
        errors: [
          registryError(
            "REGISTRY_INVALID_INPUT",
            `Registration vetoed for capability "${capability.id}"`,
            { capabilityId: capability.id },
          ),
        ],
      };
    }

    this.store.insert(record);
    return { success: true, record };
  }

  /**
   * Register capabilities preserving dependency-first order.
   * Caller should supply capabilities already topologically sorted.
   */
  registerMany(
    capabilities: readonly Capability[],
    options?: RegistrationOptions,
    order?: readonly string[],
  ): RegistrationResult {
    if (capabilities.length === 0) {
      return {
        success: false,
        errors: [
          registryError(
            "REGISTRY_INVALID_INPUT",
            "Cannot register an empty capability batch",
          ),
        ],
      };
    }

    const resolvedOptions = options ?? { platformVersion: this.platformVersion };
    const sorted =
      order && order.length > 0
        ? order
            .map((id) => capabilities.find((c) => c.id === id))
            .filter((c): c is Capability => c !== undefined)
        : [...capabilities].sort((a, b) => a.id.localeCompare(b.id));

    const registeredIds: string[] = [];

    for (const capability of sorted) {
      const result = this.register(capability, resolvedOptions);
      if (!result.success) {
        for (const id of registeredIds) {
          this.unregister(id);
        }
        return result;
      }
      registeredIds.push(capability.id);
    }

    const lastId = registeredIds.at(-1);
    const record = lastId ? this.store.get(lastId) : undefined;
    if (!record) {
      return {
        success: false,
        errors: [
          registryError(
            "REGISTRY_INVALID_INPUT",
            "Registration batch produced no records",
          ),
        ],
      };
    }

    return { success: true, record };
  }

  unregister(id: string): boolean {
    const removed = this.store.remove(id);
    if (!removed) {
      return false;
    }
    this.extensions.afterUnregister?.(id);
    return true;
  }

  findById(id: string): RegisteredCapabilityRecord | undefined {
    return this.store.get(id);
  }

  findByKind(kind: CapabilityKind): RegisteredCapabilityRecord[] {
    return this.store.getByKind(kind);
  }

  findAll(): RegisteredCapabilityRecord[] {
    return this.store.getAll();
  }

  exists(id: string): boolean {
    return this.store.has(id);
  }

  count(): number {
    return this.store.count();
  }

  getLifecycleState(id: string): CapabilityLifecycleState | undefined {
    return this.store.get(id)?.lifecycleState;
  }

  getHealth(id: string): CapabilityHealthState | undefined {
    return this.store.get(id)?.healthState;
  }

  updateHealth(id: string, healthState: CapabilityHealthState): boolean {
    const existing = this.store.get(id);
    if (!existing) return false;

    const order = this.store.getRegistrationOrder();
    const index = order.indexOf(id);
    const previousId = index > 0 ? order[index - 1] : undefined;

    this.store.remove(id);
    this.store.insert({ ...existing, healthState }, previousId);
    return true;
  }

  updateLifecycleState(id: string, lifecycleState: CapabilityLifecycleState): boolean {
    const existing = this.store.get(id);
    if (!existing) return false;

    const order = this.store.getRegistrationOrder();
    const index = order.indexOf(id);
    const previousId = index > 0 ? order[index - 1] : undefined;

    this.store.remove(id);
    this.store.insert({ ...existing, lifecycleState }, previousId);
    return true;
  }

  updateRuntimeStatus(id: string, runtimeStatus: RuntimeStatus): boolean {
    const existing = this.store.get(id);
    if (!existing) return false;

    const order = this.store.getRegistrationOrder();
    const index = order.indexOf(id);
    const previousId = index > 0 ? order[index - 1] : undefined;

    this.store.remove(id);
    this.store.insert({ ...existing, runtimeStatus }, previousId);
    return true;
  }

  clear(): void {
    this.store.clear();
    this.guard.bumpGeneration();
  }

  snapshot(): RegistrySnapshot {
    const capabilities = this.findAll();
    const capabilitiesByKind: Record<string, number> = {};
    const lifecycleSummary: Partial<Record<CapabilityLifecycleState, number>> = {};
    const healthSummary: Partial<Record<CapabilityHealthState, number>> = {};

    for (const record of capabilities) {
      capabilitiesByKind[record.kind] = (capabilitiesByKind[record.kind] ?? 0) + 1;
      lifecycleSummary[record.lifecycleState] =
        (lifecycleSummary[record.lifecycleState] ?? 0) + 1;
      healthSummary[record.healthState] = (healthSummary[record.healthState] ?? 0) + 1;
    }

    return {
      platformVersion: this.platformVersion,
      capabilityCount: capabilities.length,
      capabilitiesByKind,
      lifecycleSummary,
      healthSummary,
      registryTimestamp: new Date().toISOString(),
      capabilities,
    };
  }

  getRegistrationOrder(): readonly string[] {
    return this.store.getRegistrationOrder();
  }

  getStoreGeneration(): number {
    return this.guard.getGeneration();
  }

  setPlatformVersion(platformVersion: string): void {
    this.platformVersion = platformVersion;
  }
}

export function createCapabilityRegistry(
  platformVersion: string,
  extensions?: CapabilityRegistryExtensionPoints,
): CapabilityRegistry {
  return new CapabilityRegistry(platformVersion, extensions);
}
