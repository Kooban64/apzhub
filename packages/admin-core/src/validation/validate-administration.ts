/**
 * Administration validation metadata checks (APZADMIN-001).
 * Validates metadata shapes — does NOT execute diagnostics or render UI.
 */

import type {
  AdministrationCapability,
  AdministrationModule,
  AdministrationNavigation,
  AdministrationMetadata,
} from "@apzhub/admin-contracts";
import {
  isAdministrationModuleKey,
  isAdministrationNavigationVisibility,
} from "@apzhub/admin-contracts";

import { AdministrationDomainError } from "../ports/repository-ports";

const FORBIDDEN_SECRET_HINTS =
  /\b(password|secret|api[_-]?key|token|credential|private[_-]?key|vault)\b/i;

export function assertNoSecretMetadataNotes(notes?: string): void {
  if (notes && FORBIDDEN_SECRET_HINTS.test(notes)) {
    throw new AdministrationDomainError(
      "secret_metadata_forbidden",
      "Administration metadata notes must not contain secret/credential hints",
    );
  }
}

export function validateAdministrationModuleKey(module: AdministrationModule): void {
  if (!isAdministrationModuleKey(module.key)) {
    throw new AdministrationDomainError(
      "invalid_module_key",
      `Unknown administration module key: ${module.key}`,
    );
  }
}

export function validateAdministrationCapabilityMetadata(
  capability: AdministrationCapability,
): void {
  if (!capability.key.trim()) {
    throw new AdministrationDomainError(
      "invalid_capability_key",
      "Capability key must be non-empty",
    );
  }
  if (!capability.owner.trim()) {
    throw new AdministrationDomainError(
      "invalid_capability_owner",
      "Capability owner must be non-empty",
    );
  }
  if (!capability.version.trim()) {
    throw new AdministrationDomainError(
      "invalid_capability_version",
      "Capability version must be non-empty",
    );
  }
  if (
    capability.productionReady &&
    !(
      capability.enabled &&
      capability.available &&
      capability.healthy &&
      capability.certified
    )
  ) {
    throw new AdministrationDomainError(
      "invalid_production_ready",
      "productionReady requires enabled, available, healthy, and certified",
    );
  }
}

export function validateAdministrationNavigationMetadata(
  navigation: AdministrationNavigation,
): void {
  if (!navigation.key.trim() || !navigation.label.trim()) {
    throw new AdministrationDomainError(
      "invalid_navigation",
      "Navigation key and label must be non-empty",
    );
  }
  if (!isAdministrationNavigationVisibility(navigation.visibility)) {
    throw new AdministrationDomainError(
      "invalid_navigation_visibility",
      `Invalid navigation visibility: ${navigation.visibility}`,
    );
  }
  if (!Number.isFinite(navigation.ordering)) {
    throw new AdministrationDomainError(
      "invalid_navigation_ordering",
      "Navigation ordering must be a finite number",
    );
  }
}

export function validateAdministrationMetadataNotes(
  metadata: AdministrationMetadata,
): void {
  assertNoSecretMetadataNotes(metadata.notes);
}

export function validateAdministrationAggregate(module: AdministrationModule): void {
  if (!module.tenantId.trim()) {
    throw new AdministrationDomainError(
      "invalid_tenant",
      "Administration module requires tenantId",
    );
  }
  validateAdministrationModuleKey(module);
}
