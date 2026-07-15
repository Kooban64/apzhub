import type { AdapterBootstrapConfiguration, AdapterContext } from "../adapter";
import type { IntegrationRequestContext } from "../types";
import type { MockAdapter } from "../adapter/mock-adapter";

/** Outcome for certification, compliance, and CI check aggregates. */
export type HarnessCheckOutcome = "pass" | "fail" | "warn" | "skip";

export interface HarnessCheckResult {
  readonly id: string;
  readonly name: string;
  readonly outcome: HarnessCheckOutcome;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export interface HarnessCategoryResult {
  readonly category: string;
  readonly outcome: HarnessCheckOutcome;
  readonly checks: readonly HarnessCheckResult[];
  readonly summary: string;
}

/** Declared package structure for compliance / boundary without filesystem access. */
export interface AdapterPackageStructure {
  readonly vendorId: string;
  readonly packageName: string;
  readonly version: string;
  readonly files: Readonly<Record<string, string>>;
  readonly declaredCapabilities?: readonly string[];
  readonly dependencies?: Readonly<Record<string, string>>;
  readonly requiredInterfaces?: readonly string[];
  readonly docsPresent?: readonly string[];
}

export interface AdapterHarnessOptions {
  readonly configuration?: AdapterBootstrapConfiguration;
  readonly autoInitialise?: boolean;
  readonly contextOverrides?: Partial<AdapterContext>;
  readonly fixtures?: Readonly<Record<string, unknown>>;
}

export interface AdapterHarnessState {
  readonly adapter: MockAdapter;
  readonly context: AdapterContext;
  readonly configuration: AdapterBootstrapConfiguration;
  readonly fixtures: Readonly<Record<string, unknown>>;
  readonly booted: boolean;
}

export interface ScaffoldAdapterInput {
  readonly vendorId: string;
  readonly displayName: string;
  readonly packageVersion?: string;
  readonly capabilityId?: string;
  readonly declaredCapabilities?: readonly string[];
  readonly description?: string;
  readonly owner?: string;
}

export interface AdapterFixtureSet {
  readonly requestContexts: Readonly<Record<string, IntegrationRequestContext>>;
  readonly payloads: Readonly<Record<string, unknown>>;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export type AdapterFileMap = Readonly<Record<string, string>>;
