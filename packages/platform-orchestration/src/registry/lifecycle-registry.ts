import type { OrchestrationKernelState } from "../contracts/state";
import { OrchestrationError } from "../contracts/errors";

export interface LifecycleRegistration {
  readonly registrationId: string;
  readonly name: string;
  readonly states: readonly OrchestrationKernelState[];
  readonly registeredAt: string;
}

/** Framework for registering lifecycle definitions — kernel lifecycle is built-in. */
export class LifecycleRegistry {
  private readonly records = new Map<string, LifecycleRegistration>();

  register(registration: LifecycleRegistration): void {
    const id = registration.registrationId.trim();
    if (!id) {
      throw new OrchestrationError(
        "registry",
        "INVALID_LIFECYCLE_ID",
        "registrationId is required",
      );
    }
    if (this.records.has(id)) {
      throw new OrchestrationError(
        "registry",
        "LIFECYCLE_ALREADY_REGISTERED",
        `Lifecycle already registered: ${id}`,
        { registrationId: id },
      );
    }
    this.records.set(id, { ...registration, registrationId: id });
  }

  get(registrationId: string): LifecycleRegistration | undefined {
    return this.records.get(registrationId);
  }

  list(): readonly LifecycleRegistration[] {
    return [...this.records.values()];
  }

  count(): number {
    return this.records.size;
  }
}
