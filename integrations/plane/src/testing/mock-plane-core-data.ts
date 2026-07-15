import type {
  PlaneActivityRecord,
  PlaneCommentRecord,
  PlaneCycleRecord,
  PlaneIssueRecord,
  PlaneLabelRecord,
  PlaneMemberRecord,
  PlaneModuleRecord,
  PlaneProjectRecord,
  PlaneStateRecord,
  PlaneSubscriberRecord,
  PlaneWorkspaceResponse,
} from "../internal/plane-api-types";

export const MOCK_WORKSPACE: PlaneWorkspaceResponse = {
  id: "ws-001",
  name: "APZHUB",
  slug: "apzhub",
  url: "https://plane.example.com/apzhub",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-07-01T00:00:00.000Z",
};

export const MOCK_PROJECT: PlaneProjectRecord = {
  id: "proj-001",
  name: "Platform Core",
  identifier: "CORE",
  description: "Core platform work",
  workspace: "ws-001",
  project_lead: "user-001",
  archived_at: null,
  created_at: "2026-02-01T00:00:00.000Z",
  updated_at: "2026-07-01T00:00:00.000Z",
};

export const MOCK_STATE: PlaneStateRecord = {
  id: "state-001",
  name: "Backlog",
  group: "backlog",
  color: "#888888",
  sequence: 1,
};

export const MOCK_LABEL: PlaneLabelRecord = {
  id: "label-001",
  name: "Bug",
  color: "#ff0000",
  created_at: "2026-03-01T00:00:00.000Z",
  updated_at: "2026-03-01T00:00:00.000Z",
};

export const MOCK_CYCLE: PlaneCycleRecord = {
  id: "cycle-001",
  name: "Sprint 1",
  description: "First sprint",
  start_date: "2026-04-01",
  end_date: "2026-04-14",
  status: "current",
  created_at: "2026-04-01T00:00:00.000Z",
  updated_at: "2026-04-01T00:00:00.000Z",
};

export const MOCK_MODULE: PlaneModuleRecord = {
  id: "module-001",
  name: "Auth Module",
  description: "Authentication rollout",
  status: "in-progress",
  start_date: "2026-05-01",
  target_date: "2026-06-01",
  created_at: "2026-05-01T00:00:00.000Z",
  updated_at: "2026-05-01T00:00:00.000Z",
};

export const MOCK_MEMBER: PlaneMemberRecord = {
  id: "member-001",
  member: "user-001",
  role: 15,
  created_at: "2026-06-01T00:00:00.000Z",
  updated_at: "2026-06-01T00:00:00.000Z",
};

export const MOCK_ISSUE: PlaneIssueRecord = {
  id: "issue-001",
  name: "Implement auth",
  description_html: "<p>Wire Better Auth</p>",
  description_stripped: "Wire Better Auth",
  project: "proj-001",
  state: "state-001",
  priority: "high",
  assignees: ["user-001"],
  labels: ["label-001"],
  cycle: "cycle-001",
  module: "module-001",
  parent: null,
  estimate_point: 3,
  start_date: "2026-07-01",
  target_date: "2026-07-15",
  sequence_id: 1,
  sort_order: 1000,
  archived_at: null,
  created_at: "2026-07-01T00:00:00.000Z",
  updated_at: "2026-07-01T00:00:00.000Z",
};

export const MOCK_COMMENT: PlaneCommentRecord = {
  id: "comment-001",
  comment_html: "<p>Looks good</p>",
  comment_stripped: "Looks good",
  actor: "user-001",
  issue: "issue-001",
  project: "proj-001",
  created_at: "2026-07-02T00:00:00.000Z",
  updated_at: "2026-07-02T00:00:00.000Z",
};

export const MOCK_ACTIVITY: PlaneActivityRecord = {
  id: "activity-001",
  verb: "updated",
  field: "state",
  old_value: "Backlog",
  new_value: "In Progress",
  actor: "user-001",
  issue: "issue-001",
  project: "proj-001",
  created_at: "2026-07-02T01:00:00.000Z",
};

export const MOCK_SUBSCRIBER: PlaneSubscriberRecord = {
  id: "sub-001",
  subscriber: "user-001",
  issue: "issue-001",
  project: "proj-001",
  created_at: "2026-07-02T02:00:00.000Z",
};

export function paginate<T>(results: readonly T[]) {
  return {
    count: results.length,
    total_count: results.length,
    total_results: results.length,
    next_cursor: null,
    prev_cursor: null,
    next_page_results: false,
    results,
  };
}
