import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { DocumentFactory, TaskFactory } from "@apzhub/legal-business-core";
import { createDb, getDatabaseUrl } from "@apzhub/config";

import { PostgresDocumentRepository } from "../documents/postgres-document-repository";
import { PostgresTaskRepository } from "./postgres-task-repository";
import { registerWritableTaskRepositoryContract } from "./writable-task-repository.contract.test";
import type { ManagedTask } from "./task-types";
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
import { SEED_DOCUMENTS } from "../documents/seed-documents";
import { SEED_TASKS } from "./seed-tasks";
import { SEED_TASK_ASSIGNEES } from "./seed-assignees";

let postgresAvailable = false;

beforeAll(async () => {
  postgresAvailable = await isPostgresIntegrationAvailable();
});

describe.runIf(postgresAvailable)("PostgresTaskRepository integration", () => {
  let connectionString: string;
  let db: ReturnType<typeof createDb>;
  const context = () =>
    createLawPersistenceContext({ tenantId: DEFAULT_LAW_TENANT_ID, db });

  beforeAll(async () => {
    connectionString = getDatabaseUrl();
    await ensureLawMigrations(connectionString);
    db = createDb(connectionString);
  });

  beforeEach(async () => {
    await truncateLawTables(connectionString);
    await seedPostgresLawDataAsync(
      context(),
      {
        clients: SEED_CLIENTS,
        matters: SEED_MATTERS,
        documents: SEED_DOCUMENTS,
        tasks: SEED_TASKS,
      },
      connectionString,
    );
  });

  registerWritableTaskRepositoryContract(
    "PostgresTaskRepository",
    () => new PostgresTaskRepository(context()),
    { seedCount: 32 },
  );
});

describe.runIf(postgresAvailable)("PostgresTaskRepository tenant isolation", () => {
  let connectionString: string;

  beforeAll(async () => {
    connectionString = getDatabaseUrl();
    await ensureLawMigrations(connectionString);
  });

  beforeEach(async () => {
    await truncateLawTables(connectionString);
  });

  it("scopes reads and writes to tenantId", async () => {
    const db = createDb(connectionString);
    const tenantA = createLawPersistenceContext({
      tenantId: DEFAULT_LAW_TENANT_ID,
      db,
    });
    const tenantB = createLawPersistenceContext({
      tenantId: "t0000002-0000-4000-8000-000000000002",
      db,
    });

    await seedPostgresLawDataAsync(tenantA, {
      clients: SEED_CLIENTS,
      matters: SEED_MATTERS,
      documents: SEED_DOCUMENTS,
    });

    const repoA = new PostgresTaskRepository(tenantA);
    const repoB = new PostgresTaskRepository(tenantB);
    const task = SEED_TASKS[0]!;

    repoA.create(task);

    expect(repoA.getById(task.taskId)?.title).toBe(task.title);
    expect(repoB.getById(task.taskId)).toBeUndefined();
    expect(repoB.list()).toHaveLength(0);
  });
});

describe.runIf(postgresAvailable)(
  "PostgresTaskRepository relationship validation",
  () => {
    let connectionString: string;

    beforeAll(async () => {
      connectionString = getDatabaseUrl();
      await ensureLawMigrations(connectionString);
    });

    beforeEach(async () => {
      await truncateLawTables(connectionString);
    });

    it("rejects tasks with missing matter", async () => {
      const db = createDb(connectionString);
      const context = createLawPersistenceContext({
        tenantId: DEFAULT_LAW_TENANT_ID,
        db,
      });
      const repository = new PostgresTaskRepository(context);

      const task: ManagedTask = {
        ...TaskFactory.create({
          title: "Orphan Task",
          assigneeUserId: SEED_TASK_ASSIGNEES[0]!.assigneeUserId,
          matterId: "m9999999-0000-4000-8000-000000000099",
        }),
        createdAt: new Date().toISOString(),
      };

      expect(() => repository.create(task)).toThrow(/Matter not found/);
    });

    it("rejects tasks with document from another matter", async () => {
      const db = createDb(connectionString);
      const context = createLawPersistenceContext({
        tenantId: DEFAULT_LAW_TENANT_ID,
        db,
      });
      await seedPostgresLawDataAsync(context, {
        clients: SEED_CLIENTS,
        matters: SEED_MATTERS,
        documents: SEED_DOCUMENTS,
      });

      const repository = new PostgresTaskRepository(context);
      const wrongMatter = SEED_MATTERS[1]!;
      const documentFromOtherMatter = SEED_DOCUMENTS[0]!;

      const task: ManagedTask = {
        ...TaskFactory.create({
          title: "Mismatched Document Task",
          assigneeUserId: SEED_TASK_ASSIGNEES[0]!.assigneeUserId,
          matterId: wrongMatter.matterId,
        }),
        documentId: documentFromOtherMatter.documentId,
        createdAt: new Date().toISOString(),
      };

      expect(() => repository.create(task)).toThrow(/does not belong to matter/);
    });

    it("rejects documents with missing matter", async () => {
      const db = createDb(connectionString);
      const context = createLawPersistenceContext({
        tenantId: DEFAULT_LAW_TENANT_ID,
        db,
      });
      const repository = new PostgresDocumentRepository(context);

      const document = DocumentFactory.create({
        title: "Orphan Document",
        matterId: "m9999999-0000-4000-8000-000000000099",
        documentCategoryId: "pleadings",
        createdByUserId: "user-legal-workbench",
      });

      expect(() => repository.create(document)).toThrow(/Matter not found/);
    });
  },
);

describe.runIf(!postgresAvailable)(
  "PostgresTaskRepository integration availability",
  () => {
    it("skips postgres contract tests when PostgreSQL is unavailable", () => {
      expect(postgresAvailable).toBe(false);
    });
  },
);
