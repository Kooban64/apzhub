import type {
  AutomationAdapterInput,
  AutomationAdapterKind,
  AutomationAdapterRegistry,
  AutomationResultAdapter,
} from "@apzhub/testing-contracts";

import { DomainRuleError } from "../../services/errors";
import { createAllureMetadataAdapter } from "./allure-metadata-adapter";
import { createGenericJsonAdapter } from "./generic-json-adapter";
import { createGenericTapAdapter } from "./generic-tap-adapter";
import { createJunitXmlAdapter } from "./junit-xml-adapter";
import { createPlaywrightReportAdapter } from "./playwright-adapter";
import { createVitestAdapter } from "./vitest-adapter";

export function createAutomationAdapterRegistry(
  adapters?: readonly AutomationResultAdapter[],
): AutomationAdapterRegistry {
  const map = new Map<AutomationAdapterKind, AutomationResultAdapter>();

  const registry: AutomationAdapterRegistry = {
    register(adapter) {
      map.set(adapter.kind, adapter);
    },
    get(kind) {
      return map.get(kind);
    },
    list() {
      return [...map.values()];
    },
    resolveForInput(input: AutomationAdapterInput) {
      const matches = [...map.values()].filter((adapter) => adapter.canParse(input));
      if (matches.length === 0) {
        throw new DomainRuleError(
          "ADAPTER_NOT_FOUND",
          "No automation adapter can parse the provided payload",
        );
      }
      // Prefer more specific adapters over generic_json when multiple match.
      const preferred = matches.find((m) => m.kind !== "generic_json") ?? matches[0]!;
      return preferred;
    },
  };

  const defaults =
    adapters ??
    ([
      createVitestAdapter(),
      createPlaywrightReportAdapter(),
      createJunitXmlAdapter(),
      createGenericTapAdapter(),
      createAllureMetadataAdapter(),
      createGenericJsonAdapter(),
    ] as const);

  for (const adapter of defaults) {
    registry.register(adapter);
  }

  return registry;
}

export {
  createVitestAdapter,
  createPlaywrightReportAdapter,
  createJunitXmlAdapter,
  createGenericJsonAdapter,
  createGenericTapAdapter,
  createAllureMetadataAdapter,
};
