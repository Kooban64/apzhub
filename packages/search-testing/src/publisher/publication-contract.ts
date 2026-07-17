/**
 * Canonical publication contract for specialised Testing search publishers.
 */

import type {
  SearchEntityLifecycleState,
  SearchPublicationResult,
} from "@apzhub/search-integration";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import type { TestingSearchMappableEntity } from "../mapper/shared";
import type { TestingSearchEntityType } from "../types/entity-types";

export type TestingSearchDomainId =
  | "manual"
  | "automation"
  | "certification"
  | "release"
  | "engineering_intelligence"
  | "quality"
  | "reporting_metadata"
  | "pipeline";

/**
 * Shared contract for all specialised Testing domain search publishers.
 * Each publisher owns a fixed set of entity types and domain mapping.
 */
export interface TestingDomainSearchPublisher {
  readonly domain: TestingSearchDomainId;
  readonly entityTypes: readonly TestingSearchEntityType[];

  accepts(entityType: TestingSearchEntityType): boolean;

  validate(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchPublicationResult;

  preview(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchPublicationResult;

  publish(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchPublicationResult;

  update(
    context: TestingSearchPublicationContext,
    input: TestingSearchMappableEntity,
  ): SearchPublicationResult;

  remove(
    context: TestingSearchPublicationContext,
    entityType: TestingSearchEntityType,
    entityId: string,
  ): SearchPublicationResult;

  lifecycle?(
    context: TestingSearchPublicationContext,
    entityId: string,
    state: SearchEntityLifecycleState,
    reason?: string,
  ): SearchPublicationResult;
}

/** Entity-type ownership for specialised publishers / orchestrator routing. */
export const TESTING_SEARCH_DOMAIN_ENTITY_TYPES = {
  manual: [
    "test_plan",
    "test_suite",
    "test_case",
    "test_execution",
    "test_run",
    "execution_step",
    "evidence",
    "approval",
    "requirement",
    "defect",
  ],
  automation: [
    "automation_run",
    "automation_suite",
    "imported_result",
    "coverage_summary",
  ],
  certification: [
    "certification",
    "certification_gate",
    "certification_approval",
    "certification_evidence",
    "certification_decision",
  ],
  release: [
    "release",
    "release_candidate",
    "release_package",
    "release_scope",
    "release_approval",
    "release_decision",
    "release_manifest",
    "release_summary",
  ],
  engineering_intelligence: [
    "engineering_snapshot",
    "engineering_trend",
    "benchmark",
    "historical_snapshot",
    "risk_summary",
  ],
  quality: ["quality_summary", "quality_coverage_summary", "defect_summary"],
  reporting_metadata: ["report_metadata", "report_template"],
  pipeline: ["pipeline", "pipeline_run", "pipeline_import"],
} as const satisfies Record<
  TestingSearchDomainId,
  readonly TestingSearchEntityType[]
>;
