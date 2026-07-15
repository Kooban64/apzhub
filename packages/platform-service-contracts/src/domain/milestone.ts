import type { MilestoneId, ProjectId } from "./identifiers";

export interface Milestone {
  readonly id: MilestoneId;
  readonly projectId: ProjectId;
  readonly name: string;
  readonly description?: string;
  readonly targetDate?: string;
  readonly status: "open" | "completed";
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface RoadmapItem {
  readonly id: string;
  readonly projectId: ProjectId;
  readonly type: "milestone" | "sprint" | "task";
  readonly referenceId: string;
  readonly title: string;
  readonly startDate?: string;
  readonly endDate?: string;
}

export interface Roadmap {
  readonly projectId: ProjectId;
  readonly items: readonly RoadmapItem[];
}
