import type { PlatformProviderCapability, ProviderRegistration } from "../types";

/**
 * Registry for platform capability providers.
 * Supports multiple providers per capability with explicit active selection.
 */
export class ProviderRegistry {
  private readonly registrations = new Map<string, ProviderRegistration>();
  private readonly activeByCapability = new Map<PlatformProviderCapability, string>();

  /** Registers a provider. Replaces an existing registration with the same providerId. */
  register<TProvider>(registration: ProviderRegistration<TProvider>): void {
    this.registrations.set(registration.providerId, registration as ProviderRegistration);
  }

  /** Removes a provider by id. Clears active selection when it matches. */
  unregister(providerId: string): boolean {
    const existing = this.registrations.get(providerId);
    if (!existing) {
      return false;
    }

    this.registrations.delete(providerId);

    for (const [capability, activeId] of this.activeByCapability.entries()) {
      if (activeId === providerId) {
        this.activeByCapability.delete(capability);
      }
    }

    return true;
  }

  /** Returns a provider registration by id. */
  getById(providerId: string): ProviderRegistration | undefined {
    return this.registrations.get(providerId);
  }

  /** Lists all registrations, optionally filtered by capability. */
  list(capability?: PlatformProviderCapability): readonly ProviderRegistration[] {
    const all = [...this.registrations.values()];
    return capability ? all.filter((entry) => entry.capability === capability) : all;
  }

  /** Sets the active provider for a capability by provider id. */
  setActiveProvider(capability: PlatformProviderCapability, providerId: string): void {
    const registration = this.registrations.get(providerId);
    if (!registration || registration.capability !== capability) {
      throw new Error(`Provider "${providerId}" is not registered for capability "${capability}"`);
    }

    this.activeByCapability.set(capability, providerId);
  }

  /** Clears explicit active selection — resolution falls back to priority ordering. */
  clearActiveProvider(capability: PlatformProviderCapability): void {
    this.activeByCapability.delete(capability);
  }

  /** Returns the explicitly selected active provider id for a capability. */
  getActiveProviderId(capability: PlatformProviderCapability): string | undefined {
    return this.activeByCapability.get(capability);
  }

  /** Returns enabled registrations for a capability sorted by priority ascending. */
  listCandidates(capability: PlatformProviderCapability): readonly ProviderRegistration[] {
    return this.list(capability)
      .filter((entry) => entry.enabled !== false)
      .sort((left, right) => left.priority - right.priority);
  }
}
