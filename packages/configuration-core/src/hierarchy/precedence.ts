/**
 * Configuration hierarchy / override precedence (APZCONFIG-001).
 * Metadata only — no runtime resolution of effective values.
 */

import type {
  ConfigurationHierarchyLevel,
  ConfigurationOverride,
} from "@apzhub/configuration-contracts";
import {
  CONFIGURATION_HIERARCHY_LEVELS,
  CONFIGURATION_OVERRIDE_PRECEDENCE,
  isConfigurationHierarchyLevel,
} from "@apzhub/configuration-contracts";

import { ConfigurationDomainError } from "../ports/repository-ports";

export {
  CONFIGURATION_HIERARCHY_LEVELS,
  CONFIGURATION_OVERRIDE_PRECEDENCE,
  isConfigurationHierarchyLevel,
};

/** Lower index in OVERRIDE_PRECEDENCE = higher priority (wins). */
export function precedenceRankForHierarchyLevel(
  level: ConfigurationHierarchyLevel,
): number {
  const index = CONFIGURATION_OVERRIDE_PRECEDENCE.indexOf(level);
  if (index < 0) {
    throw new ConfigurationDomainError(
      "invalid_hierarchy_level",
      `Unknown hierarchy level: ${level}`,
      { level },
    );
  }
  return index;
}

/**
 * Sort overrides by precedence (winning override first).
 * Does not apply values — ordering metadata only.
 */
export function sortOverridesByPrecedence(
  overrides: readonly ConfigurationOverride[],
): readonly ConfigurationOverride[] {
  return [...overrides].sort(
    (a, b) => a.precedenceRank - b.precedenceRank,
  );
}

export function assertValidHierarchyLevel(level: string): ConfigurationHierarchyLevel {
  if (!isConfigurationHierarchyLevel(level)) {
    throw new ConfigurationDomainError(
      "invalid_hierarchy_level",
      `Invalid hierarchy level: ${level}`,
      { level },
    );
  }
  return level;
}

/** Whether child level may inherit from parent level (metadata rule). */
export function canInheritFrom(
  child: ConfigurationHierarchyLevel,
  parent: ConfigurationHierarchyLevel,
): boolean {
  const childIdx = CONFIGURATION_HIERARCHY_LEVELS.indexOf(child);
  const parentIdx = CONFIGURATION_HIERARCHY_LEVELS.indexOf(parent);
  return parentIdx >= 0 && childIdx > parentIdx;
}
