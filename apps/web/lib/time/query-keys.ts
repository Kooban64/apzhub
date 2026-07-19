import type {
  TimeActivityListParams,
  TimeCustomerListParams,
  TimeProjectListParams,
  TimeTagListParams,
  TimesheetListParams,
} from "./types";

export const timeQueryKeys = {
  all: ["time"] as const,
  timesheets: (params: TimesheetListParams = {}) =>
    [...timeQueryKeys.all, "timesheets", params] as const,
  timesheet: (timesheetId: string) =>
    [...timeQueryKeys.all, "timesheet", timesheetId] as const,
  activities: (params: TimeActivityListParams = {}) =>
    [...timeQueryKeys.all, "activities", params] as const,
  activity: (activityId: string) =>
    [...timeQueryKeys.all, "activity", activityId] as const,
  customers: (params: TimeCustomerListParams = {}) =>
    [...timeQueryKeys.all, "customers", params] as const,
  customer: (customerId: string) =>
    [...timeQueryKeys.all, "customer", customerId] as const,
  tags: (params: TimeTagListParams = {}) =>
    [...timeQueryKeys.all, "tags", params] as const,
  tag: (tagId: string) => [...timeQueryKeys.all, "tag", tagId] as const,
  projects: (params: TimeProjectListParams = {}) =>
    [...timeQueryKeys.all, "projects", params] as const,
  project: (projectId: string) => [...timeQueryKeys.all, "project", projectId] as const,
  health: () => [...timeQueryKeys.all, "health"] as const,
  diagnostics: () => [...timeQueryKeys.all, "diagnostics"] as const,
  capabilities: () => [...timeQueryKeys.all, "capabilities"] as const,
  readiness: () => [...timeQueryKeys.all, "readiness"] as const,
  compatibility: () => [...timeQueryKeys.all, "compatibility"] as const,
  search: (q: string) => [...timeQueryKeys.all, "search", q] as const,
};
