import type { Client, ClientSearchCriteria } from "@apzhub/legal-business-core";

import {
  matchesClientCriteria,
  sortClientsByDisplayName,
} from "./client-repository-filters";
import type { WritableClientRepository } from "./writable-client-repository";
import { SEED_CLIENTS } from "./seed-clients";

/** In-memory writable client repository with soft delete (LAW-002-03). */
export class InMemoryClientRepository implements WritableClientRepository {
  private readonly clients: Map<string, Client>;
  private readonly softDeletedIds = new Set<string>();

  constructor(seed: readonly Client[] = SEED_CLIENTS) {
    this.clients = new Map(seed.map((client) => [client.clientId, client]));
  }

  list(criteria?: ClientSearchCriteria): readonly Client[] {
    return sortClientsByDisplayName(
      [...this.clients.values()]
        .filter((client) => !this.softDeletedIds.has(client.clientId))
        .filter((client) => matchesClientCriteria(client, criteria)),
    );
  }

  getById(clientId: string): Client | undefined {
    if (this.softDeletedIds.has(clientId)) {
      return undefined;
    }

    return this.clients.get(clientId);
  }

  create(client: Client): Client {
    this.clients.set(client.clientId, client);
    this.softDeletedIds.delete(client.clientId);
    return client;
  }

  update(clientId: string, client: Client): Client | undefined {
    if (!this.clients.has(clientId) || this.softDeletedIds.has(clientId)) {
      return undefined;
    }

    this.clients.set(clientId, client);
    return client;
  }

  softDelete(clientId: string): Client | undefined {
    const existing = this.clients.get(clientId);
    if (!existing || this.softDeletedIds.has(clientId)) {
      return undefined;
    }

    const deleted: Client = {
      ...existing,
      status: "archived",
    };

    this.clients.set(clientId, deleted);
    this.softDeletedIds.add(clientId);
    return deleted;
  }

  count(includeDeleted = false): number {
    if (includeDeleted) {
      return this.clients.size;
    }

    return [...this.clients.keys()].filter(
      (clientId) => !this.softDeletedIds.has(clientId),
    ).length;
  }

  isSoftDeleted(clientId: string): boolean {
    return this.softDeletedIds.has(clientId);
  }
}

export {
  getSharedClientRepository,
  resetSharedClientRepository,
} from "../persistence/repository-factory";
