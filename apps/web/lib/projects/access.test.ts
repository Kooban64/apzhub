import { beforeEach, describe, expect, it } from "vitest";

import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import {
  resetProductAccessForTests,
  setUserProductGrants,
  upsertOrgProductSubscription,
} from "@/lib/commercial/product-access";
import { requireProjectsProductAccess } from "@/lib/projects/access";

function makeContext(input: {
  readonly userId: string;
  readonly tenantId: string;
}): PlatformApiRequestContext {
  return {
    tracing: { requestId: "req", correlationId: "cor" },
    session: {
      user: {
        id: input.userId,
        email: `${input.userId}@example.com`,
        activeTenantId: input.tenantId,
        tenantId: input.tenantId,
      },
      tenantId: input.tenantId,
    },
    serviceContext: {
      tenantId: input.tenantId,
      permissions: [],
    },
  } as PlatformApiRequestContext;
}

describe("requireProjectsProductAccess", () => {
  beforeEach(() => {
    resetProductAccessForTests();
  });

  it("allows bootstrap tenants with no subscriptions", () => {
    expect(() =>
      requireProjectsProductAccess(makeContext({ userId: "u1", tenantId: "t-boot" })),
    ).not.toThrow();
  });

  it("denies when org subscribed but user not granted", () => {
    upsertOrgProductSubscription({
      organisationId: "t-org",
      productKey: "qep",
      planId: "plan.business",
      status: "active",
    });
    expect(() =>
      requireProjectsProductAccess(makeContext({ userId: "u1", tenantId: "t-org" })),
    ).toThrow(PlatformApiHttpError);
  });

  it("allows when org and user entitled to projects", () => {
    upsertOrgProductSubscription({
      organisationId: "t-org",
      productKey: "projects",
      planId: "plan.business",
      status: "active",
    });
    setUserProductGrants({
      organisationId: "t-org",
      userId: "u1",
      productKeys: ["projects"],
    });
    expect(() =>
      requireProjectsProductAccess(makeContext({ userId: "u1", tenantId: "t-org" })),
    ).not.toThrow();
  });
});
