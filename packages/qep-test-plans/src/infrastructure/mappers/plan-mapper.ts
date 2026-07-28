import type { TestPlan } from "../../domain/test-plan/test-plan";
import type {
  StoredTestPlan,
  TestPlanListQuery,
} from "../../domain/test-plan/plan-repository";

export function toStoredTestPlan(plan: TestPlan): StoredTestPlan {
  const { uncommittedEvents: _events, ...rest } = plan;
  return {
    ...rest,
    uncommittedEvents: [],
  };
}

const TERMINAL_STATUSES = new Set(["archived", "cancelled", "superseded"]);

function matchesQueryText(row: StoredTestPlan, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const haystack = [row.title, row.number, row.objective]
    .filter((value): value is string => Boolean(value))
    .join(" ")
    .toLowerCase();
  return haystack.includes(normalized);
}

function overlapsScheduleWindow(
  row: StoredTestPlan,
  from?: string,
  to?: string,
): boolean {
  if (!from && !to) return true;
  const start = row.schedule.plannedStart;
  const end = row.schedule.plannedEnd ?? row.schedule.plannedStart;
  if (!start && !end) return false;
  if (from && end && end < from) return false;
  if (to && start && start > to) return false;
  return true;
}

export function matchesListFilters(
  row: StoredTestPlan,
  query: TestPlanListQuery,
): boolean {
  if (!query.includeArchived && TERMINAL_STATUSES.has(row.status)) {
    if (!query.status || !TERMINAL_STATUSES.has(query.status)) {
      return false;
    }
  }
  if (query.status && row.status !== query.status) return false;
  if (query.ownerId && row.ownerId !== query.ownerId) return false;
  if (query.leadId && row.assignment.leadId !== query.leadId) return false;
  if (query.priority && row.priority !== query.priority) return false;
  if (query.planType && row.planType !== query.planType) return false;
  if (query.number && row.number !== query.number) return false;
  if (!overlapsScheduleWindow(row, query.scheduledFrom, query.scheduledTo))
    return false;
  if (query.query && !matchesQueryText(row, query.query)) return false;
  return true;
}
