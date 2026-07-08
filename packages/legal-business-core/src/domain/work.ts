import type { CalendarEventType, TaskPriority, TaskStatus } from "./enums";

export interface Task {
  readonly taskId: string;
  readonly taskReference: string;
  readonly title: string;
  readonly description?: string;
  readonly taskStatus: TaskStatus;
  readonly taskPriority: TaskPriority;
  readonly assigneeUserId: string;
  readonly matterId?: string;
  readonly clientId?: string;
  readonly dueAt?: string;
  readonly completedAt?: string;
  readonly workflowStepId?: string;
  readonly tags: readonly string[];
}

export interface WorkflowStep {
  readonly stepId: string;
  readonly name: string;
  readonly order: number;
  readonly taskTemplateIds: readonly string[];
}

export interface Workflow {
  readonly workflowId: string;
  readonly workflowCode: string;
  readonly name: string;
  readonly description?: string;
  readonly steps: readonly WorkflowStep[];
  readonly matterTypeIds: readonly string[];
  readonly isActive: boolean;
}

export interface Appointment {
  readonly appointmentId: string;
  readonly title: string;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly location?: string;
  readonly matterId?: string;
  readonly participantUserIds: readonly string[];
  readonly participantContactIds: readonly string[];
  readonly calendarEventId: string;
}

export interface CalendarEvent {
  readonly calendarEventId: string;
  readonly title: string;
  readonly eventType: CalendarEventType;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly allDay: boolean;
  readonly matterId?: string;
  readonly courtId?: string;
  readonly ownerUserId: string;
  readonly reminderMinutes: readonly number[];
  readonly calendarEventStatus: string;
}

export interface TaskSearchCriteria {
  readonly query?: string;
  readonly assigneeUserId?: string;
  readonly matterId?: string;
  readonly taskStatus?: TaskStatus | "all";
}

export interface CalendarSearchCriteria {
  readonly ownerUserId?: string;
  readonly matterId?: string;
  readonly startsAfter?: string;
  readonly startsBefore?: string;
}
