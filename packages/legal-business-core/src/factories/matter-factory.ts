import type { Matter } from "../domain";
import { ReferenceNumberGenerator } from "../reference";
import { createEntityId } from "./id";

export interface MatterFactoryInput {
  readonly title: string;
  readonly clientId: string;
  readonly matterTypeId: string;
  readonly practiceAreaId: string;
  readonly leadAttorneyId: string;
  readonly matterReference?: string;
  readonly matterStatus?: Matter["matterStatus"];
  readonly priority?: Matter["priority"];
}

const defaultReferenceGenerator = new ReferenceNumberGenerator();

export const MatterFactory = {
  create(input: MatterFactoryInput): Matter {
    const now = new Date().toISOString();

    return {
      matterId: createEntityId("m"),
      matterReference:
        input.matterReference ?? defaultReferenceGenerator.nextMatterReference(),
      title: input.title.trim(),
      clientId: input.clientId,
      matterTypeId: input.matterTypeId,
      matterStatus: input.matterStatus ?? "open",
      practiceAreaId: input.practiceAreaId,
      priority: input.priority ?? "normal",
      openedAt: now,
      leadAttorneyId: input.leadAttorneyId,
      teamMemberIds: [input.leadAttorneyId],
      tags: [],
      customFields: {},
    };
  },
};
