import type { IntegrationCapabilityId } from "./capability-types";

/** Adapter manifest contract — mirrors integration.yaml capability declarations. */
export interface AdapterManifest {
  readonly integrationId: string;
  readonly adapterId: string;
  readonly name: string;
  readonly version: string;
  readonly capabilityId?: string;
  readonly declaredCapabilities: readonly IntegrationCapabilityId[];
  readonly owner?: string;
  readonly description?: string;
}

export interface AdapterConnectionDefaults {
  readonly connectionId: string;
  readonly tenantId: string;
  readonly baseUrl: string;
  readonly authenticationMode: import("../auth/types").AuthenticationMode;
  readonly credentialRef: string;
  readonly usernameRef?: string;
  readonly headerName?: string;
  readonly queryParam?: string;
  readonly customScheme?: string;
  readonly enabled?: boolean;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface AdapterBootstrapConfiguration {
  readonly manifest: AdapterManifest;
  readonly connection?: AdapterConnectionDefaults;
}
