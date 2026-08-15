import { beforeEach, describe, expect, it } from "vitest";

import {
  createArticle,
  listArticles,
  publishArticle,
  resetKnowledgeStoreForTests,
} from "./knowledge-store";

describe("knowledge-store (SPR-APZQEP-220-B)", () => {
  beforeEach(() => {
    resetKnowledgeStoreForTests();
  });

  it("creates draft articles and lists them", () => {
    const article = createArticle({
      title: "Smoke checklist",
      body: "Run smoke before RC.",
      tags: ["smoke", "rc"],
      actorId: "user-1",
    });
    expect(article.articleId).toMatch(/^art_/);
    expect(article.status).toBe("draft");
    expect(article.tags).toEqual(["smoke", "rc"]);
    expect(listArticles()).toHaveLength(1);
  });

  it("publishes a draft article", () => {
    const draft = createArticle({
      title: "Defect triage",
      body: "Severity first.",
      actorId: "user-1",
    });
    const published = publishArticle({ articleId: draft.articleId });
    expect(published?.status).toBe("published");
    expect(listArticles()[0]?.status).toBe("published");
  });

  it("returns null when publishing unknown id", () => {
    expect(publishArticle({ articleId: "art_missing" })).toBeNull();
  });
});
