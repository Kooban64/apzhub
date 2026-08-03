import type { AutomationProvider, AutomationProviderId } from "../contracts/provider";
import type { AutomationProviderDescriptor } from "../contracts/execution";

export class ProviderRegistry {
  private readonly providers = new Map<AutomationProviderId, AutomationProvider>();

  register(provider: AutomationProvider): void {
    const id = provider.descriptor.providerId;
    if (this.providers.has(id)) {
      throw new Error(`Automation provider already registered: ${id}`);
    }
    this.providers.set(id, provider);
  }

  get(providerId: AutomationProviderId): AutomationProvider | undefined {
    return this.providers.get(providerId);
  }

  require(providerId: AutomationProviderId): AutomationProvider {
    const provider = this.get(providerId);
    if (!provider) {
      throw new Error(`Unknown automation provider: ${providerId}`);
    }
    return provider;
  }

  list(): readonly AutomationProviderDescriptor[] {
    return [...this.providers.values()].map((p) => p.descriptor);
  }

  listActive(): readonly AutomationProviderDescriptor[] {
    return this.list().filter((d) => d.status === "active");
  }
}
