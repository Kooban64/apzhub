import { beforeEach, describe, expect, it } from "vitest";

import {
  getMemoryOperationalFrictionStore,
  resetMemoryOperationalFrictionStoreForTests,
  setOperationalFrictionStoreForTests,
} from "@apzhub/platform-services";

import {
  handleCreateOperationalFriction,
  handleGetOperationalFriction,
  handleListOperationalFriction,
  handleListOperationalFrictionAudit,
  handleUpdateOperationalFriction,
} from "./operational-friction";

function request(url: string, init?: RequestInit) {
  return new Request(url, init) as unknown as import("next/server").NextRequest;
}

const context = {
  serviceContext: {
    userId: "user_board",
    tenantId: "tenant_1",
    correlationId: "c1",
    requestId: "r1",
    permissions: ["admin.read", "admin.manage"],
  },
  session: { user: { id: "user_board", name: "Board" } },
  tracing: {
    requestId: "r1",
    correlationId: "c1",
    timestamp: "2026-08-06T14:20:00.000Z",
  },
} as never;

describe("operational friction handlers", () => {
  beforeEach(() => {
    resetMemoryOperationalFrictionStoreForTests();
    setOperationalFrictionStoreForTests(getMemoryOperationalFrictionStore());
  });

  it("supports create, review, outcome, and audit workflow", async () => {
    const createdResponse = await handleCreateOperationalFriction(
      request("http://localhost/api/v1/product-board/friction", {
        method: "POST",
        body: JSON.stringify({
          title: "PMs miss delivery risk",
          reporter: "Product Board",
          productsAffected: ["projects"],
          userRole: "Project Manager",
          frustration: "Project managers cannot easily see delivery risk.",
          whoExperiences: "Project Manager",
          evidence: "Delivery review observations.",
          nonEngineeringOptions: "Training insufficient.",
          smallestCapability: "Surface top risk signals on project overview.",
          source: "manual",
        }),
      }),
      context,
    );
    expect(createdResponse.status).toBe(201);
    const createdBody = await createdResponse.json();
    const id = createdBody.data.id as string;

    const listResponse = await handleListOperationalFriction(
      request("http://localhost/api/v1/product-board/friction"),
      context,
    );
    const listBody = await listResponse.json();
    expect(listBody.data.items).toHaveLength(1);

    const updatedResponse = await handleUpdateOperationalFriction(
      request(`http://localhost/api/v1/product-board/friction/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          boardDecision: "accepted",
          engineeringStatus: "delivered",
          outcomeFaster: true,
          outcomeClearer: true,
          outcomeSafer: false,
          outcomeBetterDecision: true,
        }),
      }),
      context,
      id,
    );
    expect(updatedResponse.status).toBe(200);
    const updatedBody = await updatedResponse.json();
    expect(updatedBody.data.boardDecision).toBe("accepted");
    expect(updatedBody.data.outcomeFaster).toBe(true);

    const getResponse = await handleGetOperationalFriction(
      request(`http://localhost/api/v1/product-board/friction/${id}`),
      context,
      id,
    );
    expect((await getResponse.json()).data.id).toBe(id);

    const auditResponse = await handleListOperationalFrictionAudit(
      request(`http://localhost/api/v1/product-board/friction/${id}/audit`),
      context,
      id,
    );
    const auditBody = await auditResponse.json();
    expect(auditBody.data.items.length).toBeGreaterThanOrEqual(2);
  });
});
