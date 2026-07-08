import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ClientFactory } from "@apzhub/legal-business-core";
import { createDb, getDatabaseUrl, lawOutboxEvent } from "@apzhub/config";

import { PostgresClientRepository } from "./postgres-client-repository";
import {
  createLawPersistenceContext,
  DEFAULT_LAW_TENANT_ID,
  ensureLawMigrations,
  isPostgresIntegrationAvailable,
  truncateLawTables,
} from "../persistence";

let postgresAvailable = false;

beforeAll(async () => {
  postgresAvailable = await isPostgresIntegrationAvailable();
});

describe.runIf(postgresAvailable)("Client/Matter outbox wiring", () => {
  let connectionString: string;

  beforeAll(async () => {
    connectionString = getDatabaseUrl();
    await ensureLawMigrations(connectionString);
  });

  beforeEach(async () => {
    await truncateLawTables(connectionString);
  });

  it("records outbox events transactionally on client create", async () => {
    const previousOutbox = process.env.LAW_OUTBOX_ENABLED;
    const previousMode = process.env.LAW_REPOSITORY_MODE;
    process.env.LAW_REPOSITORY_MODE = "postgres";
    process.env.LAW_OUTBOX_ENABLED = "true";

    const db = createDb(connectionString);
    const context = createLawPersistenceContext({
      tenantId: DEFAULT_LAW_TENANT_ID,
      db,
    });
    const repository = new PostgresClientRepository(context);

    const client = ClientFactory.create({
      displayName: "Outbox Wiring Client",
      clientType: "individual",
      status: "active",
    });

    repository.create(client);

    const rows = await db.select().from(lawOutboxEvent);
    const matching = rows.filter((row) => row.aggregateId === client.clientId);

    expect(matching).toHaveLength(1);
    expect(matching[0]?.eventType).toBe("legal.client.created");
    expect(matching[0]?.tenantId).toBe(DEFAULT_LAW_TENANT_ID);

    process.env.LAW_OUTBOX_ENABLED = previousOutbox;
    process.env.LAW_REPOSITORY_MODE = previousMode;
  });
});

describe.runIf(!postgresAvailable)("Client/Matter outbox wiring", () => {
  it("skips postgres outbox tests when database is unavailable", () => {
    expect(postgresAvailable).toBe(false);
  });
});
