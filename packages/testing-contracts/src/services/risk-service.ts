import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { Risk } from "../domain";
import type {
  BusinessCriticality,
  Impact,
  Likelihood,
  RegressionImportance,
  Severity,
} from "../enums";
import type { RequirementId, RiskId } from "../identifiers";

/** Risk domain service — severity/likelihood/impact/criticality/regression importance. */
export interface RiskService {
  list(ctx: ServiceRequestContext): Promise<readonly Risk[]>;
  get(ctx: ServiceRequestContext, id: RiskId): Promise<Risk>;
  create(
    ctx: ServiceRequestContext,
    input: Omit<Risk, "id" | "createdAt" | "updatedAt">,
  ): Promise<Risk>;
  update(
    ctx: ServiceRequestContext,
    id: RiskId,
    input: Partial<Omit<Risk, "id" | "tenantId" | "createdAt">>,
  ): Promise<Risk>;
  archive(ctx: ServiceRequestContext, id: RiskId): Promise<Risk>;
  setSeverity(
    ctx: ServiceRequestContext,
    id: RiskId,
    severity: Severity,
  ): Promise<Risk>;
  setLikelihood(
    ctx: ServiceRequestContext,
    id: RiskId,
    likelihood: Likelihood,
  ): Promise<Risk>;
  setImpact(ctx: ServiceRequestContext, id: RiskId, impact: Impact): Promise<Risk>;
  setBusinessCriticality(
    ctx: ServiceRequestContext,
    id: RiskId,
    businessCriticality: BusinessCriticality,
  ): Promise<Risk>;
  setRegressionImportance(
    ctx: ServiceRequestContext,
    id: RiskId,
    regressionImportance: RegressionImportance,
  ): Promise<Risk>;
  linkRequirement(
    ctx: ServiceRequestContext,
    id: RiskId,
    requirementId: RequirementId,
  ): Promise<Risk>;
  unlinkRequirement(
    ctx: ServiceRequestContext,
    id: RiskId,
    requirementId: RequirementId,
  ): Promise<Risk>;
}
