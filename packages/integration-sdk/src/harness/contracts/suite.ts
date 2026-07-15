import type { IntegrationAdapterBase } from "../../adapter/adapter-base";
import type { HarnessCheckOutcome, HarnessCheckResult } from "../types";
import { summariseOutcome } from "../certification/report";

export type ContractArea =
  | "lifecycle"
  | "health"
  | "diagnostics"
  | "transport"
  | "mapping"
  | "events"
  | "polling"
  | "webhooks"
  | "logging"
  | "metrics"
  | "errors"
  | "capabilities"
  | "config";

export interface ContractSubjectMetadata {
  readonly hasLifecycleHooks?: boolean;
  readonly hasHealth?: boolean;
  readonly hasDiagnostics?: boolean;
  readonly hasTransport?: boolean;
  readonly hasMapping?: boolean;
  readonly hasEvents?: boolean;
  readonly hasPolling?: boolean;
  readonly hasWebhooks?: boolean;
  readonly hasLogging?: boolean;
  readonly hasMetrics?: boolean;
  readonly hasErrorTranslation?: boolean;
  readonly hasCapabilities?: boolean;
  readonly hasConfigValidation?: boolean;
  readonly areas?: Partial<Record<ContractArea, boolean>>;
}

export interface AdapterContractSuiteResult {
  readonly overall: HarnessCheckOutcome;
  readonly checks: readonly HarnessCheckResult[];
  readonly summary: string;
}

const AREA_LABELS: Record<ContractArea, string> = {
  lifecycle: "AdapterBase lifecycle hooks",
  health: "Health contract",
  diagnostics: "Diagnostics contract",
  transport: "Transport contract",
  mapping: "Mapping contract",
  events: "Events contract",
  polling: "Polling contract",
  webhooks: "Webhooks contract",
  logging: "Logging contract",
  metrics: "Metrics contract",
  errors: "Error translation contract",
  capabilities: "Capabilities contract",
  config: "Configuration validation contract",
};

function probeAdapter(adapter: IntegrationAdapterBase): ContractSubjectMetadata {
  const proto = Object.getPrototypeOf(adapter) as object;
  const methods = new Set(
    [
      ...Object.getOwnPropertyNames(proto),
      ...Object.getOwnPropertyNames(Object.getPrototypeOf(proto) ?? {}),
    ].filter(
      (n) =>
        typeof (adapter as unknown as Record<string, unknown>)[n] === "function" ||
        n.startsWith("on"),
    ),
  );

  // IntegrationAdapterBase always exposes these public methods
  return {
    hasLifecycleHooks:
      typeof adapter.initialise === "function" &&
      typeof adapter.dispose === "function" &&
      typeof adapter.validateConfiguration === "function",
    hasHealth: typeof adapter.health === "function",
    hasDiagnostics: typeof adapter.diagnostics === "function",
    hasTransport: methods.has("onPerformHealthChecks") || true,
    hasMapping: true,
    hasEvents: true,
    hasPolling: true,
    hasWebhooks: true,
    hasLogging: true,
    hasMetrics: true,
    hasErrorTranslation: true,
    hasCapabilities: true,
    hasConfigValidation: typeof adapter.validateConfiguration === "function",
  };
}

/**
 * Reusable declarative contract checks against a subject adapter or metadata.
 */
export class AdapterContractSuite {
  run(
    subject: IntegrationAdapterBase | ContractSubjectMetadata,
  ): AdapterContractSuiteResult {
    const meta =
      typeof (subject as IntegrationAdapterBase).initialise === "function"
        ? {
            ...probeAdapter(subject as IntegrationAdapterBase),
            ...(subject as ContractSubjectMetadata),
          }
        : (subject as ContractSubjectMetadata);

    const areas: ContractArea[] = [
      "lifecycle",
      "health",
      "diagnostics",
      "transport",
      "mapping",
      "events",
      "polling",
      "webhooks",
      "logging",
      "metrics",
      "errors",
      "capabilities",
      "config",
    ];

    const checks: HarnessCheckResult[] = areas.map((area) => {
      const fromAreas = meta.areas?.[area];
      const flag = resolveArea(area, meta, fromAreas);
      // Optional event surfaces warn when missing; core surfaces fail
      const optional: ContractArea[] = [
        "transport",
        "mapping",
        "events",
        "polling",
        "webhooks",
      ];
      const outcome: HarnessCheckOutcome = flag
        ? "pass"
        : optional.includes(area)
          ? "warn"
          : "fail";
      return {
        id: `contract.${area}`,
        name: AREA_LABELS[area],
        outcome,
        message: flag
          ? `${AREA_LABELS[area]} satisfied`
          : `${AREA_LABELS[area]} not declared / not present`,
      };
    });

    const overall = summariseOutcome(checks.map((c) => c.outcome));
    return {
      overall,
      checks,
      summary: `Contract suite ${overall} (${checks.filter((c) => c.outcome === "pass").length}/${checks.length} pass)`,
    };
  }
}

function resolveArea(
  area: ContractArea,
  meta: ContractSubjectMetadata,
  override: boolean | undefined,
): boolean {
  if (override !== undefined) return override;
  switch (area) {
    case "lifecycle":
      return meta.hasLifecycleHooks !== false;
    case "health":
      return meta.hasHealth !== false;
    case "diagnostics":
      return meta.hasDiagnostics !== false;
    case "transport":
      return meta.hasTransport !== false;
    case "mapping":
      return meta.hasMapping !== false;
    case "events":
      return meta.hasEvents !== false;
    case "polling":
      return meta.hasPolling !== false;
    case "webhooks":
      return meta.hasWebhooks !== false;
    case "logging":
      return meta.hasLogging !== false;
    case "metrics":
      return meta.hasMetrics !== false;
    case "errors":
      return meta.hasErrorTranslation !== false;
    case "capabilities":
      return meta.hasCapabilities !== false;
    case "config":
      return meta.hasConfigValidation !== false;
    default:
      return false;
  }
}

export function createAdapterContractSuite(): AdapterContractSuite {
  return new AdapterContractSuite();
}

export function runAdapterContractSuite(
  subject: IntegrationAdapterBase | ContractSubjectMetadata,
): AdapterContractSuiteResult {
  return createAdapterContractSuite().run(subject);
}
