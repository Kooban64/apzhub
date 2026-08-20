import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createInMemoryAiProposalRepository, createQepAiService } from "@apzhub/qep-ai";
import { createQepApplicationRegistry } from "@apzhub/qep-applications";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { buildMockSession, buildTestServiceContext } from "../testing/fixtures";

vi.mock("@/lib/commercial/require-product-access", () => ({
  requireProductAccess: () => undefined,
}));

const apps = createQepApplicationRegistry();
const aiRepo = createInMemoryAiProposalRepository();
const aiService = createQepAiService(aiRepo);

vi.mock("@/lib/qep/application-runtime", () => ({
  getApplicationService: () => apps.service,
}));

vi.mock("@/lib/qep/ai-runtime", () => ({
  getQepAiService: () => aiService,
  resetQepAiServiceForTests: () => undefined,
}));

vi.mock("@/lib/qep/ai-context-composer", async () => {
  const { composeDeterministicAnalysis } = await import("@apzhub/qep-ai");
  return {
    composePermissionSafeAiContext: async (input: {
      tenantId: string;
      applicationId: string;
      granted: readonly string[];
      includeSource?: boolean;
    }) => {
      const { hasSourceRead } = await import("@apzhub/qep-ai");
      const sourceOk = hasSourceRead(input.granted);
      return {
        tenantId: input.tenantId,
        applicationId: input.applicationId,
        sourceAccess: sourceOk ? "authorised" : "not_authorised",
        sourceAuthorised: Boolean(sourceOk && input.includeSource),
        evidenceMode: "metadata",
        records: [{ kind: "test_case", id: "tc-1", title: "Login", updatedAt: "t1" }],
        evidence: [],
        ...(sourceOk && input.includeSource
          ? {
              source: {
                repositoryId: "repo-1",
                path: "(repository association metadata)",
              },
            }
          : {}),
        denied: sourceOk ? [] : ["source.read"],
      };
    },
    composeDeterministicQualityAnalysis: async (input: {
      tenantId: string;
      applicationId: string;
    }) =>
      composeDeterministicAnalysis({
        tenantId: input.tenantId,
        applicationId: input.applicationId,
        acWithoutVerification: 2,
        neverExecuted: 0,
        failedWithoutEvidence: 0,
        missingTrace: 0,
        openDefects: 0,
        failedGates: 0,
        openRisks: 1,
      }),
    companionFacts: async (input: {
      tenantId: string;
      applicationId: string;
      granted: readonly string[];
    }) => {
      const { hasSourceRead } = await import("@apzhub/qep-ai");
      return {
        readiness: {
          posture: "at_risk",
          facts: { openCriticalDefects: 0 },
          risks: [],
          evaluations: [],
        },
        analysis: composeDeterministicAnalysis({
          tenantId: input.tenantId,
          applicationId: input.applicationId,
          acWithoutVerification: 2,
          neverExecuted: 0,
          failedWithoutEvidence: 0,
          missingTrace: 0,
          openDefects: 0,
          failedGates: 0,
          openRisks: 1,
        }),
        context: {
          tenantId: input.tenantId,
          applicationId: input.applicationId,
          sourceAccess: hasSourceRead(input.granted) ? "authorised" : "not_authorised",
          sourceAuthorised: false,
          evidenceMode: "metadata",
          records: [],
          evidence: [],
          denied: hasSourceRead(input.granted) ? [] : ["source.read"],
        },
      };
    },
  };
});

vi.mock("@/lib/qep/ai-destination-writer", () => ({
  createPhase7DestinationWriter: () => ({
    async write() {
      return { recordId: "tc_live", recordKind: "test_case" };
    },
  }),
  createPhase7TargetReader: () => ({
    async fingerprint() {
      return { targetId: "tc-1", updatedAt: "t1" };
    },
  }),
}));

import {
  handleAiAcceptProposal,
  handleAiCreateProposal,
  handleAiListProposals,
  handleAiSourceProbe,
} from "./qep-ai";

function makeRequest(url: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (!headers.has("content-type") && init?.body) {
    headers.set("content-type", "application/json");
  }
  return new NextRequest(new URL(url, "http://localhost"), {
    ...init,
    headers,
  } as ConstructorParameters<typeof NextRequest>[1]);
}

function makeContext(
  permissions: readonly string[],
  tenantId = "tenant_a",
): PlatformApiRequestContext {
  return {
    tracing: {
      requestId: "req-p7",
      correlationId: "corr-p7",
      timestamp: "2026-08-20T10:00:00.000Z",
    },
    session: buildMockSession() as unknown as PlatformApiRequestContext["session"],
    serviceContext: buildTestServiceContext({
      tenantId,
      permissions: [...permissions],
    }),
  };
}

describe("APZQEP Phase 7 AI handlers", () => {
  let applicationId = "";

  beforeEach(async () => {
    process.env.APZQEP_CORE_QE_PERSISTENCE_MODE = "memory";
    const app = await apps.service.create({
      tenantId: "tenant_a",
      name: "Hub",
      key: `P7${Date.now().toString(36).slice(-4).toUpperCase()}`,
      actorId: "user_1",
    });
    applicationId = app.id;
  });

  it("does not supply Source when qep.scm.read is present without source.read", async () => {
    const res = await handleAiSourceProbe(
      makeRequest("/api/v1/qep/ai/source-probe", {
        method: "POST",
        body: JSON.stringify({ applicationId, includeSource: true }),
      }),
      makeContext(["qep.ai_workspace.operate", "qep.scm.read", "qep.*"]),
    );
    const body = (await res.json()) as {
      data?: { sourceAuthorised?: boolean; sourcePresent?: boolean };
    };
    expect(body.data?.sourceAuthorised).toBe(false);
    expect(body.data?.sourcePresent).toBe(false);
  });

  it("may include Source metadata only when source.read is granted", async () => {
    const res = await handleAiSourceProbe(
      makeRequest("/api/v1/qep/ai/source-probe", {
        method: "POST",
        body: JSON.stringify({ applicationId }),
      }),
      makeContext(["qep.ai_workspace.operate", "source.read"]),
    );
    const body = (await res.json()) as {
      data?: { sourceAuthorised?: boolean; sourcePresent?: boolean };
    };
    expect(body.data?.sourceAuthorised).toBe(true);
    expect(body.data?.sourcePresent).toBe(true);
  });

  it("rejects cross-tenant proposal access", async () => {
    const created = await handleAiCreateProposal(
      makeRequest("/api/v1/qep/ai/proposals", {
        method: "POST",
        body: JSON.stringify({
          applicationId,
          proposalType: "test_case",
          content: { title: "Isolated" },
        }),
      }),
      makeContext(["qep.ai_workspace.operate"]),
    );
    const createdBody = (await created.json()) as {
      data?: { proposal?: { id: string } };
    };
    const id = createdBody.data?.proposal?.id ?? "";
    await expect(
      handleAiListProposals(
        makeRequest(`/api/v1/qep/ai/proposals?applicationId=${applicationId}`),
        makeContext(["qep.ai_workspace.read"], "tenant_b"),
      ),
    ).rejects.toThrow(PlatformApiHttpError);
    await expect(
      handleAiAcceptProposal(
        makeRequest(`/api/v1/qep/ai/proposals/${id}/accept`, { method: "POST" }),
        makeContext(
          ["qep.ai_workspace.operate", "qep.specification.create"],
          "tenant_b",
        ),
        { params: Promise.resolve({ proposalId: id }) },
      ),
    ).rejects.toThrow(PlatformApiHttpError);
  });

  it("creates a proposal without writing SoR and Accepts only with destination AuthZ", async () => {
    const created = await handleAiCreateProposal(
      makeRequest("/api/v1/qep/ai/proposals", {
        method: "POST",
        body: JSON.stringify({
          applicationId,
          proposalType: "test_case",
          content: { title: "Cover login" },
        }),
      }),
      makeContext(["qep.ai_workspace.operate"]),
    );
    expect(created.status).toBe(201);
    const createdBody = (await created.json()) as {
      data?: { proposal?: { id: string } };
    };
    const id = createdBody.data?.proposal?.id ?? "";

    await expect(
      handleAiAcceptProposal(
        makeRequest(`/api/v1/qep/ai/proposals/${id}/accept`, { method: "POST" }),
        makeContext(["qep.ai_workspace.operate"]),
        { params: Promise.resolve({ proposalId: id }) },
      ),
    ).rejects.toMatchObject({ status: 403 });

    const accepted = await handleAiAcceptProposal(
      makeRequest(`/api/v1/qep/ai/proposals/${id}/accept`, { method: "POST" }),
      makeContext(["qep.ai_workspace.operate", "qep.specification.create"]),
      { params: Promise.resolve({ proposalId: id }) },
    );
    const acceptedBody = (await accepted.json()) as {
      data?: { proposal?: { status?: string; resultingRecordId?: string } };
    };
    expect(acceptedBody.data?.proposal?.status).toBe("accepted");
    expect(acceptedBody.data?.proposal?.resultingRecordId).toBe("tc_live");
  });
});
