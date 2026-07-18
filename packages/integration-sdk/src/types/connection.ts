export type TransportKind = "rest" | "webhook" | "polling" | "graphql";

export type ConnectionState =
  "idle" | "connecting" | "ready" | "degraded" | "closed" | "failed";

/** Static connection configuration for an integration instance. */
export interface ConnectionConfig {
  readonly integrationId: string;
  readonly baseUrl: string;
  readonly apiBaseUrl?: string;
  readonly transport: TransportKind;
  readonly timeoutMs?: number;
  readonly enabled: boolean;
}

/** Runtime connection handle — transport implementation deferred to OSS-100-02+. */
export interface Connection {
  readonly id: string;
  readonly integrationId: string;
  readonly baseUrl: string;
  readonly transport: TransportKind;
  readonly metadata: Readonly<Record<string, string>>;
}
