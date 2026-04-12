import { describe, expect, it } from "vitest";

import { launchDecisionResultSchema } from "@/lib/launch/launch-decision";
import { launchMethodSchema } from "@/lib/launch/launch-method";
import { launchReadinessSchema, LAUNCH_READINESS_LABELS, LAUNCH_READINESS_PILL_TONE } from "@/lib/launch/launch-readiness";
import {
  LAUNCH_REASON_USER_MESSAGES,
  launchReasonCodeSchema,
} from "@/lib/launch/launch-reason-code";
import { launchTargetSchema } from "@/lib/launch/launch-target";

describe("launch contracts", () => {
  it("parses method and readiness enums", () => {
    for (const m of launchMethodSchema.options) {
      expect(launchMethodSchema.parse(m)).toBe(m);
    }
    for (const r of launchReadinessSchema.options) {
      expect(launchReadinessSchema.parse(r)).toBe(r);
      expect(LAUNCH_READINESS_LABELS[r].length).toBeGreaterThan(0);
      expect(LAUNCH_READINESS_PILL_TONE[r].length).toBeGreaterThan(0);
    }
  });

  it("parses launch decision result sample", () => {
    const sample = launchDecisionResultSchema.parse({
      serviceId: "mail",
      method: "oidc",
      readiness: "ready",
      allowed: true,
      userMessage: "Ready to launch.",
      target: { kind: "oidc_redirect", href: "/workspace/launch/mock-oidc?service=mail" },
      emitAuditEvent: true,
    });
    expect(sample.allowed).toBe(true);
  });

  it("every launch reason code has a default user message", () => {
    for (const c of launchReasonCodeSchema.options) {
      expect(LAUNCH_REASON_USER_MESSAGES[c].length).toBeGreaterThan(0);
      expect(launchReasonCodeSchema.parse(c)).toBe(c);
    }
  });

  it("parses each launch target variant", () => {
    expect(
      launchTargetSchema.parse({ kind: "jwt_internal", appRoute: "/workspace/launch/mock-jwt?service=calendar" }),
    ).toMatchObject({ kind: "jwt_internal" });
    expect(
      launchTargetSchema.parse({
        kind: "vault_delegated",
        delegationRequestId: "mock-delegation-reminders",
      }),
    ).toMatchObject({ kind: "vault_delegated" });
    expect(
      launchTargetSchema.parse({ kind: "external_redirect", href: "/workspace/launch/mock-external?service=drive" }),
    ).toMatchObject({ kind: "external_redirect" });
  });
});
