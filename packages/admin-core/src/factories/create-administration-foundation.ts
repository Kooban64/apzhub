/**
 * Compose administration foundation repos (APZADMIN-001).
 * No silent in-memory — callers must supply explicit repos.
 */

import type { AdministrationFoundationRepos } from "../ports/repository-ports";
import { AdministrationDomainError } from "../ports/repository-ports";

export type CreateAdministrationFoundationInput = {
  readonly repos: AdministrationFoundationRepos;
};

export function createAdministrationFoundation(
  input: CreateAdministrationFoundationInput,
): AdministrationFoundationRepos {
  if (!input?.repos) {
    throw new AdministrationDomainError(
      "missing_repos",
      "createAdministrationFoundation requires explicit repos — silent defaults forbidden",
    );
  }
  return input.repos;
}
