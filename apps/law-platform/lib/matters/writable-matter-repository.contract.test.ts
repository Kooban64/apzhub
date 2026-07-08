import { describe, expect, it } from "vitest";
import { MatterFactory } from "@apzhub/legal-business-core";

import type { WritableMatterRepository } from "./writable-matter-repository";
import { InMemoryMatterRepository } from "./in-memory-matter-repository";
import { SEED_MATTERS } from "./seed-matters";
import { SEED_CLIENTS } from "../clients/seed-clients";
import { SEED_ATTORNEYS } from "./seed-attorneys";

export function registerWritableMatterRepositoryContract(
  label: string,
  createRepository: () => WritableMatterRepository,
  options?: { readonly seedCount?: number },
): void {
  describe(`${label} — writable matter repository contract`, () => {
    it("lists and retrieves seeded matters", () => {
      const repository = createRepository();
      const expectedCount = options?.seedCount ?? 20;

      expect(repository.count()).toBe(expectedCount);
      expect(repository.list()).toHaveLength(expectedCount);
      expect(repository.getById(SEED_MATTERS[0]!.matterId)).toEqual(SEED_MATTERS[0]);
    });

    it("filters matters by query, status, and priority", () => {
      const repository = createRepository();

      expect(repository.list({ query: "Harbourview" })).toHaveLength(1);
      expect(repository.list({ status: "open" }).length).toBeGreaterThan(0);
      expect(repository.list({ priority: "urgent" }).length).toBeGreaterThan(0);
      expect(repository.list({ query: "zzzz-not-found" })).toHaveLength(0);
    });

    it("creates, updates, and soft archives matters", () => {
      const repository = createRepository();
      const created = MatterFactory.create({
        title: "Contract Test Matter",
        clientId: SEED_CLIENTS[0]!.clientId,
        matterTypeId: "litigation",
        matterStatus: "open",
        practiceAreaId: "property",
        priority: "normal",
        leadAttorneyId: SEED_ATTORNEYS[0]!.attorneyId,
      });

      repository.create(created);
      expect(repository.getById(created.matterId)?.title).toBe("Contract Test Matter");

      const updated = repository.update(created.matterId, {
        ...created,
        title: "Updated Contract Matter",
      });
      expect(updated?.title).toBe("Updated Contract Matter");

      const archived = repository.softArchive(created.matterId);
      expect(archived?.matterStatus).toBe("archived");
      expect(repository.getById(created.matterId)).toBeUndefined();
      expect(repository.isSoftArchived(created.matterId)).toBe(true);
    });
  });
}

registerWritableMatterRepositoryContract(
  "InMemoryMatterRepository",
  () => new InMemoryMatterRepository(),
);
