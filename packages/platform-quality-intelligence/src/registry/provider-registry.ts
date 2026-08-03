import type {
  IntelligenceProvider,
  IntelligenceProviderDescriptor,
  IntelligenceProviderId,
} from "../contracts/provider";

export class IntelligenceProviderRegistry {
  private readonly providers = new Map<IntelligenceProviderId, IntelligenceProvider>();

  register(provider: IntelligenceProvider): void {
    this.providers.set(provider.descriptor.providerId, provider);
  }

  get(providerId: IntelligenceProviderId): IntelligenceProvider | undefined {
    return this.providers.get(providerId);
  }

  require(providerId: IntelligenceProviderId): IntelligenceProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Quality intelligence provider not registered: ${providerId}`);
    }
    return provider;
  }

  list(): readonly IntelligenceProviderDescriptor[] {
    return [...this.providers.values()].map((provider) => provider.descriptor);
  }

  listActive(): readonly IntelligenceProviderDescriptor[] {
    return this.list().filter((descriptor) => descriptor.status === "active");
  }
}
