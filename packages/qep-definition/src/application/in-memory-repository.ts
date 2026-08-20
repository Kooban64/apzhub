import type {
  DefinitionAuditEntry,
  QepAcceptanceCriterion,
  QepCriterionVerificationLink,
  QepUserStory,
} from "../domain/types";
import type {
  CriterionListFilter,
  DefinitionRepository,
  StoryListFilter,
} from "./repository";

export function createInMemoryDefinitionRepository(): DefinitionRepository {
  const stories = new Map<string, QepUserStory>();
  const criteria = new Map<string, QepAcceptanceCriterion>();
  const verifications = new Map<string, QepCriterionVerificationLink>();
  const counters = new Map<string, number>();
  const audit: DefinitionAuditEntry[] = [];

  function scoped<T extends { tenantId: string; id: string }>(
    tenantId: string,
    id: string,
    store: Map<string, T>,
  ): T | undefined {
    const row = store.get(id);
    return row?.tenantId === tenantId ? row : undefined;
  }

  return {
    async nextKeyNumber(tenantId, applicationId, kind) {
      const key = `${tenantId}:${applicationId}:${kind}`;
      const next = (counters.get(key) ?? 0) + 1;
      counters.set(key, next);
      return next;
    },

    async getStory(tenantId, storyId) {
      return scoped(tenantId, storyId, stories);
    },

    async listStories(filter: StoryListFilter) {
      return [...stories.values()]
        .filter((row) => row.tenantId === filter.tenantId)
        .filter((row) =>
          filter.applicationId ? row.applicationId === filter.applicationId : true,
        )
        .filter((row) =>
          filter.requirementId ? row.requirementId === filter.requirementId : true,
        )
        .filter((row) => (filter.includeArchived ? true : row.status !== "archived"))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    },

    async saveStory(story) {
      stories.set(story.id, story);
    },

    async getCriterion(tenantId, criterionId) {
      return scoped(tenantId, criterionId, criteria);
    },

    async getCriterionByLegacySource(tenantId, requirementId, sourceKind, sourceIndex) {
      return [...criteria.values()].find(
        (row) =>
          row.tenantId === tenantId &&
          row.requirementId === requirementId &&
          row.legacySourceKind === sourceKind &&
          row.legacySourceIndex === sourceIndex,
      );
    },

    async listCriteria(filter: CriterionListFilter) {
      return [...criteria.values()]
        .filter((row) => row.tenantId === filter.tenantId)
        .filter((row) =>
          filter.applicationId ? row.applicationId === filter.applicationId : true,
        )
        .filter((row) =>
          filter.requirementId ? row.requirementId === filter.requirementId : true,
        )
        .filter((row) => {
          if (filter.userStoryId === undefined) return true;
          if (filter.userStoryId === null) return !row.userStoryId;
          return row.userStoryId === filter.userStoryId;
        })
        .filter((row) => (filter.includeArchived ? true : row.status !== "archived"))
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder || a.criterionKey.localeCompare(b.criterionKey),
        );
    },

    async saveCriterion(criterion) {
      criteria.set(criterion.id, criterion);
    },

    async listVerification(tenantId, criterionId) {
      return [...verifications.values()].filter(
        (row) => row.tenantId === tenantId && row.criterionId === criterionId,
      );
    },

    async getVerification(tenantId, linkId) {
      return scoped(tenantId, linkId, verifications);
    },

    async saveVerification(link) {
      verifications.set(link.id, link);
    },

    async deleteVerification(tenantId, linkId) {
      const row = verifications.get(linkId);
      if (row?.tenantId === tenantId) verifications.delete(linkId);
    },

    async appendAudit(entry) {
      audit.push(entry);
    },

    async listAudit(tenantId, requirementId) {
      return audit.filter(
        (row) => row.tenantId === tenantId && row.requirementId === requirementId,
      );
    },
  };
}
