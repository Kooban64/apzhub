import { describe, expect, it } from "vitest";

import type { RequirementApplicationService } from "../src/application";
import type {
  RequirementApprovalService,
  RequirementRelationshipService,
  RequirementRepository,
  RequirementService,
  RequirementValidationService,
  RequirementVersionRepository,
  RequirementRelationshipRepository,
  RequirementVersionService,
  RequirementAuditRepository,
  RequirementLifecycleHistoryRepository,
} from "../src/domain";
import {
  REQUIREMENT_DOMAIN_EVENT_TYPES,
  QEP_REQUIREMENTS_PERMISSIONS,
} from "../src/index";

/**
 * Contract integrity — interfaces and catalogues exist with ENG-020C lifecycle ports.
 */
describe("APZQEP-ENG-020C contract integrity", () => {
  it("exposes domain service and repository interface names as type contracts", () => {
    type DomainContracts = [
      RequirementService,
      RequirementValidationService,
      RequirementRelationshipService,
      RequirementVersionService,
      RequirementApprovalService,
      RequirementRepository,
      RequirementVersionRepository,
      RequirementRelationshipRepository,
      RequirementAuditRepository,
      RequirementLifecycleHistoryRepository,
      RequirementApplicationService,
    ];
    const contractCount: DomainContracts["length"] = 11;
    expect(contractCount).toBe(11);
  });

  it("defines the required domain event catalogue", () => {
    expect(REQUIREMENT_DOMAIN_EVENT_TYPES).toEqual([
      "qep.requirement.created",
      "qep.requirement.updated",
      "qep.requirement.archived",
      "qep.requirement.approved",
      "qep.requirement.rejected",
      "qep.requirement.state_changed",
      "qep.requirement.submitted",
      "qep.requirement.implemented",
      "qep.requirement.verified",
      "qep.requirement.deprecated",
      "qep.requirement.version_created",
      "qep.requirement.content_version_created",
      "qep.requirement.baseline_created",
    ]);
  });

  it("defines the required permission catalogue", () => {
    expect([...QEP_REQUIREMENTS_PERMISSIONS]).toEqual([
      "qep.requirements.view",
      "qep.requirements.create",
      "qep.requirements.edit",
      "qep.requirements.delete",
      "qep.requirements.submit",
      "qep.requirements.review",
      "qep.requirements.approve",
      "qep.requirements.reject",
      "qep.requirements.implement",
      "qep.requirements.verify",
      "qep.requirements.deprecate",
      "qep.requirements.archive",
      "qep.requirements.baseline",
      "qep.requirements.export",
      "qep.requirements.import",
      "qep.requirements.versions.history",
      "qep.requirements.versions.view",
      "qep.requirements.versions.compare",
      "qep.requirements.versions.verify",
      "qep.requirements.baselines.view",
      "qep.requirements.baselines.create",
      "qep.requirements.baselines.modify",
      "qep.requirements.baselines.lock",
      "qep.requirements.baselines.archive",
      "qep.requirements.baselines.compare",
      "qep.requirements.baselines.verify",
      "qep.requirements.relationships.view",
      "qep.requirements.relationships.create",
      "qep.requirements.relationships.modify",
      "qep.requirements.relationships.transition",
      "qep.requirements.relationships.retire",
      "qep.requirements.relationships.taxonomy.administer",
    ]);
  });
});
