/**
 * Compose identity foundation repos (APZIDENTITY-001).
 * No silent in-memory — callers must supply explicit repos.
 */

import type { IdentityFoundationRepos } from "../ports/repository-ports";
import { IdentityDomainError } from "../ports/repository-ports";

export type CreateIdentityFoundationInput = {
  readonly repos: IdentityFoundationRepos;
};

export function createIdentityFoundation(
  input: CreateIdentityFoundationInput,
): IdentityFoundationRepos {
  if (!input?.repos) {
    throw new IdentityDomainError(
      "missing_repos",
      "createIdentityFoundation requires explicit repos — silent defaults forbidden",
    );
  }
  return input.repos;
}
