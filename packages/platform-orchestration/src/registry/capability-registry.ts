import type { CapabilityRegistrationRecord } from "../contracts/contracts";
import { OrchestrationError } from "../contracts/errors";

/**
 * Empty registration framework — stores descriptors only.
 * No capability invocation in QO-001.
 */
export class CapabilityRegistry {
  private readonly records = new Map<string, CapabilityRegistrationRecord>();

  register(record: CapabilityRegistrationRecord): void {
    const id = String(record.capabilityId).trim();
    if (!id) {
      throw new OrchestrationError(
        "registry",
        "INVALID_CAPABILITY_ID",
        "capabilityId is required",
      );
    }
    if (this.records.has(id)) {
      throw new OrchestrationError(
        "registry",
        "CAPABILITY_ALREADY_REGISTERED",
        `Capability already registered: ${id}`,
        { capabilityId: id },
      );
    }
    this.records.set(id, { ...record, capabilityId: id });
  }

  get(capabilityId: string): CapabilityRegistrationRecord | undefined {
    return this.records.get(capabilityId);
  }

  list(): readonly CapabilityRegistrationRecord[] {
    return [...this.records.values()];
  }

  count(): number {
    return this.records.size;
  }

  clear(): void {
    this.records.clear();
  }
}
