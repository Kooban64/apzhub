import type { TimeTrackingService } from "./time-tracking-service";
import type { TimeActivityService } from "./activity-service";
import type { TimeCustomerService } from "./customer-service";
import type { ProjectTimeService } from "./project-time-service";
import type { TimesheetService } from "./timesheet-service";
import type { TimeTagService } from "./tag-service";
import type { TimeReportingService } from "./reporting-service";

export type { TimeTrackingService } from "./time-tracking-service";
export type {
  TimeFoundationCapabilities,
  TimeConnectionTestResult,
  TimeHealthSnapshot,
  TimeDiagnosticsSnapshot,
  TimeCompatibilitySnapshot,
  TimeReadinessSnapshot,
} from "./time-tracking-service";
export type {
  TimeActivityService,
  CreateTimeActivityInput,
  UpdateTimeActivityInput,
} from "./activity-service";
export type {
  TimeCustomerService,
  CreateTimeCustomerInput,
  UpdateTimeCustomerInput,
} from "./customer-service";
export type {
  ProjectTimeService,
  CreateTimeProjectInput,
  UpdateTimeProjectInput,
} from "./project-time-service";
export type {
  TimesheetService,
  CreateTimesheetInput,
  UpdateTimesheetInput,
} from "./timesheet-service";
export type {
  TimeTagService,
  CreateTimeTagInput,
  UpdateTimeTagInput,
} from "./tag-service";
export type {
  TimeReportingService,
  TimeReportingCapabilities,
  TimeReportingHealth,
} from "./reporting-service";

/** Nested Time Platform gateway — sole application entry for Time platform services. */
export interface TimePlatformGateway {
  readonly tracking: TimeTrackingService;
  readonly activities: TimeActivityService;
  readonly customers: TimeCustomerService;
  readonly projects: ProjectTimeService;
  readonly timesheets: TimesheetService;
  readonly tags: TimeTagService;
  readonly reporting: TimeReportingService;
}
