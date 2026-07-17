/**
 * Canonical administration module registration helpers (APZADMIN-001).
 */

import type {
  AdministrationModuleKey,
  CanonicalAdministrationModuleRegistration,
} from "@apzhub/admin-contracts";
import {
  CANONICAL_ADMINISTRATION_MODULE_REGISTRATIONS,
  isAdministrationModuleKey,
} from "@apzhub/admin-contracts";

import { AdministrationDomainError } from "../ports/repository-ports";

export function listCanonicalAdministrationModuleRegistrations(): readonly CanonicalAdministrationModuleRegistration[] {
  return CANONICAL_ADMINISTRATION_MODULE_REGISTRATIONS;
}

export function getCanonicalAdministrationModuleRegistration(
  key: AdministrationModuleKey,
): CanonicalAdministrationModuleRegistration | undefined {
  return CANONICAL_ADMINISTRATION_MODULE_REGISTRATIONS.find(
    (entry) => entry.key === key,
  );
}

export function assertKnownModuleKey(key: string): AdministrationModuleKey {
  if (!isAdministrationModuleKey(key)) {
    throw new AdministrationDomainError(
      "unknown_module_key",
      `Unknown administration module key: ${key}`,
      { key },
    );
  }
  return key;
}
