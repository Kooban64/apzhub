import type { IntegrationRequestContext } from "../types";
import type { IntegrationDiagnostics, IntegrationHealth } from "../diagnostics";
import type { IntegrationLifecycleState } from "../lifecycle";

/** Base adapter contract — vendor adapters implement domain methods on top of this interface. */
export interface AdapterBase {
  readonly integrationId: string;
  readonly lifecycleState: IntegrationLifecycleState;

  health(context: IntegrationRequestContext): Promise<IntegrationHealth>;
  diagnostics(context: IntegrationRequestContext): Promise<IntegrationDiagnostics>;
}

export interface PlaceholderAdapterBaseOptions {
  readonly integrationId: string;
  readonly capabilityId?: string;
  readonly lifecycleState?: IntegrationLifecycleState;
  readonly connectionConfigured?: boolean;
  readonly authenticationPresent?: boolean;
}
