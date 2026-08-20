import { describe, expect, it, vi } from "vitest";

import {
  requireQepProjectMembership,
  requireQepProjectOrApplication,
} from "./project-acl";

vi.mock("@/lib/qep/application-runtime", () => ({
  getApplicationService: () => ({
    get: async (_tenantId: string, id: string) => {
      if (id === "qapp-known") return { id };
      throw new Error("application.not_found");
    },
  }),
}));

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

  it("accepts a tenant QEP application when Plane project membership is missing", async () => {
    const resolver = vi.fn().mockResolvedValue(false);
    await expect(
      requireQepProjectOrApplication(context, "qapp-known", {
        required: true,
        resolver,
      }),
    ).resolves.toBeUndefined();
  });

  it("still fails closed when neither Plane project nor QEP application exists", async () => {
    const resolver = vi.fn().mockResolvedValue(false);
    await expect(
      requireQepProjectOrApplication(context, "missing-id", {
        required: true,
        resolver,
      }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
