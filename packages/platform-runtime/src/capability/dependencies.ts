import type { CapabilityDependencies } from "../manifest-engine/schemas/envelope";
import type { NormalisedDependencies } from "./types";

function dedupeSorted(ids: string[]): readonly string[] {
  return [...new Set(ids)].sort();
}

export function normaliseManifestDependencies(
  dependencies: CapabilityDependencies | undefined,
): NormalisedDependencies {
  const platform = dependencies?.platform ?? [];
  const services = dependencies?.services ?? [];
  const integrations = dependencies?.integrations ?? [];
  const modules = dependencies?.modules ?? [];

  return {
    platform: dedupeSorted(platform),
    services: dedupeSorted(services),
    integrations: dedupeSorted(integrations),
    modules: dedupeSorted(modules),
    all: dedupeSorted([...platform, ...services, ...integrations, ...modules]),
  };
}
