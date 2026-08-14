import { describe, expect, it, vi } from "vitest";

import { requireQepProjectMembership } from "./project-acl";

const context = {
  serviceContext: { tenantId: "tenant_1" },
} as Parameters<typeof requireQepProjectMembership>[0];

describe("QEP project membership ACL", () => {
  it("allows an accessible project", async () => {
    const resolver = vi.fn().mockResolvedValue(true);
    await expect(
      requireQepProjectMembership(context, "project_1", {
        required: true,
        resolver,
      }),
    ).resolves.toBeUndefined();
  });

  it("fails closed when membership is missing", async () => {
    const resolver = vi.fn().mockResolvedValue(false);
    await expect(
      requireQepProjectMembership(context, "project_1", {
        required: true,
        resolver,
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("fails closed when membership resolution errors", async () => {
    const resolver = vi.fn().mockRejectedValue(new Error("provider unavailable"));
    await expect(
      requireQepProjectMembership(context, "project_1", {
        required: true,
        resolver,
      }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("does not require membership for unscoped operations", async () => {
    const resolver = vi.fn();
    await requireQepProjectMembership(context, undefined, {
      required: true,
      resolver,
    });
    expect(resolver).not.toHaveBeenCalled();
  });
});
