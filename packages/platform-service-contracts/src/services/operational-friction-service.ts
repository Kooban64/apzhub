/**
 * Operational Friction Register — APZHUB-PRODUCT-BOARD-001.
 * Product Board intake for Product Era investments. Platform metadata only.
 */

export const FRICTION_BOARD_DECISIONS = [
  "accepted",
  "deferred",
  "rejected",
  "needs_more_evidence",
] as const;
export type FrictionBoardDecision = (typeof FRICTION_BOARD_DECISIONS)[number];

export const FRICTION_ENGINEERING_STATUSES = [
  "no_engineering",
  "apzqep_candidate",
  "approved",
  "delivered",
] as const;
export type FrictionEngineeringStatus = (typeof FRICTION_ENGINEERING_STATUSES)[number];

export const FRICTION_SOURCES = [
  "manual",
  "context_learning",
  "product_learning",
  "support",
] as const;
export type FrictionSource = (typeof FRICTION_SOURCES)[number];

export interface OperationalFriction {
  readonly id: string;
  readonly tenantId: string;
  readonly title: string;
  readonly reportedAt: string;
  readonly reporter: string;
  readonly productsAffected: readonly string[];
  readonly userRole: string;
  /** Q1 */
  readonly frustration: string;
  /** Q2 */
  readonly whoExperiences: string;
  /** Q3 */
  readonly evidence: string;
  /** Q4 */
  readonly nonEngineeringOptions: string;
  /** Q5 */
  readonly smallestCapability: string;
  readonly boardDecision: FrictionBoardDecision;
  readonly engineeringStatus: FrictionEngineeringStatus;
  readonly source: FrictionSource;
  readonly outcomeFaster: boolean | null;
  readonly outcomeClearer: boolean | null;
  readonly outcomeSafer: boolean | null;
  readonly outcomeBetterDecision: boolean | null;
  readonly outcomeNotes: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdByUserId?: string;
  readonly updatedByUserId?: string;
}

export interface CreateOperationalFrictionInput {
  readonly title: string;
  readonly reportedAt?: string;
  readonly reporter: string;
  readonly productsAffected: readonly string[];
  readonly userRole: string;
  readonly frustration: string;
  readonly whoExperiences: string;
  readonly evidence: string;
  readonly nonEngineeringOptions: string;
  readonly smallestCapability: string;
  readonly boardDecision?: FrictionBoardDecision;
  readonly engineeringStatus?: FrictionEngineeringStatus;
  readonly source?: FrictionSource;
}

export interface UpdateOperationalFrictionInput {
  readonly title?: string;
  readonly reporter?: string;
  readonly productsAffected?: readonly string[];
  readonly userRole?: string;
  readonly frustration?: string;
  readonly whoExperiences?: string;
  readonly evidence?: string;
  readonly nonEngineeringOptions?: string;
  readonly smallestCapability?: string;
  readonly boardDecision?: FrictionBoardDecision;
  readonly engineeringStatus?: FrictionEngineeringStatus;
  readonly outcomeFaster?: boolean | null;
  readonly outcomeClearer?: boolean | null;
  readonly outcomeSafer?: boolean | null;
  readonly outcomeBetterDecision?: boolean | null;
  readonly outcomeNotes?: string | null;
}

export interface OperationalFrictionAuditEntry {
  readonly id: string;
  readonly frictionId: string;
  readonly tenantId: string;
  readonly actorUserId: string;
  readonly action: string;
  readonly detail: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
}
