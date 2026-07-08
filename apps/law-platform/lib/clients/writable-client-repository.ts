import type { Client } from "@apzhub/legal-business-core";
import type { ClientRepository } from "@apzhub/legal-business-core";

/** Writable in-memory client repository — session scoped, no persistence (LAW-002-03). */
export interface WritableClientRepository extends ClientRepository {
  create(client: Client): Client;
  update(clientId: string, client: Client): Client | undefined;
  softDelete(clientId: string): Client | undefined;
  count(includeDeleted?: boolean): number;
  isSoftDeleted(clientId: string): boolean;
}
