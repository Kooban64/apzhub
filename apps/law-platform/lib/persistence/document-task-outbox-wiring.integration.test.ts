import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { DocumentFactory, TaskFactory } from "@apzhub/legal-business-core";
import { createDb, getDatabaseUrl, lawOutboxEvent } from "@apzhub/config";

import { PostgresDocumentRepository } from "../documents/postgres-document-repository";
import { PostgresTaskRepository } from "../tasks/postgres-task-repository";
import type { ManagedTask } from "../tasks/task-types";
import {
  createLawPersistenceContext,
  DEFAULT_LAW_TENANT_ID,
  ensureLawMigrations,
  isPostgresIntegrationAvailable,
  seedPostgresLawDataAsync,
  truncateLawTables,
} from "../persistence";
import { SEED_CLIENTS } from "../clients/seed-clients";
import { SEED_MATTERS } from "../matters/seed-matters";
import { SEED_TASK_ASSIGNEES } from "../tasks/seed-assignees";

let postgresAvailable = false;

beforeAll(async () => {
  postgresAvailable = await isPostgresIntegrationAvailable();
});

describe.runIf(postgresAvailable)("Document/Task outbox wiring", () => {
  let connectionString: string;

  beforeAll(async () => {
    connectionString = getDatabaseUrl();
    await ensureLawMigrations(connectionString);
  });

  beforeEach(async () => {
    await truncateLawTables(connectionString);
  });

  it("records outbox events transactionally on document create", async () => {
    const previousOutbox = process.env.LAW_OUTBOX_ENABLED;
    const previousMode = process.env.LAW_REPOSITORY_MODE;
    process.env.LAW_REPOSITORY_MODE = "postgres";
    process.env.LAW_OUTBOX_ENABLED = "true";

    const db = createDb(connectionString);
    const context = createLawPersistenceContext({
      tenantId: DEFAULT_LAW_TENANT_ID,
      db,
    });
    await seedPostgresLawDataAsync(context, {
      clients: SEED_CLIENTS,
      matters: SEED_MATTERS,
    });

    const repository = new PostgresDocumentRepository(context);
    const matter = SEED_MATTERS[0]!;
    const document = DocumentFactory.create({
      title: "Outbox Wiring Document",
      matterId: matter.matterId,
      documentCategoryId: "pleadings",
      createdByUserId: "user-legal-workbench",
      clientId: matter.clientId,
    });

    repository.create(document);

    const rows = await db.select().from(lawOutboxEvent);
    const matching = rows.filter((row) => row.aggregateId === document.documentId);

    expect(matching).toHaveLength(1);
    expect(matching[0]?.eventType).toBe("legal.document.created");
    expect(matching[0]?.aggregateType).toBe("document");
    expect(matching[0]?.tenantId).toBe(DEFAULT_LAW_TENANT_ID);

    process.env.LAW_OUTBOX_ENABLED = previousOutbox;
    process.env.LAW_REPOSITORY_MODE = previousMode;
  });

  it("records completed and archived task outbox events", async () => {
    const previousOutbox = process.env.LAW_OUTBOX_ENABLED;
    const previousMode = process.env.LAW_REPOSITORY_MODE;
    process.env.LAW_REPOSITORY_MODE = "postgres";
    process.env.LAW_OUTBOX_ENABLED = "true";

    const db = createDb(connectionString);
    const context = createLawPersistenceContext({
      tenantId: DEFAULT_LAW_TENANT_ID,
      db,
    });
    await seedPostgresLawDataAsync(context, {
      clients: SEED_CLIENTS,
      matters: SEED_MATTERS,
    });

    const repository = new PostgresTaskRepository(context);
    const matter = SEED_MATTERS[0]!;
    const createdBase = TaskFactory.create({
      title: "Outbox Wiring Task",
      assigneeUserId: SEED_TASK_ASSIGNEES[0]!.assigneeUserId,
      matterId: matter.matterId,
      clientId: matter.clientId,
    });

    const task: ManagedTask = {
      ...createdBase,
      createdAt: new Date().toISOString(),
    };

    repository.create(task);

    const completed: ManagedTask = {
      ...task,
      taskStatus: "completed",
      completedAt: new Date().toISOString(),
    };
    repository.update(task.taskId, completed);
    repository.softArchive(task.taskId);

    const rows = await db.select().from(lawOutboxEvent);
    const events = rows
      .filter((row) => row.aggregateId === task.taskId)
      .map((row) => row.eventType)
      .sort();

    expect(events).toEqual([
      "legal.task.archived",
      "legal.task.completed",
      "legal.task.created",
    ]);

    process.env.LAW_OUTBOX_ENABLED = previousOutbox;
    process.env.LAW_REPOSITORY_MODE = previousMode;
  });
});

describe.runIf(!postgresAvailable)("Document/Task outbox wiring", () => {
  it("skips postgres outbox tests when database is unavailable", () => {
    expect(postgresAvailable).toBe(false);
  });
});
