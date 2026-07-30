/**
 * Factory identity scaffolds — no behaviour (APZQEP-ENG-110A).
 */
export type EvidenceFactoryId = "EvidenceFactory" | "EvidenceSetFactory";

export interface EvidenceFactoryScaffold {
  readonly factoryId: EvidenceFactoryId;
}

export const EVIDENCE_FACTORY_IDS = ["EvidenceFactory", "EvidenceSetFactory"] as const;
