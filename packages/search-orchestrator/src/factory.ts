/**
 * Factories for Product Indexing Orchestration (APZSEARCH-016).
 */

import type { DatabaseExecutor } from "@apzhub/config";
import {
  createSearchIntegration,
  type CreateSearchIntegrationOptions,
  type SearchIntegrationFramework,
  type SearchIntegrationPublisher,
} from "@apzhub/search-integration";

import { createPublicationDispatcher, type PublicationDispatcher } from "./dispatcher";
import { createInMemoryPublicationJournal } from "./journal/memory";
import { createPostgresPublicationJournal } from "./journal/postgres";
import type { PublicationJournalRepository } from "./journal/port";
import { createIndexOrchestrator, type IndexOrchestrator } from "./orchestrator";
import type { BatchPolicy, RetryPolicy } from "./types";

export type SearchOrchestrationRuntime = {
  readonly journal: PublicationJournalRepository;
  readonly dispatcher: PublicationDispatcher;
  readonly orchestrator: IndexOrchestrator;
  readonly integration: SearchIntegrationFramework;
  readonly publisher: SearchIntegrationPublisher;
};

export type CreateSearchOrchestrationForTestInput = {
  readonly allowInMemoryJournal?: boolean;
  readonly postgresDb?: DatabaseExecutor;
  readonly integration?: SearchIntegrationFramework;
  readonly searchIntegrationOptions?: CreateSearchIntegrationOptions;
  readonly retryPolicy?: RetryPolicy;
  readonly batchPolicy?: BatchPolicy;
  readonly id?: () => string;
  readonly now?: () => string;
  readonly env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
};

export type CreateProductionSearchOrchestrationInput = {
  readonly postgresDb: DatabaseExecutor;
  readonly integration?: SearchIntegrationFramework;
  readonly searchIntegrationOptions?: CreateSearchIntegrationOptions;
  readonly retryPolicy?: RetryPolicy;
  readonly batchPolicy?: BatchPolicy;
  readonly id?: () => string;
  readonly now?: () => string;
  readonly env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
};

function buildRuntime(input: {
  readonly journal: PublicationJournalRepository;
  readonly integration: SearchIntegrationFramework;
  readonly retryPolicy?: RetryPolicy;
  readonly batchPolicy?: BatchPolicy;
  readonly id: () => string;
  readonly now: () => string;
  readonly env?: NodeJS.ProcessEnv | Record<string, string | undefined>;
}): SearchOrchestrationRuntime {
  const dispatcher = createPublicationDispatcher({
    journal: input.journal,
    retryPolicy: input.retryPolicy,
    id: input.id,
    now: input.now,
    env: input.env,
  });
  const orchestrator = createIndexOrchestrator({
    journal: input.journal,
    dispatcher,
    publisher: input.integration.publisher,
    retryPolicy: input.retryPolicy,
    batchPolicy: input.batchPolicy,
    now: input.now,
    env: input.env,
  });
  return {
    journal: input.journal,
    dispatcher,
    orchestrator,
    integration: input.integration,
    publisher: input.integration.publisher,
  };
}

export function createSearchOrchestrationForTest(
  input: CreateSearchOrchestrationForTestInput = {},
): SearchOrchestrationRuntime {
  let journal: PublicationJournalRepository;
  if (input.postgresDb) {
    journal = createPostgresPublicationJournal(input.postgresDb);
  } else if (input.allowInMemoryJournal) {
    journal = createInMemoryPublicationJournal();
  } else {
    throw new Error(
      "createSearchOrchestrationForTest requires postgresDb or allowInMemoryJournal: true",
    );
  }

  const integration =
    input.integration ?? createSearchIntegration(input.searchIntegrationOptions);

  let seq = 0;
  const id =
    input.id ??
    (() => {
      seq += 1;
      return `pub_${seq}`;
    });

  return buildRuntime({
    journal,
    integration,
    retryPolicy: input.retryPolicy,
    batchPolicy: input.batchPolicy,
    id,
    now: input.now ?? (() => new Date().toISOString()),
    env: input.env ?? { APZHUB_SEARCH_ORCHESTRATION_ENABLED: "true" },
  });
}

export function createProductionSearchOrchestration(
  input: CreateProductionSearchOrchestrationInput,
): SearchOrchestrationRuntime {
  if (!input?.postgresDb) {
    throw new Error(
      "createProductionSearchOrchestration requires postgresDb — in-memory journal fallback is forbidden",
    );
  }
  const journal = createPostgresPublicationJournal(input.postgresDb);
  const integration =
    input.integration ?? createSearchIntegration(input.searchIntegrationOptions);

  let seq = 0;
  const id =
    input.id ??
    (() => {
      seq += 1;
      return `pub_${Date.now().toString(36)}_${seq}`;
    });

  return buildRuntime({
    journal,
    integration,
    retryPolicy: input.retryPolicy,
    batchPolicy: input.batchPolicy,
    id,
    now: input.now ?? (() => new Date().toISOString()),
    env: input.env,
  });
}
