/**
 * Bootstrap Search Publication Administration (APZSEARCH-017).
 * Does not modify platform-services or Search Orchestrator internals.
 */

import { getDb } from "@apzhub/config/db";
import {
  createSearchPublicationAdmin,
  type SearchPublicationAdminFramework,
} from "@apzhub/search-publication-admin";
import { createProductionSearchOrchestration } from "@apzhub/search-orchestrator";

let cached: SearchPublicationAdminFramework | null = null;

export function resetSearchPublicationAdminForTests(): void {
  cached = null;
}

export function setSearchPublicationAdminForTests(
  framework: SearchPublicationAdminFramework,
): void {
  cached = framework;
}

export async function getSearchPublicationAdmin(): Promise<SearchPublicationAdminFramework> {
  if (cached) return cached;

  if (process.env.NODE_ENV === "test") {
    cached = createSearchPublicationAdmin({
      allowInMemoryOrchestration: true,
      env: { APZHUB_SEARCH_ORCHESTRATION_ENABLED: "true" },
    });
    return cached;
  }

  const runtime = createProductionSearchOrchestration({
    postgresDb: getDb(),
    env: process.env,
  });
  cached = createSearchPublicationAdmin({
    runtime,
    compositionRegistered: true,
  });
  return cached;
}
