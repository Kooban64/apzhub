import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { clearIdentityQueries, identityQueryKeys } from "./query-keys";

describe("identity query keys", () => {
  it("has a stable root", () => {
    expect(identityQueryKeys.all).toEqual(["identity"]);
  });

  it("builds activation and deactivation list keys", () => {
    expect(identityQueryKeys.activation.list({ limit: 5 })).toEqual([
      "identity",
      "activation",
      "list",
      expect.any(String),
    ]);
    expect(identityQueryKeys.deactivation.list({ limit: 5 })).toEqual([
      "identity",
      "deactivation",
      "list",
      expect.any(String),
    ]);
  });

  it("clears identity queries from a QueryClient", () => {
    const client = new QueryClient();
    client.setQueryData(identityQueryKeys.all, { ok: true });
    clearIdentityQueries(client);
    expect(client.getQueryData(identityQueryKeys.all)).toBeUndefined();
  });

  it("builds stable list keys regardless of param order", () => {
    const a = identityQueryKeys.users.list({ limit: 10, sort: "name" });
    const b = identityQueryKeys.users.list({ sort: "name", limit: 10 });
    expect(a).toEqual(b);
  });

  it("builds detail keys per facet", () => {
    expect(identityQueryKeys.users.detail("usr_1")).toEqual([
      "identity",
      "users",
      "detail",
      "usr_1",
    ]);
    expect(identityQueryKeys.user("usr_1")).toEqual(
      identityQueryKeys.users.detail("usr_1"),
    );
    expect(identityQueryKeys.groups.detail("grp_1")).toEqual([
      "identity",
      "groups",
      "detail",
      "grp_1",
    ]);
    expect(identityQueryKeys.roles.detail("role_1")).toEqual([
      "identity",
      "roles",
      "detail",
      "role_1",
    ]);
    expect(identityQueryKeys.organisations.detail("org_1")).toEqual([
      "identity",
      "organisations",
      "detail",
      "org_1",
    ]);
    expect(identityQueryKeys.tenants.detail("tenant_1")).toEqual([
      "identity",
      "tenants",
      "detail",
      "tenant_1",
    ]);
    expect(identityQueryKeys.departments.detail("dept_1")).toEqual([
      "identity",
      "departments",
      "detail",
      "dept_1",
    ]);
    expect(identityQueryKeys.positions.detail("pos_1")).toEqual([
      "identity",
      "positions",
      "detail",
      "pos_1",
    ]);
    expect(identityQueryKeys.memberships.detail("mem_1")).toEqual([
      "identity",
      "memberships",
      "detail",
      "mem_1",
    ]);
    expect(identityQueryKeys.serviceAssignments.detail("svcasg_1")).toEqual([
      "identity",
      "service-assignments",
      "detail",
      "svcasg_1",
    ]);
    expect(identityQueryKeys.invitations.detail("inv_1")).toEqual([
      "identity",
      "invitations",
      "detail",
      "inv_1",
    ]);
    expect(identityQueryKeys.activation.detail("act_1")).toEqual([
      "identity",
      "activation",
      "detail",
      "act_1",
    ]);
    expect(identityQueryKeys.deactivation.detail("deact_1")).toEqual([
      "identity",
      "deactivation",
      "detail",
      "deact_1",
    ]);
    expect(identityQueryKeys.policies.detail("pol_1")).toEqual([
      "identity",
      "policies",
      "detail",
      "pol_1",
    ]);
    expect(identityQueryKeys.audit.detail("aud_1")).toEqual([
      "identity",
      "audit",
      "detail",
      "aud_1",
    ]);
    expect(identityQueryKeys.history.detail("hist_1")).toEqual([
      "identity",
      "history",
      "detail",
      "hist_1",
    ]);
    expect(identityQueryKeys.references.detail("ref_1")).toEqual([
      "identity",
      "references",
      "detail",
      "ref_1",
    ]);
  });

  it("builds diagnostics keys", () => {
    expect(identityQueryKeys.diagnostics.health()).toEqual([
      "identity",
      "diagnostics",
      "health",
    ]);
    expect(identityQueryKeys.diagnostics.readiness()).toEqual([
      "identity",
      "diagnostics",
      "readiness",
    ]);
    expect(identityQueryKeys.diagnostics.capabilities()).toEqual([
      "identity",
      "diagnostics",
      "capabilities",
    ]);
    expect(identityQueryKeys.diagnostics.managementCapabilities()).toEqual([
      "identity",
      "diagnostics",
      "management-capabilities",
    ]);
  });

  it("includes userId in history/references list keys", () => {
    const withUser = identityQueryKeys.history.list({ userId: "usr_1" });
    const withoutUser = identityQueryKeys.history.list();
    expect(withUser).not.toEqual(withoutUser);
  });
});
