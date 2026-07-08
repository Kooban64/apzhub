import { describe, expect, it } from "vitest";

import { InMemoryMatterRepository } from "./in-memory-matter-repository";
import { SEED_MATTERS } from "./seed-matters";

describe("InMemoryMatterRepository", () => {
  it("seeds twenty realistic matters", () => {
    const repository = new InMemoryMatterRepository();

    expect(repository.count()).toBe(20);
    expect(repository.list()).toHaveLength(20);
  });

  it("retrieves a matter by id", () => {
    const repository = new InMemoryMatterRepository();
    const sample = SEED_MATTERS[0]!;

    expect(repository.getById(sample.matterId)).toEqual(sample);
  });

  it("filters matters by query, status, and priority", () => {
    const repository = new InMemoryMatterRepository();

    expect(repository.list({ query: "Harbourview" })).toHaveLength(1);
    expect(repository.list({ status: "open" }).length).toBeGreaterThan(0);
    expect(repository.list({ priority: "urgent" }).length).toBeGreaterThan(0);
    expect(repository.list({ query: "zzzz-not-found" })).toHaveLength(0);
  });

  it("soft archives matters and excludes them from list and getById", () => {
    const repository = new InMemoryMatterRepository();
    const sample = SEED_MATTERS[0]!;

    const archived = repository.softArchive(sample.matterId);
    expect(archived?.matterStatus).toBe("archived");
    expect(repository.getById(sample.matterId)).toBeUndefined();
    expect(repository.list()).toHaveLength(19);
    expect(repository.count()).toBe(19);
  });
});
