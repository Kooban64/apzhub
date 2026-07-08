import { describe, expect, it } from "vitest";
import { ClientFactory } from "@apzhub/legal-business-core";

import type { WritableClientRepository } from "./writable-client-repository";
import { InMemoryClientRepository } from "./in-memory-client-repository";
import { SEED_CLIENTS } from "./seed-clients";

export function registerWritableClientRepositoryContract(
  label: string,
  createRepository: () => WritableClientRepository,
  options?: { readonly seedCount?: number },
): void {
  describe(`${label} — writable client repository contract`, () => {
    it("lists and retrieves seeded clients", () => {
      const repository = createRepository();
      const expectedCount = options?.seedCount ?? 20;

      expect(repository.count()).toBe(expectedCount);
      expect(repository.list()).toHaveLength(expectedCount);
      expect(repository.getById(SEED_CLIENTS[0]!.clientId)).toEqual(SEED_CLIENTS[0]);
    });

    it("filters clients by query, status, and type", () => {
      const repository = createRepository();

      expect(repository.list({ query: "Harbourview" })).toHaveLength(1);
      expect(repository.list({ status: "prospect" }).length).toBeGreaterThan(0);
      expect(repository.list({ clientType: "organisation" }).length).toBeGreaterThan(0);
      expect(repository.list({ query: "zzzz-not-found" })).toHaveLength(0);
    });

    it("creates, updates, and soft deletes clients", () => {
      const repository = createRepository();
      const created = ClientFactory.create({
        displayName: "Contract Test Client",
        clientType: "individual",
        status: "active",
      });

      repository.create(created);
      expect(repository.getById(created.clientId)?.displayName).toBe(
        "Contract Test Client",
      );

      const updated = repository.update(created.clientId, {
        ...created,
        displayName: "Updated Contract Client",
      });
      expect(updated?.displayName).toBe("Updated Contract Client");

      const deleted = repository.softDelete(created.clientId);
      expect(deleted?.status).toBe("archived");
      expect(repository.getById(created.clientId)).toBeUndefined();
      expect(repository.isSoftDeleted(created.clientId)).toBe(true);
    });
  });
}

registerWritableClientRepositoryContract(
  "InMemoryClientRepository",
  () => new InMemoryClientRepository(),
);
