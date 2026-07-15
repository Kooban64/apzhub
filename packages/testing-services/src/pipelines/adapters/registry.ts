import type {
  PipelineAdapterRegistry,
  PipelineProviderKind,
  PipelineResultAdapter,
} from "@apzhub/testing-contracts";

import { DomainRuleError } from "../../services/errors";
import { createGenericCiAdapter } from "./generic-ci-adapter";

export function createPipelineAdapterRegistry(
  adapters?: readonly PipelineResultAdapter[],
): PipelineAdapterRegistry {
  const map = new Map<PipelineProviderKind, PipelineResultAdapter>();

  const registry: PipelineAdapterRegistry = {
    register(adapter) {
      map.set(adapter.kind, adapter);
    },
    get(kind) {
      return map.get(kind);
    },
    list() {
      return [...map.values()];
    },
    resolveForInput(input: unknown) {
      const matches = [...map.values()].filter((adapter) => adapter.canParse(input));
      if (matches.length === 0) {
        throw new DomainRuleError(
          "ADAPTER_NOT_FOUND",
          "No pipeline adapter can parse the provided payload",
        );
      }
      return matches[0]!;
    },
  };

  const defaults = adapters ?? ([createGenericCiAdapter()] as const);
  for (const adapter of defaults) {
    registry.register(adapter);
  }

  return registry;
}

export { createGenericCiAdapter };
