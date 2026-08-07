/** Operational Workspace (W002 / S-01) view models. */

export type OperationalHealthLabel = "Healthy" | "Watch" | "Critical";

export type OperationalConfidenceBand = "High" | "Medium" | "Low";

export type QueueGroupId = "decision" | "attention" | "waiting";

export type QueueItemKind =
  | "Decision"
  | "Approval"
  | "Commitment"
  | "Risk"
  | "Blocked"
  | "Waiting"
  | "Governance"
  | "Escalation"
  | "Milestone"
  | "Action";

export type QueueImpact = "High" | "Medium" | "Low";

export interface WorkspaceOverview {
  readonly asOf: string;
  readonly pressureStatement: string;
  readonly health: {
    readonly healthy: number;
    readonly watch: number;
    readonly critical: number;
  };
  readonly confidence: {
    readonly mean: number;
    readonly lowCount: number;
  };
  readonly attention: {
    readonly decision: number;
    readonly attention: number;
    readonly waiting: number;
  };
  readonly delivery: {
    readonly commitmentsDue7d: number;
    readonly milestonesDue7d: number;
  };
  readonly control: {
    readonly criticalRisks: number;
    readonly watchRisks: number;
    readonly openDecisions: number;
  };
  readonly trend?: {
    readonly slippedMilestonesDelta: number;
    readonly agedWaitsDelta: number;
    readonly confidenceDelta: number;
  };
}

export interface WorkspaceQueueItem {
  readonly id: string;
  readonly group: QueueGroupId;
  readonly kind: QueueItemKind;
  readonly impact: QueueImpact;
  readonly statement: string;
  readonly projectId: string;
  readonly projectName: string;
  readonly dueAt?: string;
  readonly ageDays?: number;
  readonly aged?: boolean;
  readonly targetPath: string;
  /** Present for Decision / Approval rows — enables inline act (W002 §6.4). */
  readonly inlineAct?: "approve_reject" | "open";
}

export interface WorkspaceQueue {
  readonly decision: readonly WorkspaceQueueItem[];
  readonly attention: readonly WorkspaceQueueItem[];
  readonly waitingOnOthers: readonly WorkspaceQueueItem[];
  readonly approvalsUnavailable: boolean;
}

export interface WorkspacePortfolioStrip {
  readonly projectId: string;
  readonly name: string;
  readonly identifier: string;
  readonly health: OperationalHealthLabel;
  readonly confidenceScore: number;
  readonly confidenceBand: OperationalConfidenceBand;
  readonly progressPercent: number;
  readonly pulse: string;
  readonly nextCommitment?: {
    readonly title: string;
    readonly dueAt?: string;
  };
  readonly pressure: {
    readonly risks: number;
    readonly decisions: number;
    readonly waiting: number;
    readonly blocked: number;
  };
  readonly waitingSummary?: string;
  readonly lastChangeAt?: string;
  readonly attentionScore: number;
  readonly ownerUserId?: string;
  readonly programmeId?: string;
}

export interface WorkspacePortfolio {
  readonly items: readonly WorkspacePortfolioStrip[];
  readonly sort: string;
}

export interface WorkspaceChangeItem {
  readonly id: string;
  readonly headline: string;
  readonly whyCare: string;
  readonly projectId?: string;
  readonly projectName?: string;
  readonly at: string;
  readonly targetPath?: string;
}

export interface WorkspaceChanges {
  readonly items: readonly WorkspaceChangeItem[];
}
