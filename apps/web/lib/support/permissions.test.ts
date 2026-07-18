import { describe, expect, it } from "vitest";

import {
  canArchiveOrganization,
  canAssignSupportRequest,
  canCreateGroup,
  canCreateOrganization,
  canCreateSupportArticle,
  canCreateSupportRequest,
  canExecuteSupportSearch,
  canListGroups,
  canListOrganizations,
  canListSupportArticles,
  canListSupportRequests,
  canListSupportUsers,
  canReadSupportAnalytics,
  canReadSupportArticles,
  canTransitionSupportRequest,
  canUpdateGroup,
  canUpdateOrganization,
  canUpdateSupportRequest,
  hasSupportPermission,
} from "./permissions";

describe("support permissions helpers", () => {
  it("treats empty source as denied for UI gating", () => {
    expect(canListSupportRequests(undefined)).toBe(false);
    expect(canCreateSupportRequest(null)).toBe(false);
    expect(canTransitionSupportRequest([])).toBe(false);
    expect(canUpdateSupportRequest(undefined)).toBe(false);
    expect(canAssignSupportRequest(null)).toBe(false);
    expect(canCreateOrganization([])).toBe(false);
    expect(canUpdateOrganization(undefined)).toBe(false);
    expect(canArchiveOrganization(null)).toBe(false);
    expect(canCreateGroup([])).toBe(false);
    expect(canUpdateGroup(undefined)).toBe(false);
    expect(canListSupportUsers(null)).toBe(false);
    expect(canExecuteSupportSearch([])).toBe(false);
    expect(canListOrganizations(undefined)).toBe(false);
    expect(canListGroups(null)).toBe(false);
    expect(canListSupportArticles([])).toBe(false);
    expect(canReadSupportArticles(undefined)).toBe(false);
  });

  it("honours wildcard and catalogue permissions", () => {
    expect(hasSupportPermission(["*"], "support.requests.list")).toBe(true);
    expect(hasSupportPermission(["support.*"], "support.articles.create")).toBe(true);
    expect(
      hasSupportPermission(["support.requests.create"], "support.requests.create"),
    ).toBe(true);
    expect(
      hasSupportPermission(["support.requests.*"], "support.requests.update"),
    ).toBe(true);
    expect(canAssignSupportRequest(["support.requests.assign"])).toBe(true);
    expect(canCreateSupportArticle(["support.articles.create"])).toBe(true);
    expect(canReadSupportAnalytics(["support.analytics.read"])).toBe(true);
    expect(canCreateOrganization(["support.organizations.create"])).toBe(true);
    expect(canUpdateOrganization(["support.organizations.update"])).toBe(true);
    expect(canArchiveOrganization(["support.organizations.archive"])).toBe(true);
    expect(canCreateGroup(["support.groups.create"])).toBe(true);
    expect(canUpdateGroup(["support.groups.update"])).toBe(true);
    expect(canListSupportUsers(["support.users.list"])).toBe(true);
    expect(canExecuteSupportSearch(["support.search.execute"])).toBe(true);
    expect(canListOrganizations(["support.organizations.list"])).toBe(true);
    expect(canListGroups(["support.groups.list"])).toBe(true);
    expect(canListSupportArticles(["support.articles.list"])).toBe(true);
    expect(canReadSupportArticles(["support.articles.read"])).toBe(true);
    expect(canUpdateSupportRequest(new Set(["support.requests.update"]))).toBe(true);
  });

  it("does not treat unrelated roles as authority", () => {
    expect(hasSupportPermission(["platform_admin"], "support.requests.list")).toBe(
      false,
    );
    expect(hasSupportPermission(["agent"], "support.requests.transition")).toBe(false);
  });
});
