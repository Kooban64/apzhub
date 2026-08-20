import type { DestinationWriter, TargetReader } from "@apzhub/qep-ai";

import { getDefinitionService } from "./definition-runtime";
import { getExperienceService } from "./experience-runtime";
import { getTestManagementService } from "./test-management-runtime";

export function createPhase7DestinationWriter(): DestinationWriter {
  return {
    async write(input) {
      const title = String(input.content.title ?? "").trim();
      if (input.proposalType === "test_case") {
        const item = await getTestManagementService().createTestCase({
          tenantId: input.tenantId,
          applicationId: input.applicationId,
          actorId: input.actorId,
          title,
          description: String(input.content.description ?? title),
        });
        return { recordId: item.id, recordKind: "test_case" };
      }
      if (input.proposalType === "suite") {
        const item = await getTestManagementService().createSuite({
          tenantId: input.tenantId,
          applicationId: input.applicationId,
          actorId: input.actorId,
          name: title,
          description: String(input.content.description ?? title),
        });
        return { recordId: item.id, recordKind: "suite" };
      }
      if (input.proposalType === "test_plan") {
        const item = await getTestManagementService().createPlan({
          tenantId: input.tenantId,
          applicationId: input.applicationId,
          actorId: input.actorId,
          title,
          objective: String(input.content.objective ?? title),
        });
        return { recordId: item.id, recordKind: "test_plan" };
      }
      if (input.proposalType === "user_story") {
        const requirementId = String(input.content.requirementId ?? "").trim();
        if (!requirementId) throw new Error("ai.accept.requirement_required");
        const story = await getDefinitionService().createStory({
          tenantId: input.tenantId,
          applicationId: input.applicationId,
          requirementId,
          title,
          actorId: input.actorId,
          description: String(input.content.description ?? ""),
          originType: "ai_accepted",
          acceptedBy: input.actorId,
        });
        return { recordId: story.id, recordKind: "user_story" };
      }
      if (input.proposalType === "acceptance_criterion") {
        const requirementId = String(input.content.requirementId ?? "").trim();
        if (!requirementId) throw new Error("ai.accept.requirement_required");
        const criterion = await getDefinitionService().createCriterion({
          tenantId: input.tenantId,
          applicationId: input.applicationId,
          requirementId,
          text: title,
          actorId: input.actorId,
          originType: "ai_accepted",
          acceptedBy: input.actorId,
        });
        return { recordId: criterion.id, recordKind: "acceptance_criterion" };
      }
      if (input.proposalType === "exploratory_charter") {
        const item = await getExperienceService().createSession({
          tenantId: input.tenantId,
          applicationId: input.applicationId,
          actorId: input.actorId,
          name: title,
          mission: String(input.content.mission ?? input.content.description ?? title),
          scope: String(input.content.scope ?? "Application quality charter"),
        });
        return { recordId: item.id, recordKind: "exploratory_session" };
      }
      throw new Error("ai.accept.forbidden_type");
    },
  };
}

export function createPhase7TargetReader(): TargetReader {
  return {
    async fingerprint(input) {
      if (input.proposalType === "test_case") {
        try {
          const row = await getTestManagementService().getTestCase(
            input.tenantId,
            input.targetId,
          );
          return { targetId: row.id, updatedAt: row.updatedAt };
        } catch {
          return undefined;
        }
      }
      if (
        input.proposalType === "acceptance_criterion" ||
        input.proposalType === "user_story"
      ) {
        try {
          if (input.proposalType === "user_story") {
            const row = await getDefinitionService().getStory(
              input.tenantId,
              input.targetId,
            );
            return { targetId: row.id, updatedAt: row.updatedAt };
          }
          const row = await getDefinitionService().getCriterion(
            input.tenantId,
            input.targetId,
          );
          return { targetId: row.id, updatedAt: row.updatedAt };
        } catch {
          return undefined;
        }
      }
      return undefined;
    },
  };
}
