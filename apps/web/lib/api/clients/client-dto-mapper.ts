import type { Client } from "@apzhub/legal-business-core";

/** Client API DTO shapes aligned with LAW-OpenAPI-v1 (LAW-014-04). */

export interface ClientSummaryV1 {
  readonly clientId: string;
  readonly clientReference: string;
  readonly displayName: string;
  readonly clientType: Client["clientType"];
  readonly status: Client["status"];
  readonly tags: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ClientDetailV1 extends ClientSummaryV1 {
  readonly version: number;
  readonly primaryContactId?: string | null;
  readonly billingAddressId?: string | null;
  readonly customFields: Readonly<Record<string, string>>;
}

export interface CreateClientV1Request {
  readonly displayName: string;
  readonly clientType: Client["clientType"];
  readonly status: Client["status"];
  readonly tags?: readonly string[];
  readonly customFields?: Readonly<Record<string, string>>;
}

export interface UpdateClientV1Request {
  readonly displayName?: string;
  readonly status?: Client["status"];
  readonly tags?: readonly string[];
  readonly customFields?: Readonly<Record<string, string>>;
}

export interface ClientListResponseV1 {
  readonly items: readonly ClientSummaryV1[];
  readonly pagination: {
    readonly limit: number;
    readonly nextCursor: string | null;
    readonly prevCursor: string | null;
    readonly hasMore: boolean;
  };
}

export interface ClientDeleteResponseV1 {
  readonly clientId: string;
  readonly status: "archived";
}

export interface ClientApiMetadata {
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

const memoryMetadata = new Map<string, ClientApiMetadata>();

export function resetClientApiMetadataCache(): void {
  memoryMetadata.clear();
}

export function seedClientApiMetadata(
  clientId: string,
  metadata: ClientApiMetadata,
): void {
  memoryMetadata.set(clientId, metadata);
}

export function touchClientApiMetadata(
  clientId: string,
  created = false,
): ClientApiMetadata {
  const now = new Date().toISOString();
  const existing = memoryMetadata.get(clientId);
  if (!existing || created) {
    const next = { version: 1, createdAt: now, updatedAt: now };
    memoryMetadata.set(clientId, next);
    return next;
  }

  const next = { ...existing, version: existing.version + 1, updatedAt: now };
  memoryMetadata.set(clientId, next);
  return next;
}

export function getClientApiMetadata(clientId: string): ClientApiMetadata {
  return (
    memoryMetadata.get(clientId) ?? {
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
}

export function mapClientToSummaryV1(
  client: Client,
  metadata: ClientApiMetadata,
): ClientSummaryV1 {
  return {
    clientId: client.clientId,
    clientReference: client.clientReference,
    displayName: client.displayName,
    clientType: client.clientType,
    status: client.status,
    tags: [...client.tags],
    createdAt: metadata.createdAt,
    updatedAt: metadata.updatedAt,
  };
}

export function mapClientToDetailV1(
  client: Client,
  metadata: ClientApiMetadata,
): ClientDetailV1 {
  return {
    ...mapClientToSummaryV1(client, metadata),
    version: metadata.version,
    primaryContactId: client.primaryContactId ?? null,
    billingAddressId: client.billingAddressId ?? null,
    customFields: { ...client.customFields },
  };
}

export function customFieldsRecordToInput(
  fields: Readonly<Record<string, string>> | undefined,
): string {
  if (!fields) {
    return "";
  }

  return Object.entries(fields)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

export function tagsArrayToInput(tags: readonly string[] | undefined): string {
  return tags?.join(", ") ?? "";
}
