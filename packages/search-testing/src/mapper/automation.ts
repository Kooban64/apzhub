/**
 * AutomationSearchMapper — automation domain → SearchEntityDraft (APZSEARCH-013).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";
import type {
  AutomationCoverageSnapshot,
  AutomationImport,
  AutomationRun,
  CanonicalAutomationSuite,
} from "@apzhub/testing-contracts";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import {
  assertPlatformEntityId,
  assertTenant,
  isAutomationSuiteSearchInput,
  navigationTarget,
  permissionTokens,
  resolveTestingClassification,
  type AutomationSuiteSearchInput,
  type TestingSearchMappableEntity,
  type TestingSearchMappingExtras,
} from "./shared";

export type AutomationMappableEntity = Extract<
  TestingSearchMappableEntity,
  {
    readonly entityType:
      "automation_run" | "automation_suite" | "imported_result" | "coverage_summary";
  }
>;

export class AutomationSearchMapper {
  map(
    context: TestingSearchPublicationContext,
    input: AutomationMappableEntity,
  ): SearchEntityDraft {
    switch (input.entityType) {
      case "automation_run":
        return this.mapAutomationRun(context, input.entity, input.extras);
      case "automation_suite":
        return this.mapAutomationSuite(context, input.entity, input.extras);
      case "imported_result":
        return this.mapImportedResult(context, input.entity, input.extras);
      case "coverage_summary":
        return this.mapCoverageSummary(context, input.entity, input.extras);
    }
  }

  mapAutomationRun(
    context: TestingSearchPublicationContext,
    run: AutomationRun,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(run.id, "automation_run.id");
    assertTenant(run.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: run.status,
    });
    return {
      entityId: run.id,
      entityType: "automation_run",
      title: run.title,
      summary: run.message?.slice(0, 280),
      organisationId:
        run.organisationId ?? extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, run.status, classification),
      metadata: {
        status: run.status,
        executionId: run.executionId,
        ...(run.suiteKey ? { key: run.suiteKey } : {}),
        ...(run.caseKey ? { caseId: run.caseKey } : {}),
      },
      keywords: [run.title, run.status, ...(run.tags ?? [])],
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
      navigationTarget: navigationTarget("automation_run", run.id),
      sourceId: "testing:automation_run",
      ownerUserId: run.createdBy ?? context.actorUserId,
      version: run.revision !== undefined ? String(run.revision) : undefined,
    };
  }

  mapAutomationSuite(
    context: TestingSearchPublicationContext,
    suite: CanonicalAutomationSuite | AutomationSuiteSearchInput,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    const id =
      (isAutomationSuiteSearchInput(suite) ? suite.id : undefined) ?? extras?.entityId;
    if (!id) {
      throw new Error("automation_suite requires id on entity or extras.entityId");
    }
    assertPlatformEntityId(id, "automation_suite.id");
    const tenantId =
      (isAutomationSuiteSearchInput(suite) ? suite.tenantId : undefined) ??
      extras?.tenantId;
    if (!tenantId) {
      throw new Error(
        "tenantId is required via entity or extras when mapping automation_suite",
      );
    }
    assertTenant(tenantId, context);
    const title = isAutomationSuiteSearchInput(suite) ? suite.title : suite.name;
    const status = isAutomationSuiteSearchInput(suite) ? suite.status : suite.status;
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status,
    });
    const caseCount = isAutomationSuiteSearchInput(suite)
      ? suite.caseCount
      : suite.cases.length;
    return {
      entityId: id,
      entityType: "automation_suite",
      title,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, status, classification),
      metadata: {
        ...(status ? { status } : {}),
        ...(caseCount !== undefined ? { caseCount: String(caseCount) } : {}),
        ...(isAutomationSuiteSearchInput(suite) && suite.key
          ? { key: suite.key }
          : !isAutomationSuiteSearchInput(suite) && suite.key
            ? { key: suite.key }
            : {}),
      },
      keywords: [title, ...(status ? [status] : [])],
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
      navigationTarget: navigationTarget("automation_suite", id),
      sourceId: "testing:automation_suite",
      ownerUserId: context.actorUserId,
    };
  }

  mapImportedResult(
    context: TestingSearchPublicationContext,
    imported: AutomationImport,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(imported.id, "imported_result.id");
    assertTenant(imported.tenantId, context);
    // NEVER checksum, payloadFingerprint
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: imported.status,
    });
    const title =
      extras?.title ??
      `Import ${imported.adapterKind} ${imported.externalRunRef}`.slice(0, 120);
    return {
      entityId: imported.id,
      entityType: "imported_result",
      title,
      summary: imported.errorSummary?.slice(0, 280),
      organisationId:
        imported.organisationId ?? extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, imported.status, classification),
      metadata: {
        status: imported.status,
        adapterKind: imported.adapterKind,
        externalRunRef: imported.externalRunRef,
        checksumPresent: imported.checksum ? "true" : "false",
        ...(imported.revision !== undefined
          ? { revision: String(imported.revision) }
          : {}),
      },
      keywords: [title, imported.status, imported.adapterKind],
      createdAt: imported.createdAt,
      updatedAt: imported.updatedAt,
      navigationTarget: navigationTarget("imported_result", imported.id),
      sourceId: "testing:imported_result",
      ownerUserId: imported.createdBy ?? context.actorUserId,
      version: imported.revision !== undefined ? String(imported.revision) : undefined,
    };
  }

  mapCoverageSummary(
    context: TestingSearchPublicationContext,
    snapshot: AutomationCoverageSnapshot,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(snapshot.id, "coverage_summary.id");
    assertTenant(snapshot.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const pct = snapshot.percentage ?? snapshot.summary.percentage ?? undefined;
    const title =
      extras?.title ??
      `Coverage ${pct !== undefined ? `${pct}%` : snapshot.id.slice(0, 12)}`;
    return {
      entityId: snapshot.id,
      entityType: "coverage_summary",
      title,
      organisationId:
        snapshot.organisationId ?? extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        ...(snapshot.importId ? { importId: snapshot.importId } : {}),
        ...(snapshot.executionId ? { executionId: snapshot.executionId } : {}),
        coveredCount: String(snapshot.coveredCount ?? snapshot.summary.covered ?? 0),
        totalCount: String(snapshot.totalCount ?? snapshot.summary.total ?? 0),
        ...(pct !== undefined ? { percentage: String(pct) } : {}),
        ...(snapshot.summary.kind ? { kind: snapshot.summary.kind } : {}),
      },
      keywords: [title],
      createdAt: snapshot.createdAt,
      updatedAt: snapshot.updatedAt,
      navigationTarget: navigationTarget("coverage_summary", snapshot.id),
      sourceId: "testing:coverage_summary",
      ownerUserId: snapshot.createdBy ?? context.actorUserId,
    };
  }
}
