import { describe, expect, it } from "vitest";

import {
  QEP_REQUIREMENTS_NAVIGATION,
  QEP_REQUIREMENTS_PERMISSIONS,
  QEP_REQUIREMENTS_PERMISSION_LABELS,
  QEP_REQUIREMENTS_ROUTES,
  isQepBaselinesCompareRoute,
  isQepBaselinesNewRoute,
  isQepBaselinesRoute,
  isQepRelationshipsNewRoute,
  isQepRelationshipsRoute,
  isQepRelationshipsSupersedeRoute,
  isQepRequirementsEditRoute,
  isQepRequirementsNewRoute,
  isQepRequirementsRoute,
  isQepWorkspaceRoute,
  parseQepBaselineRouteId,
  parseQepRelationshipRouteId,
  parseQepRequirementRouteId,
} from "./index";

describe("QEP Requirements presentation registration", () => {
  it("registers lifecycle-aware permission catalogue", () => {
    expect(QEP_REQUIREMENTS_PERMISSIONS).toHaveLength(32);
    expect(QEP_REQUIREMENTS_PERMISSION_LABELS["qep.requirements.view"]).toBe(
      "View Requirements",
    );
    expect(
      QEP_REQUIREMENTS_PERMISSION_LABELS["qep.requirements.relationships.view"],
    ).toBe("View Requirement Relationships");
    expect(QEP_REQUIREMENTS_PERMISSION_LABELS["qep.requirements.approve"]).toBe(
      "Approve Requirements",
    );
  });

  it("registers navigation and route helpers", () => {
    expect(QEP_REQUIREMENTS_NAVIGATION.sidebar.href).toBe(
      "/workspace/qep/requirements",
    );
    expect(QEP_REQUIREMENTS_ROUTES.new).toBe("/workspace/qep/requirements/new");
    expect(QEP_REQUIREMENTS_ROUTES.detail("req_1")).toBe(
      "/workspace/qep/requirements/req_1",
    );
    expect(QEP_REQUIREMENTS_ROUTES.edit("req_1")).toBe(
      "/workspace/qep/requirements/req_1/edit",
    );
    expect(isQepRequirementsRoute("/workspace/qep/requirements")).toBe(true);
    expect(isQepRequirementsNewRoute("/workspace/qep/requirements/new")).toBe(true);
    expect(isQepRequirementsEditRoute("/workspace/qep/requirements/req_1/edit")).toBe(
      true,
    );
    expect(parseQepRequirementRouteId("/workspace/qep/requirements/req_abc")).toBe(
      "req_abc",
    );
    expect(isQepWorkspaceRoute("/workspace/qep")).toBe(true);
    expect(isQepRequirementsRoute("/workspace/testing/requirements")).toBe(false);
  });

  it("registers requirement baseline routes distinct from requirement ids", () => {
    expect(QEP_REQUIREMENTS_ROUTES.baselines.list).toBe(
      "/workspace/qep/requirements/baselines",
    );
    expect(QEP_REQUIREMENTS_ROUTES.baselines.new).toBe(
      "/workspace/qep/requirements/baselines/new",
    );
    expect(QEP_REQUIREMENTS_ROUTES.baselines.compare).toBe(
      "/workspace/qep/requirements/baselines/compare",
    );
    expect(QEP_REQUIREMENTS_ROUTES.baselines.detail("rbl_1")).toBe(
      "/workspace/qep/requirements/baselines/rbl_1",
    );

    expect(isQepBaselinesRoute("/workspace/qep/requirements/baselines")).toBe(true);
    expect(isQepRelationshipsRoute("/workspace/qep/requirements/relationships")).toBe(
      true,
    );
    expect(
      isQepRelationshipsRoute("/workspace/qep/requirements/relationships/rrl_1"),
    ).toBe(true);
    expect(isQepBaselinesNewRoute("/workspace/qep/requirements/baselines/new")).toBe(
      true,
    );
    expect(
      isQepBaselinesCompareRoute("/workspace/qep/requirements/baselines/compare"),
    ).toBe(true);
    expect(parseQepBaselineRouteId("/workspace/qep/requirements/baselines/rbl_1")).toBe(
      "rbl_1",
    );
    expect(
      parseQepBaselineRouteId("/workspace/qep/requirements/baselines/new"),
    ).toBeNull();
    expect(
      parseQepBaselineRouteId("/workspace/qep/requirements/baselines/compare"),
    ).toBeNull();

    // Critical: "baselines" itself must never be parsed as a requirement id.
    expect(
      parseQepRequirementRouteId("/workspace/qep/requirements/baselines"),
    ).toBeNull();
    expect(
      parseQepRequirementRouteId("/workspace/qep/requirements/baselines/rbl_1"),
    ).toBeNull();
    expect(
      parseQepRequirementRouteId("/workspace/qep/requirements/relationships"),
    ).toBeNull();
    expect(
      parseQepRequirementRouteId("/workspace/qep/requirements/relationships/rrl_1"),
    ).toBeNull();
    expect(parseQepRequirementRouteId("/workspace/qep/requirements/req_1")).toBe(
      "req_1",
    );
  });

  it("registers requirement relationship routes distinct from requirement ids", () => {
    expect(QEP_REQUIREMENTS_ROUTES.relationships.list).toBe(
      "/workspace/qep/requirements/relationships",
    );
    expect(QEP_REQUIREMENTS_ROUTES.relationships.new).toBe(
      "/workspace/qep/requirements/relationships/new",
    );
    expect(QEP_REQUIREMENTS_ROUTES.relationships.detail("rrl_1")).toBe(
      "/workspace/qep/requirements/relationships/rrl_1",
    );
    expect(QEP_REQUIREMENTS_ROUTES.relationships.forRequirement("req_1")).toBe(
      "/workspace/qep/requirements/req_1/relationships",
    );

    expect(
      isQepRelationshipsNewRoute("/workspace/qep/requirements/relationships/new"),
    ).toBe(true);
    expect(
      isQepRelationshipsSupersedeRoute(
        "/workspace/qep/requirements/relationships/supersede",
      ),
    ).toBe(true);
    expect(QEP_REQUIREMENTS_ROUTES.relationships.supersede).toBe(
      "/workspace/qep/requirements/relationships/supersede",
    );
    expect(
      parseQepRelationshipRouteId("/workspace/qep/requirements/relationships/rrl_1"),
    ).toBe("rrl_1");
    expect(
      parseQepRelationshipRouteId("/workspace/qep/requirements/relationships/new"),
    ).toBeNull();
    expect(
      parseQepRelationshipRouteId("/workspace/qep/requirements/relationships"),
    ).toBeNull();
  });

  it("registers a baselines sidebar entry nested under requirements", () => {
    expect(QEP_REQUIREMENTS_NAVIGATION.baselinesSidebar.href).toBe(
      "/workspace/qep/requirements/baselines",
    );
    expect(QEP_REQUIREMENTS_NAVIGATION.baselinesSidebar.parent).toBe(
      "qep-requirements",
    );
    expect(QEP_REQUIREMENTS_NAVIGATION.baselinesSidebar.permission).toBe(
      "qep.requirements.baselines.view",
    );
  });

  it("registers a relationships sidebar entry nested under requirements", () => {
    expect(QEP_REQUIREMENTS_NAVIGATION.relationshipsSidebar.href).toBe(
      "/workspace/qep/requirements/relationships",
    );
    expect(QEP_REQUIREMENTS_NAVIGATION.relationshipsSidebar.parent).toBe(
      "qep-requirements",
    );
    expect(QEP_REQUIREMENTS_NAVIGATION.relationshipsSidebar.permission).toBe(
      "qep.requirements.relationships.view",
    );
    expect(QEP_REQUIREMENTS_NAVIGATION.relationshipsSidebar.order).toBe(32);
  });
});
