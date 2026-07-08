import type { Client } from "@apzhub/legal-business-core";

import { lawClient } from "../legal-schema";

type ClientRow = typeof lawClient.$inferSelect;

export function clientToRow(
  client: Client,
  tenantId: string,
): typeof lawClient.$inferInsert {
  return {
    clientId: client.clientId,
    tenantId,
    clientReference: client.clientReference,
    displayName: client.displayName,
    clientType: client.clientType,
    status: client.status,
    primaryContactId: client.primaryContactId ?? null,
    billingAddressId: client.billingAddressId ?? null,
    tags: [...client.tags],
    customFields: { ...client.customFields },
  };
}

export function rowToClient(row: ClientRow): Client {
  return {
    clientId: row.clientId,
    clientReference: row.clientReference,
    displayName: row.displayName,
    clientType: row.clientType as Client["clientType"],
    status: row.status as Client["status"],
    primaryContactId: row.primaryContactId ?? undefined,
    billingAddressId: row.billingAddressId ?? undefined,
    tags: row.tags ?? [],
    customFields: row.customFields ?? {},
  };
}
