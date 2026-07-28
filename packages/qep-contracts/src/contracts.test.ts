import { describe, expect, it } from "vitest";
import {
  QEP_CONTRACTS_VERSION,
  QEP_REQUIREMENTS_PERMISSIONS,
  createContractStub,
  type QepRequirementService,
  type QepRequirementsGateway,
} from "./index";

describe("@apzhub/qep-contracts", () => {
  it("exports contract version 0.2.0", () => {
    expect(QEP_CONTRACTS_VERSION).toBe("0.2.0");
  });

  it("exports legacy contract stub marker", () => {
    const stub = createContractStub("M03");
    expect(stub.implemented).toBe(false);
    expect(stub.moduleId).toBe("M03");
    expect(stub.contractVersion).toBe("0.2.0");
  });

  it("defines requirements permissions matching presentation catalogue", () => {
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

  it("exposes QepRequirementService and gateway as type contracts", () => {
    type Contracts = [QepRequirementService, QepRequirementsGateway];
    const count: Contracts["length"] = 2;
    expect(count).toBe(2);
  });
});
