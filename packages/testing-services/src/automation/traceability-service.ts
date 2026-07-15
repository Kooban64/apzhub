import type {
  AutomationTraceabilityService,
  TraceabilityLinkType,
} from "@apzhub/testing-contracts";
import { asTraceabilityLinkId } from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import type { ServiceRuntime } from "../services/types";

export function createAutomationTraceabilityService(
  rt: ServiceRuntime,
): AutomationTraceabilityService {
  return {
    async linkImportedResult(ctx, input) {
      const rctx = toRepositoryContext(ctx);
      const linkIds: string[] = [];

      async function link(
        type: TraceabilityLinkType,
        sourceKind: string,
        sourceId: string,
        targetKind: string,
        targetId: string,
        notes?: string,
      ) {
        const row = await rt.persistence.traceabilityLinks.create(rctx, {
          type,
          sourceKind,
          sourceId,
          targetKind,
          targetId,
          notes,
        });
        linkIds.push(row.id);
      }

      await link(
        "verifies",
        "automation_import",
        input.importId,
        "automated_execution",
        input.executionId,
        "import produced execution",
      );

      for (const suite of input.result.suites) {
        for (const c of suite.cases) {
          for (const req of c.requirementRefs ?? []) {
            await link(
              "covers",
              "automated_execution",
              input.executionId,
              "requirement",
              req,
              c.title,
            );
          }
          for (const story of c.storyRefs ?? []) {
            await link(
              "related",
              "automated_execution",
              input.executionId,
              "story",
              story,
              c.title,
            );
          }
          for (const plan of c.planRefs ?? []) {
            await link(
              "related",
              "automated_execution",
              input.executionId,
              "test_plan",
              plan,
              c.title,
            );
          }
          for (const caseRef of c.caseRefs ?? []) {
            await link(
              "verifies",
              "automated_execution",
              input.executionId,
              "test_case",
              caseRef,
              c.title,
            );
          }
        }
      }

      for (const extra of input.extraLinks ?? []) {
        await link(
          extra.type ?? "related",
          extra.sourceKind,
          extra.sourceId,
          extra.targetKind,
          extra.targetId,
          extra.notes,
        );
      }

      rt.events.record({
        eventType: "automation.traceability_linked",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          importId: input.importId,
          executionId: input.executionId,
          linkCount: linkIds.length,
        },
      });

      return linkIds.map((id) => asTraceabilityLinkId(id));
    },
  };
}
