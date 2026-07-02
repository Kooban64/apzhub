import type { HealthProvider } from "../interfaces/types";
import { createConfigurationHealthProvider } from "../implementation/providers/configuration-provider";
import { createLifecycleHealthProvider } from "../implementation/providers/lifecycle-provider";
import { createRegistryHealthProvider } from "../implementation/providers/registry-provider";
import { createRuntimeHealthProvider } from "../implementation/providers/runtime-provider";

export function createDefaultHealthProviders(): readonly HealthProvider[] {
  return [
    createRuntimeHealthProvider(),
    createConfigurationHealthProvider(),
    createRegistryHealthProvider(),
    createLifecycleHealthProvider(),
  ];
}
