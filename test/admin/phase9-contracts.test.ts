import { describe, expect, it } from "vitest";

import { adminActionRequiredItemSchema, adminAlertsPanelSchema } from "@/lib/admin/contracts/alerts";
import { adminAuditEventSchema, adminAuditSnippetSchema } from "@/lib/admin/contracts/audit";
import { adminPrivilegedActionTraceSchema } from "@/lib/admin/contracts/privileged-action-trace";
import { getMockAdminHomeData, getMockPrivilegedActionTraces } from "@/lib/admin/mock-admin-home-data";
import { appThemeIdSchema, densityIdSchema } from "@/lib/theme/appearance-vocabulary";

describe("Phase 9 contracts", () => {
  it("parses audit events with domain and outcome", () => {
    const ev = getMockAdminHomeData().audit.events[0];
    expect(adminAuditEventSchema.parse(ev)).toMatchObject({ domain: "identity", outcome: "success" });
  });

  it("parses actionable alerts with optional pointers", () => {
    const a = getMockAdminHomeData().alerts[0];
    const parsed = adminActionRequiredItemSchema.parse(a);
    expect(parsed.pointerRoute).toBe("/admin/users");
    expect(adminAlertsPanelSchema.parse({ items: getMockAdminHomeData().alerts }).items.length).toBeGreaterThan(0);
  });

  it("parses privileged action traces", () => {
    const p = getMockPrivilegedActionTraces()[0];
    expect(adminPrivilegedActionTraceSchema.parse(p)).toMatchObject({ verb: "user_suspend" });
  });

  it("parses service_launch privileged trace verb", () => {
    const row = {
      id: "priv-launch-test",
      correlationId: "00000000-0000-4000-8000-000000000001",
      actor: "ops@example.com",
      verb: "service_launch" as const,
      target: "mail:jwt",
      domain: "launch" as const,
      at: new Date().toISOString(),
      outcome: "success" as const,
      contextSummary: "Internal JWT mint",
    };
    expect(adminPrivilegedActionTraceSchema.parse(row)).toMatchObject({ verb: "service_launch", domain: "launch" });
  });

  it("appearance vocabulary schemas accept only canonical theme and density ids", () => {
    expect(appThemeIdSchema.safeParse("mist-blue").success).toBe(true);
    expect(appThemeIdSchema.safeParse("invalid-theme").success).toBe(false);
    expect(densityIdSchema.safeParse("compact").success).toBe(true);
  });

  it("parses full audit snippet from mock", () => {
    expect(adminAuditSnippetSchema.parse(getMockAdminHomeData().audit)).toEqual(getMockAdminHomeData().audit);
  });
});
