import type { DatabaseExecutor } from "@apzhub/config";

import {
  createInMemoryReportingRepository,
  type ReportingRepository,
} from "../application/repository";
import { createPostgresReportingRepository } from "./postgres/reporting-repository";

export function createReportingPersistence(input: {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
}): ReportingRepository {
  if (input.mode === "postgres") {
    if (!input.db) throw new Error("reporting.persistence.postgres_db_required");
    return createPostgresReportingRepository(input.db);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error("reporting.persistence.memory_not_allowed");
  }
  return createInMemoryReportingRepository();
}
