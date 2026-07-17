/**
 * Compose configuration foundation repos (APZCONFIG-001).
 * No silent in-memory — callers must supply explicit repos.
 */

import type { ConfigurationFoundationRepos } from "../ports/repository-ports";
import { ConfigurationDomainError } from "../ports/repository-ports";

export type CreateConfigurationFoundationInput = {
  readonly repos: ConfigurationFoundationRepos;
};

export function createConfigurationFoundation(
  input: CreateConfigurationFoundationInput,
): ConfigurationFoundationRepos {
  if (!input?.repos) {
    throw new ConfigurationDomainError(
      "missing_repos",
      "createConfigurationFoundation requires explicit repos — silent defaults forbidden",
    );
  }
  return input.repos;
}
