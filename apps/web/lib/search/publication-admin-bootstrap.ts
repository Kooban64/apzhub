/**
 * Bootstrap Search Publication Administration (APZSEARCH-017).
 * Platform-1.3-ENG-001: shares orchestration runtime with product composition wiring.
 */

import {
  createSearchPublicationAdmin,
  type SearchPublicationAdminFramework,
} from "@apzhub/search-publication-admin";

import {
  getSearchCompositionRegistration,
  getSearchPublicationRuntime,
  isSearchCompositionFullyRegisteredForLiveDrain,
  resetSearchPublicationRuntimeForTests,
} from "./publication-runtime";

let cached: SearchPublicationAdminFramework | null = null;

export function resetSearchPublicationAdminForTests(): void {
  cached = null;
  resetSearchPublicationRuntimeForTests();
}

export function setSearchPublicationAdminForTests(
  framework: SearchPublicationAdminFramework,
): void {
  cached = framework;
}

export async function getSearchPublicationAdmin(): Promise<SearchPublicationAdminFramework> {
  if (cached) return cached;

  const runtime = getSearchPublicationRuntime(process.env);
  const registration = getSearchCompositionRegistration();
  cached = createSearchPublicationAdmin({
    runtime,
    compositionRegistered:
      isSearchCompositionFullyRegisteredForLiveDrain() ||
      registration.time ||
      registration.law ||
      registration.projects ||
      process.env.NODE_ENV === "test",
  });
  return cached;
}
