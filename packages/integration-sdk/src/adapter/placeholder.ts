import {
  createPlaceholderIntegrationDiagnostics,
  createPlaceholderIntegrationHealth,
} from "../diagnostics";
import type { IntegrationLifecycleState } from "../lifecycle";
import type { IntegrationRequestContext } from "../types";
import type { AdapterBase, PlaceholderAdapterBaseOptions } from "./types";

/** Minimal placeholder adapter for scaffold testing and future vendor extension. */
export class PlaceholderAdapterBase implements AdapterBase {
  readonly integrationId: string;
  readonly lifecycleState: IntegrationLifecycleState;

  private readonly capabilityId?: string;
  private readonly connectionConfigured: boolean;
  private readonly authenticationPresent: boolean;

  constructor(options: PlaceholderAdapterBaseOptions) {
    this.integrationId = options.integrationId;
    this.lifecycleState = options.lifecycleState ?? "registered";
    this.capabilityId = options.capabilityId;
    this.connectionConfigured = options.connectionConfigured ?? false;
    this.authenticationPresent = options.authenticationPresent ?? false;
  }

  health(context: IntegrationRequestContext) {
    return Promise.resolve(
      createPlaceholderIntegrationHealth({
        integrationId: this.integrationId,
        context,
        capabilityId: this.capabilityId,
        connectionConfigured: this.connectionConfigured,
        authenticationPresent: this.authenticationPresent,
      }),
    );
  }

  diagnostics(context: IntegrationRequestContext) {
    return Promise.resolve(
      createPlaceholderIntegrationDiagnostics({
        integrationId: this.integrationId,
        context,
        capabilityId: this.capabilityId,
        connectionConfigured: this.connectionConfigured,
        authenticationPresent: this.authenticationPresent,
      }),
    );
  }
}

export function createPlaceholderAdapterBase(
  options: PlaceholderAdapterBaseOptions,
): AdapterBase {
  return new PlaceholderAdapterBase(options);
}
