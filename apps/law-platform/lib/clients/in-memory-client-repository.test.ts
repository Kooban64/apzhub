import { describe, expect, it } from "vitest";

import { InMemoryClientRepository } from "./in-memory-client-repository";
import { SEED_CLIENTS } from "./seed-clients";

describe("InMemoryClientRepository", () => {
  it("seeds twenty realistic clients", () => {
    const repository = new InMemoryClientRepository();

    expect(repository.count()).toBe(20);
    expect(repository.list()).toHaveLength(20);
  });

  it("retrieves a client by id", () => {
    const repository = new InMemoryClientRepository();
    const sample = SEED_CLIENTS[0]!;

    expect(repository.getById(sample.clientId)).toEqual(sample);
  });

  it("filters clients by query, status, and type", () => {
    const repository = new InMemoryClientRepository();

    expect(repository.list({ query: "Harbourview" })).toHaveLength(1);
    expect(repository.list({ status: "prospect" }).length).toBeGreaterThan(0);
    expect(repository.list({ clientType: "organisation" }).length).toBeGreaterThan(0);
    expect(repository.list({ query: "zzzz-not-found" })).toHaveLength(0);
  });

  it("soft deletes clients and excludes them from list and getById", () => {
    const repository = new InMemoryClientRepository();
    const sample = SEED_CLIENTS[0]!;

    const deleted = repository.softDelete(sample.clientId);
    expect(deleted?.status).toBe("archived");
    expect(repository.getById(sample.clientId)).toBeUndefined();
    expect(repository.list()).toHaveLength(19);
    expect(repository.count()).toBe(19);
  });
});
