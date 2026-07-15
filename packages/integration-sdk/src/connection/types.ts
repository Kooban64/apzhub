import type { AuthenticationMode } from "../auth/types";

/** Connection lifecycle states for SDK-managed logical connections (OSS-100-02). */
export type ConnectionLifecycleState =
  | "unconfigured"
  | "configured"
  | "authenticating"
  | "connected"
  | "disconnected"
  | "authentication_failed"
  | "misconfigured"
  | "degraded"
  | "disabled";

export const CONNECTION_LIFECYCLE_STATES: readonly ConnectionLifecycleState[] = [
  "unconfigured",
  "configured",
  "authenticating",
  "connected",
  "disconnected",
  "authentication_failed",
  "misconfigured",
  "degraded",
  "disabled",
] as const;

export interface ConnectionRecord {
  readonly connectionId: string;
  readonly tenantId: string;
  readonly integrationId: string;
  readonly adapterId: string;
  readonly displayName?: string;
  readonly baseUrl: string;
  readonly authenticationMode: AuthenticationMode;
  readonly lifecycleState: ConnectionLifecycleState;
  readonly enabled: boolean;
  readonly credentialRef: string;
  readonly usernameRef?: string;
  readonly headerName?: string;
  readonly queryParam?: string;
  readonly customScheme?: string;
  readonly configuredAt?: string;
  readonly connectedAt?: string;
  readonly disconnectedAt?: string;
  readonly lastValidatedAt?: string;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface ConnectionDefinition {
  readonly connectionId: string;
  readonly tenantId: string;
  readonly integrationId: string;
  readonly adapterId: string;
  readonly displayName?: string;
  readonly baseUrl: string;
  readonly authenticationMode: AuthenticationMode;
  readonly enabled?: boolean;
  readonly credentialRef: string;
  readonly usernameRef?: string;
  readonly headerName?: string;
  readonly queryParam?: string;
  readonly customScheme?: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface ConnectionRegistrySnapshot {
  readonly connections: readonly ConnectionRecord[];
  readonly capturedAt: string;
}
