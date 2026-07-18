/**
 * Module-level Publication Administration client accessor (APZSEARCH-017).
 */

import {
  createHttpSearchPublicationAdminClient,
  createMockSearchPublicationAdminClient,
  type PublicationAdminDiagnosticsViewModel,
  type PublicationJournalViewModel,
  type PublicationProductSummaryViewModel,
  type PublicationQueueSummaryViewModel,
  type PublicationRetryResultViewModel,
  type SearchPublicationAdminClient,
} from "./publication-admin-client";

let client: SearchPublicationAdminClient =
  typeof process !== "undefined" && process.env.NODE_ENV === "test"
    ? createMockSearchPublicationAdminClient()
    : createHttpSearchPublicationAdminClient();

export function setSearchPublicationAdminClient(
  next: SearchPublicationAdminClient,
): void {
  client = next;
}

export function getSearchPublicationAdminClient(): SearchPublicationAdminClient {
  return client;
}

export function resetSearchPublicationAdminClient(): void {
  client = createMockSearchPublicationAdminClient();
}

export function listSearchPublications(
  query?: Record<string, string | number | boolean | undefined>,
): Promise<{
  readonly items: readonly PublicationJournalViewModel[];
  readonly total: number;
}> {
  return getSearchPublicationAdminClient().listPublications(query);
}

export function getSearchPublicationQueueSummary(): Promise<PublicationQueueSummaryViewModel> {
  return getSearchPublicationAdminClient().getQueueSummary();
}

export function listSearchPublicationProducts(): Promise<
  readonly PublicationProductSummaryViewModel[]
> {
  return getSearchPublicationAdminClient().listProductSummaries();
}

export function getSearchPublicationAdminDiagnostics(): Promise<PublicationAdminDiagnosticsViewModel> {
  return getSearchPublicationAdminClient().getDiagnostics();
}

export function retrySearchPublication(
  id: string,
): Promise<PublicationRetryResultViewModel> {
  return getSearchPublicationAdminClient().retryPublication(id);
}

export function retrySearchPublicationFailedBatch(
  limit?: number,
): Promise<readonly PublicationRetryResultViewModel[]> {
  return getSearchPublicationAdminClient().retryBatch({
    failedBatch: true,
    limit,
  });
}

export function clearSearchPublicationCompletedRetries(): Promise<{
  readonly cleared: number;
}> {
  return getSearchPublicationAdminClient().clearCompletedRetries();
}

export function acknowledgeSearchPublicationDeadLetter(
  id: string,
  reason?: string,
): Promise<{ readonly ok: true }> {
  return getSearchPublicationAdminClient().acknowledgeDeadLetter(id, reason);
}

export function archiveSearchPublicationDeadLetter(
  id: string,
  reason?: string,
): Promise<{ readonly ok: true }> {
  return getSearchPublicationAdminClient().archiveDeadLetter(id, reason);
}

export function retrySearchPublicationDeadLetter(
  id: string,
): Promise<PublicationRetryResultViewModel> {
  return getSearchPublicationAdminClient().retryDeadLetter(id);
}

export function drainSearchPublicationBatch(): Promise<{
  readonly processed: number;
  readonly published: number;
  readonly failed: number;
  readonly deadLetter: number;
}> {
  return getSearchPublicationAdminClient().drainBatch();
}
