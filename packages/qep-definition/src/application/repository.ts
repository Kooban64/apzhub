import type {
  DefinitionAuditEntry,
  QepAcceptanceCriterion,
  QepCriterionVerificationLink,
  QepUserStory,
} from "../domain/types";

export type StoryListFilter = {
  readonly tenantId: string;
  readonly applicationId?: string;
  readonly requirementId?: string;
  readonly includeArchived?: boolean;
};

export type CriterionListFilter = {
  readonly tenantId: string;
  readonly applicationId?: string;
  readonly requirementId?: string;
  readonly userStoryId?: string | null;
  readonly includeArchived?: boolean;
};

export type DefinitionRepository = {
  nextKeyNumber(
    tenantId: string,
    applicationId: string,
    kind: "user_story" | "acceptance_criterion",
  ): Promise<number>;

  getStory(tenantId: string, storyId: string): Promise<QepUserStory | undefined>;
  listStories(filter: StoryListFilter): Promise<readonly QepUserStory[]>;
  saveStory(story: QepUserStory): Promise<void>;

  getCriterion(
    tenantId: string,
    criterionId: string,
  ): Promise<QepAcceptanceCriterion | undefined>;
  getCriterionByLegacySource(
    tenantId: string,
    requirementId: string,
    sourceKind: string,
    sourceIndex: number,
  ): Promise<QepAcceptanceCriterion | undefined>;
  listCriteria(filter: CriterionListFilter): Promise<readonly QepAcceptanceCriterion[]>;
  saveCriterion(criterion: QepAcceptanceCriterion): Promise<void>;

  listVerification(
    tenantId: string,
    criterionId: string,
  ): Promise<readonly QepCriterionVerificationLink[]>;
  getVerification(
    tenantId: string,
    linkId: string,
  ): Promise<QepCriterionVerificationLink | undefined>;
  saveVerification(link: QepCriterionVerificationLink): Promise<void>;
  deleteVerification(tenantId: string, linkId: string): Promise<void>;

  appendAudit(entry: DefinitionAuditEntry): Promise<void>;
  listAudit(
    tenantId: string,
    requirementId: string,
  ): Promise<readonly DefinitionAuditEntry[]>;
};
