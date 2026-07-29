/**
 * APZQEP-REM-001 — L-02 EvidenceAccessPort security tests.
 * Proves default-allow behaviour no longer exists.
 */
import { describe, expect, it } from "vitest";

import type { ExecutionRequestContext } from "../../application/context";
import { ExecutionForbiddenError, ExecutionValidationError } from "../../shared/errors";
import {
  createBaselineEvidenceAccessCheck,
  createEvidenceAccessPort,
  validateEvidenceAccessRequest,
} from "./evidence-access-port";

const ctx = (
  overrides: Partial<ExecutionRequestContext> = {},
): ExecutionRequestContext => ({
  tenantId: "tenant_a",
  userId: "user_1",
  correlationId: "corr_sec_1",
  ...overrides,
});

const VALID_URI = "https://evidence.example/run/1.log";

describe("APZQEP-REM-001 EvidenceAccessPort fail-closed", () => {
  it("explicit allow grants access", async () => {
    const port = createEvidenceAccessPort(async () => true);
    const decision = await port.evaluateAccess(ctx(), VALID_URI, "associate");
    expect(decision.outcome).toBe("allowed");
    await expect(
      port.assertAccessible(ctx(), VALID_URI, "associate"),
    ).resolves.toBeUndefined();
  });

  it("explicit deny blocks access", async () => {
    const port = createEvidenceAccessPort(async () => false);
    const decision = await port.evaluateAccess(ctx(), VALID_URI, "associate");
    expect(decision.outcome).toBe("denied");
    await expect(
      port.assertAccessible(ctx(), VALID_URI, "associate"),
    ).rejects.toBeInstanceOf(ExecutionForbiddenError);
  });

  it("missing permission check (unconfigured) blocks access — no default-allow", async () => {
    const port = createEvidenceAccessPort();
    const decision = await port.evaluateAccess(ctx(), VALID_URI, "associate");
    expect(decision.outcome).toBe("denied");
    expect(decision.reason).toBe("evidence_access_check_not_configured");
    await expect(port.assertAccessible(ctx(), VALID_URI)).rejects.toBeInstanceOf(
      ExecutionForbiddenError,
    );
  });

  it("undefined check result blocks access", async () => {
    const port = createEvidenceAccessPort(async () => undefined as unknown as boolean);
    const decision = await port.evaluateAccess(ctx(), VALID_URI, "associate");
    expect(decision.outcome).toBe("indeterminate");
    await expect(port.assertAccessible(ctx(), VALID_URI)).rejects.toBeInstanceOf(
      ExecutionForbiddenError,
    );
  });

  it("null check result blocks access", async () => {
    const port = createEvidenceAccessPort(async () => null as unknown as boolean);
    const decision = await port.evaluateAccess(ctx(), VALID_URI, "associate");
    expect(decision.outcome).toBe("indeterminate");
    await expect(port.assertAccessible(ctx(), VALID_URI)).rejects.toBeInstanceOf(
      ExecutionForbiddenError,
    );
  });

  it("adapter error blocks access as unavailable", async () => {
    const port = createEvidenceAccessPort(async () => {
      throw new Error("acl_backend_down");
    });
    const decision = await port.evaluateAccess(ctx(), VALID_URI, "associate");
    expect(decision.outcome).toBe("unavailable");
    expect(decision.reason).toContain("acl_backend_down");
    await expect(port.assertAccessible(ctx(), VALID_URI)).rejects.toBeInstanceOf(
      ExecutionForbiddenError,
    );
  });

  it("indeterminate decision outcome blocks access", async () => {
    const port = createEvidenceAccessPort(async () => ({
      outcome: "indeterminate" as const,
      reason: "policy_incomplete",
    }));
    await expect(port.assertAccessible(ctx(), VALID_URI)).rejects.toBeInstanceOf(
      ExecutionForbiddenError,
    );
  });

  it("unknown / unsupported URI scheme blocks access", async () => {
    const port = createEvidenceAccessPort(createBaselineEvidenceAccessCheck());
    const decision = await port.evaluateAccess(
      ctx(),
      "file:///etc/passwd",
      "associate",
    );
    expect(decision.outcome).toBe("denied");
    expect(decision.reason).toContain("unsupported_evidence_uri_scheme");
  });

  it("malformed URI is invalid_request", async () => {
    const port = createEvidenceAccessPort(createBaselineEvidenceAccessCheck());
    const decision = await port.evaluateAccess(ctx(), "not a uri", "associate");
    expect(decision.outcome).toBe("invalid_request");
    await expect(port.assertAccessible(ctx(), "not a uri")).rejects.toBeInstanceOf(
      ExecutionValidationError,
    );
  });

  it("unauthenticated (missing user) blocks access", async () => {
    const port = createEvidenceAccessPort(createBaselineEvidenceAccessCheck());
    const decision = await port.evaluateAccess(
      ctx({ userId: "" }),
      VALID_URI,
      "associate",
    );
    expect(decision.outcome).toBe("denied");
    expect(decision.reason).toBe("missing_authenticated_actor_or_tenant");
  });

  it("missing tenant blocks access", async () => {
    const port = createEvidenceAccessPort(createBaselineEvidenceAccessCheck());
    const decision = await port.evaluateAccess(
      ctx({ tenantId: "   " }),
      VALID_URI,
      "associate",
    );
    expect(decision.outcome).toBe("denied");
  });

  it("baseline affirmative policy grants access for valid actor+uri", async () => {
    const port = createEvidenceAccessPort(createBaselineEvidenceAccessCheck());
    const decision = await port.evaluateAccess(ctx(), VALID_URI, "associate");
    expect(decision.outcome).toBe("allowed");
    expect(decision.reason).toBe("baseline_uri_and_actor_policy");
  });

  it("validateEvidenceAccessRequest does not grant access by itself when check missing", () => {
    expect(validateEvidenceAccessRequest(ctx(), VALID_URI)).toBeUndefined();
    // Port without check still denies even when baseline validation passes.
  });

  it("explicit decision allow from check grants access", async () => {
    const port = createEvidenceAccessPort(async () => ({
      outcome: "allowed" as const,
      reason: "external_acl_grant",
    }));
    await expect(
      port.assertAccessible(ctx(), VALID_URI, "view_metadata"),
    ).resolves.toBeUndefined();
  });

  it("download action is evaluated and denied when check refuses", async () => {
    const port = createEvidenceAccessPort(async (_c, _u, action) => {
      if (action === "download") return false;
      return true;
    });
    await expect(
      port.assertAccessible(ctx(), VALID_URI, "download"),
    ).rejects.toBeInstanceOf(ExecutionForbiddenError);
    await expect(
      port.assertAccessible(ctx(), VALID_URI, "list"),
    ).resolves.toBeUndefined();
  });
});
