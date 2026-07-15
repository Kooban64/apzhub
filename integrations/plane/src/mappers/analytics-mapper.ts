import type {
  BurndownPoint,
  BurndownSnapshot,
  CycleProgressSnapshot,
  DistributionBucket,
  MemberWorkloadSummary,
  ProjectStatistics,
  Task,
  TaskStatistics,
  VelocitySnapshot,
} from "@apzhub/platform-service-contracts";

import type {
  PlaneCycleAnalyticsRecord,
  PlaneCycleProgressRecord,
  PlaneProjectStatsRecord,
} from "../internal/plane-api-types";
import { toSprintId, toUserId } from "./mapper-context";

function percent(completed: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((completed / total) * 1000) / 10;
}

function countBy(
  items: readonly Task[],
  keyOf: (task: Task) => string,
): DistributionBucket[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const key = keyOf(item);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()].map(([key, count]) => ({ key, count }));
}

function isCompleted(task: Task): boolean {
  return task.status === "done" || task.status === "cancelled";
}

function isBlocked(task: Task): boolean {
  return task.status === "blocked";
}

function isOverdue(task: Task, nowIso: string): boolean {
  if (!task.dueDate || isCompleted(task)) {
    return false;
  }
  return task.dueDate < nowIso.slice(0, 10);
}

export function buildMemberWorkloads(
  tasks: readonly Task[],
  nowIso: string,
): MemberWorkloadSummary[] {
  const byUser = new Map<
    string,
    {
      userId: string;
      openTaskCount: number;
      completedTaskCount: number;
      overdueTaskCount: number;
      blockedTaskCount: number;
    }
  >();

  const ensure = (userId: string) => {
    const existing = byUser.get(userId);
    if (existing) {
      return existing;
    }
    const created = {
      userId,
      openTaskCount: 0,
      completedTaskCount: 0,
      overdueTaskCount: 0,
      blockedTaskCount: 0,
    };
    byUser.set(userId, created);
    return created;
  };

  for (const task of tasks) {
    const assignees = [
      ...(task.assigneeId ? [task.assigneeId] : []),
      ...(task.assigneeIds ?? []),
    ];
    const unique = [...new Set(assignees)];
    for (const userId of unique) {
      const row = ensure(userId);
      if (isCompleted(task)) {
        row.completedTaskCount += 1;
      } else {
        row.openTaskCount += 1;
      }
      if (isOverdue(task, nowIso)) {
        row.overdueTaskCount += 1;
      }
      if (isBlocked(task)) {
        row.blockedTaskCount += 1;
      }
    }
  }

  return [...byUser.values()];
}

export function mapProjectStatisticsFromTasks(
  projectId: string,
  tasks: readonly Task[],
  stats: PlaneProjectStatsRecord | undefined,
  nowIso: string,
): ProjectStatistics {
  const active = tasks.filter((task) => !task.archivedAt);
  const completedTasks =
    stats?.completed_issues ?? active.filter((task) => isCompleted(task)).length;
  const totalTasks = stats?.total_issues ?? active.length;
  const openTasks = Math.max(totalTasks - completedTasks, 0);
  const overdueTasks = active.filter((task) => isOverdue(task, nowIso)).length;
  const blockedTasks = active.filter((task) => isBlocked(task)).length;

  return {
    projectId,
    totalTasks,
    completedTasks,
    openTasks,
    overdueTasks,
    blockedTasks,
    completionPercent: percent(completedTasks, totalTasks),
    stateDistribution: countBy(active, (task) => task.status),
    priorityDistribution: countBy(active, (task) => task.priority),
    memberWorkloads: buildMemberWorkloads(active, nowIso),
    capturedAt: nowIso,
  };
}

export function mapTaskStatistics(
  task: Task,
  extras: { readonly commentCount?: number; readonly watcherCount?: number },
  nowIso: string,
): TaskStatistics {
  return {
    taskId: task.id,
    projectId: task.projectId,
    status: task.status,
    priority: task.priority,
    isOverdue: isOverdue(task, nowIso),
    isBlocked: isBlocked(task),
    commentCount: extras.commentCount,
    watcherCount: extras.watcherCount,
    capturedAt: nowIso,
  };
}

export function mapCycleProgress(
  projectId: string,
  sprintId: string,
  record: PlaneCycleProgressRecord,
  nowIso: string,
): CycleProgressSnapshot {
  const totalTasks = record.total_issues ?? 0;
  const completedTasks = record.completed_issues ?? 0;
  const distribution = record.distribution
    ? Object.entries(record.distribution).map(([key, count]) => ({ key, count }))
    : [
        { key: "completed", count: record.completed_issues ?? 0 },
        { key: "started", count: record.started_issues ?? 0 },
        { key: "unstarted", count: record.unstarted_issues ?? 0 },
        { key: "backlog", count: record.backlog_issues ?? 0 },
        { key: "cancelled", count: record.cancelled_issues ?? 0 },
      ].filter((entry) => entry.count > 0);

  return {
    projectId,
    sprintId: sprintId.startsWith("sprint_") ? sprintId : toSprintId(sprintId),
    totalTasks,
    completedTasks,
    completionPercent: percent(completedTasks, totalTasks),
    statusDistribution: distribution,
    capturedAt: nowIso,
  };
}

export function mapVelocitySnapshot(
  projectId: string,
  sprintId: string,
  record: PlaneCycleAnalyticsRecord,
  nowIso: string,
): VelocitySnapshot {
  const committedPoints = record.total_estimate_points ?? 0;
  const completedPoints = record.completed_estimate_points ?? 0;
  const committedTaskCount = Object.values(record.issue_distribution ?? {}).reduce(
    (sum, value) => sum + value,
    0,
  );
  const completedTaskCount = record.issue_distribution?.completed ?? 0;

  return {
    projectId,
    sprintId: sprintId.startsWith("sprint_") ? sprintId : toSprintId(sprintId),
    completedPoints,
    committedPoints,
    completedTaskCount,
    committedTaskCount,
    velocity: completedPoints,
    capturedAt: nowIso,
  };
}

export function mapBurndownSnapshot(
  projectId: string,
  sprintId: string,
  progress: PlaneCycleProgressRecord,
  analytics: PlaneCycleAnalyticsRecord,
  nowIso: string,
  dates?: { readonly startDate?: string; readonly endDate?: string },
): BurndownSnapshot {
  const totalPoints = analytics.total_estimate_points ?? progress.total_issues ?? 0;
  const completedPoints =
    analytics.completed_estimate_points ?? progress.completed_issues ?? 0;
  const remainingPoints = Math.max(totalPoints - completedPoints, 0);
  const chart = progress.completion_chart ?? analytics.completion_chart ?? [];

  const points: BurndownPoint[] = chart.map((entry) => {
    const completed = entry.completed ?? 0;
    const total = entry.total ?? totalPoints;
    return {
      date: entry.date ?? nowIso.slice(0, 10),
      remainingPoints: Math.max(total - completed, 0),
      remainingTasks: Math.max(total - completed, 0),
      idealRemainingPoints:
        "ideal" in entry && typeof entry.ideal === "number" ? entry.ideal : undefined,
    };
  });

  return {
    projectId,
    sprintId: sprintId.startsWith("sprint_") ? sprintId : toSprintId(sprintId),
    startDate: dates?.startDate,
    endDate: dates?.endDate,
    totalPoints,
    remainingPoints,
    completionPercent: percent(completedPoints, totalPoints),
    points,
    capturedAt: nowIso,
  };
}

export function normalizeUserId(planeUserId: string): string {
  return planeUserId.startsWith("user_") ? planeUserId : toUserId(planeUserId);
}
