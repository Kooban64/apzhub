import { describe, expect, it } from "vitest";

import { createInMemoryTestingPersistence, type RepositoryContext } from "../../index";

function ctx(overrides?: Partial<RepositoryContext>): RepositoryContext {
  return {
    tenantId: "tenant-a",
    organisationId: "org-a",
    actorUserId: "user-1",
    correlationId: "corr-report-1",
    permissions: ["report.*", "testing.admin"],
    ...overrides,
  };
}

describe("reporting repositories (in-memory)", () => {
  it("creates, lists, gets, and archives report templates", async () => {
    const db = createInMemoryTestingPersistence();
    const c = ctx();

    const template = await db.reportTemplates.create(c, {
      reportType: "quality_summary",
      name: "Quality Summary",
      description: "Builtin quality report",
      version: "1.0.0",
      title: "Quality Summary Report",
      subtitle: "Release readiness",
      header: "APZHUB",
      footer: "Confidential",
      brandingJson: { logo: "apz" },
      metadataJson: { locale: "en" },
      metricKeysJson: ["pass_rate", "coverage"],
      sectionsJson: [{ id: "overview" }],
      builtin: true,
    });

    expect(template.reportType).toBe("quality_summary");
    expect(template.name).toBe("Quality Summary");
    expect(template.builtin).toBe(true);
    expect(template.revision).toBe(1);

    const listed = await db.reportTemplates.list(c);
    expect(listed.total).toBe(1);
    expect(listed.items[0]?.id).toBe(template.id);

    const got = await db.reportTemplates.get(c, template.id);
    expect(got?.title).toBe("Quality Summary Report");
    expect(got?.metricKeysJson).toEqual(["pass_rate", "coverage"]);

    const archived = await db.reportTemplates.archive(c, template.id, 1);
    expect(archived.archivedAt).toBeTruthy();
  });

  it("creates, lists, gets, and archives report generation metadata", async () => {
    const db = createInMemoryTestingPersistence();
    const c = ctx();
    const generatedAt = "2026-07-13T00:00:00.000Z";

    const meta = await db.reportGenerationMetadata.create(c, {
      requestId: "req-1",
      templateId: "tmpl-1",
      reportType: "quality_summary",
      outputFormat: "pdf",
      parametersJson: JSON.stringify({ releaseId: "rel-1" }),
      generatedAt,
      generatedBy: "user-1",
      version: "1.0.0",
      checksumSha256: "a".repeat(64),
      byteLength: 2048,
      preview: false,
    });

    expect(meta.requestId).toBe("req-1");
    expect(meta.generatedAt).toBe(generatedAt);
    expect(meta.parametersJson).toContain("rel-1");
    expect(meta.byteLength).toBe(2048);

    const listed = await db.reportGenerationMetadata.list(c);
    expect(listed.total).toBe(1);

    const got = await db.reportGenerationMetadata.get(c, meta.id);
    expect(got?.checksumSha256).toBe("a".repeat(64));
    expect(got?.preview).toBe(false);

    const archived = await db.reportGenerationMetadata.archive(c, meta.id, 1);
    expect(archived.archivedAt).toBeTruthy();
  });

  it("rejects updates to report generation metadata as immutable", async () => {
    const db = createInMemoryTestingPersistence();
    const c = ctx();

    const meta = await db.reportGenerationMetadata.create(c, {
      requestId: "req-2",
      templateId: "tmpl-2",
      reportType: "traceability",
      outputFormat: "html",
      parametersJson: "{}",
      generatedAt: new Date().toISOString(),
      generatedBy: "user-1",
      version: "1.0.0",
      checksumSha256: "b".repeat(64),
      byteLength: 100,
      preview: true,
    });

    await expect(
      db.reportGenerationMetadata.update(c, meta.id, 1, {
        byteLength: 999,
      }),
    ).rejects.toThrow("Report generation metadata is immutable");
  });

  it("updates templates and rejects incomplete creates", async () => {
    const db = createInMemoryTestingPersistence();
    const c = ctx();
    const created = await db.reportTemplates.create(c, {
      reportType: "qa",
      name: "QA",
      version: "1.0.0",
      title: "QA Report",
      builtin: false,
      sectionsJson: [],
      brandingJson: {},
      metadataJson: {},
      metricKeysJson: [],
    });
    const updated = await db.reportTemplates.update(c, created.id, 1, {
      title: "QA Report v2",
      description: "Updated",
    });
    expect(updated.title).toBe("QA Report v2");
    expect(updated.revision).toBe(2);

    await expect(
      db.reportTemplates.create(c, {
        reportType: "",
        name: "x",
        version: "1",
        title: "t",
      } as never),
    ).rejects.toThrow();
  });
});
