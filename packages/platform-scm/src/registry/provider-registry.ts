import type { ScmProvider, ScmProviderId } from "../contracts/provider";
import type { ScmProviderDescriptor } from "../contracts/repository";

export class ScmProviderRegistry {
  private readonly providers = new Map<ScmProviderId, ScmProvider>();

  register(provider: ScmProvider): void {
    this.providers.set(provider.descriptor.providerId, provider);
  }

  get(providerId: ScmProviderId): ScmProvider | undefined {
    return this.providers.get(providerId);
  }

  require(providerId: ScmProviderId): ScmProvider {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`SCM provider not registered: ${providerId}`);
    }
    return provider;
  }

  list(): readonly ScmProviderDescriptor[] {
    return [...this.providers.values()].map((provider) => provider.descriptor);
  }

  listActive(): readonly ScmProviderDescriptor[] {
    return this.list().filter((descriptor) => descriptor.status === "active");
  }
}
