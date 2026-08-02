/**
 * Read ports for Cap A–D artefacts — Traceability Engine never mutates them.
 */

export type SuiteLookup = {
  readonly suiteId: string;
  readonly tenantId: string;
  readonly name: string;
  readonly projectId?: string;
  readonly status: string;
};

export type PlanLookup = {
  readonly planId: string;
  readonly tenantId: string;
  readonly suiteId: string;
  readonly name: string;
  readonly status: string;
};

export type SessionLookup = {
  readonly sessionId: string;
  readonly tenantId: string;
  readonly planId?: string;
  readonly suiteId?: string;
  readonly name: string;
  readonly status: string;
  readonly evidenceIds: readonly string[];
  readonly stepOutcomes: readonly string[];
};

export type DefectLookup = {
  readonly defectId: string;
  readonly tenantId: string;
  readonly title: string;
  readonly status: string;
  readonly sessionId?: string;
  readonly suiteId?: string;
  readonly evidenceIds: readonly string[];
};

export type QualityArtefactPorts = {
  getSuite?(tenantId: string, suiteId: string): Promise<SuiteLookup | undefined>;
  listPlansBySuite?(tenantId: string, suiteId: string): Promise<readonly PlanLookup[]>;
  listSessionsBySuite?(
    tenantId: string,
    suiteId: string,
  ): Promise<readonly SessionLookup[]>;
  listDefectsBySuite?(
    tenantId: string,
    suiteId: string,
  ): Promise<readonly DefectLookup[]>;
};
