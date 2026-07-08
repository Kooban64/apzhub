"use client";

import { Input } from "@apzhub/ui";
import { useMemo } from "react";

import { getSharedClientRepository } from "../../lib/clients";
import { getSharedDocumentRepository } from "../../lib/documents";
import { getSharedMatterRepository } from "../../lib/matters";
import { getSharedTaskRepository } from "../../lib/tasks";
import { getSharedTimeEntryRepository, SEED_TIME_ATTORNEYS } from "../../lib/time";
import {
  CALENDAR_EVENT_STATUSES,
  CALENDAR_EVENT_STATUS_LABELS,
  CALENDAR_EVENT_TYPES,
  CALENDAR_EVENT_TYPE_LABELS,
  resolveClientIdForMatter,
  type CalendarEventFormValues,
  type CalendarEventValidationResult,
} from "../../lib/calendar";

export interface CalendarEventFormFieldsProps {
  readonly values: CalendarEventFormValues;
  readonly errors: CalendarEventValidationResult["errors"];
  readonly onChange: (field: keyof CalendarEventFormValues, value: string) => void;
}

function FieldError({ message }: { readonly message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1 text-xs text-[var(--color-destructive)]" role="alert">
      {message}
    </p>
  );
}

function FieldLabel({
  htmlFor,
  children,
  required,
}: {
  readonly htmlFor: string;
  readonly children: string;
  readonly required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1 block text-sm font-medium text-[var(--color-foreground)]"
    >
      {children}
      {required ? <span className="text-[var(--color-destructive)]"> *</span> : null}
    </label>
  );
}

const selectClassName =
  "flex h-10 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-foreground)]";

/** Calendar event form fields (LAW-008-01). */
export function CalendarEventFormFields({
  values,
  errors,
  onChange,
}: CalendarEventFormFieldsProps) {
  const matters = getSharedMatterRepository().list();
  const clients = getSharedClientRepository().list();
  const tasks = useMemo(
    () =>
      values.matterId
        ? getSharedTaskRepository().list({ matterId: values.matterId })
        : getSharedTaskRepository().list(),
    [values.matterId],
  );
  const documents = useMemo(
    () =>
      values.matterId
        ? getSharedDocumentRepository().list({ matterId: values.matterId })
        : getSharedDocumentRepository().list(),
    [values.matterId],
  );
  const timeEntries = useMemo(
    () =>
      values.matterId
        ? getSharedTimeEntryRepository().list({ matterId: values.matterId })
        : getSharedTimeEntryRepository().list(),
    [values.matterId],
  );

  function handleMatterChange(matterId: string) {
    onChange("matterId", matterId);
    const clientId = resolveClientIdForMatter(matterId);
    if (clientId) {
      onChange("clientId", clientId);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2" data-testid="calendar-event-form-fields">
      <div className="sm:col-span-2">
        <FieldLabel htmlFor="calendar-title" required>
          Title
        </FieldLabel>
        <Input
          id="calendar-title"
          value={values.title}
          onChange={(event) => onChange("title", event.target.value)}
        />
        <FieldError message={errors.title} />
      </div>

      <div>
        <FieldLabel htmlFor="calendar-reference">Reference</FieldLabel>
        <Input
          id="calendar-reference"
          value={values.calendarEventReference}
          onChange={(event) => onChange("calendarEventReference", event.target.value)}
          placeholder="Auto-generated if blank"
        />
        <FieldError message={errors.calendarEventReference} />
      </div>

      <div>
        <FieldLabel htmlFor="calendar-event-type" required>
          Event type
        </FieldLabel>
        <select
          id="calendar-event-type"
          className={selectClassName}
          value={values.eventType}
          onChange={(event) => onChange("eventType", event.target.value)}
        >
          {CALENDAR_EVENT_TYPES.map((eventType) => (
            <option key={eventType} value={eventType}>
              {CALENDAR_EVENT_TYPE_LABELS[eventType]}
            </option>
          ))}
        </select>
        <FieldError message={errors.eventType} />
      </div>

      <div>
        <FieldLabel htmlFor="calendar-matter" required>
          Matter
        </FieldLabel>
        <select
          id="calendar-matter"
          className={selectClassName}
          value={values.matterId}
          onChange={(event) => handleMatterChange(event.target.value)}
        >
          <option value="">Select matter</option>
          {matters.map((matter) => (
            <option key={matter.matterId} value={matter.matterId}>
              {matter.title}
            </option>
          ))}
        </select>
        <FieldError message={errors.matterId} />
      </div>

      <div>
        <FieldLabel htmlFor="calendar-client">Client</FieldLabel>
        <select
          id="calendar-client"
          className={selectClassName}
          value={values.clientId}
          onChange={(event) => onChange("clientId", event.target.value)}
        >
          <option value="">From matter</option>
          {clients.map((client) => (
            <option key={client.clientId} value={client.clientId}>
              {client.displayName}
            </option>
          ))}
        </select>
        <FieldError message={errors.clientId} />
      </div>

      <div>
        <FieldLabel htmlFor="calendar-owner" required>
          Assigned user
        </FieldLabel>
        <select
          id="calendar-owner"
          className={selectClassName}
          value={values.ownerUserId}
          onChange={(event) => onChange("ownerUserId", event.target.value)}
        >
          <option value="">Select attorney</option>
          {SEED_TIME_ATTORNEYS.map((attorney) => (
            <option key={attorney.userId} value={attorney.userId}>
              {attorney.displayName}
            </option>
          ))}
        </select>
        <FieldError message={errors.ownerUserId} />
      </div>

      <div>
        <FieldLabel htmlFor="calendar-status" required>
          Status
        </FieldLabel>
        <select
          id="calendar-status"
          className={selectClassName}
          value={values.calendarEventStatus}
          onChange={(event) => onChange("calendarEventStatus", event.target.value)}
        >
          {CALENDAR_EVENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {CALENDAR_EVENT_STATUS_LABELS[status]}
            </option>
          ))}
        </select>
        <FieldError message={errors.calendarEventStatus} />
      </div>

      <div>
        <FieldLabel htmlFor="calendar-starts" required>
          Starts
        </FieldLabel>
        <Input
          id="calendar-starts"
          type="datetime-local"
          value={values.startsAt}
          onChange={(event) => onChange("startsAt", event.target.value)}
        />
        <FieldError message={errors.startsAt} />
      </div>

      <div>
        <FieldLabel htmlFor="calendar-ends" required>
          Ends
        </FieldLabel>
        <Input
          id="calendar-ends"
          type="datetime-local"
          value={values.endsAt}
          onChange={(event) => onChange("endsAt", event.target.value)}
        />
        <FieldError message={errors.endsAt} />
      </div>

      <div>
        <FieldLabel htmlFor="calendar-all-day">All day</FieldLabel>
        <select
          id="calendar-all-day"
          className={selectClassName}
          value={values.allDay}
          onChange={(event) => onChange("allDay", event.target.value)}
        >
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </div>

      <div>
        <FieldLabel htmlFor="calendar-location">Location</FieldLabel>
        <Input
          id="calendar-location"
          value={values.location}
          onChange={(event) => onChange("location", event.target.value)}
        />
      </div>

      <div className="sm:col-span-2">
        <FieldLabel htmlFor="calendar-description">Description</FieldLabel>
        <Input
          id="calendar-description"
          value={values.description}
          onChange={(event) => onChange("description", event.target.value)}
        />
      </div>

      <div>
        <FieldLabel htmlFor="calendar-task">Linked task</FieldLabel>
        <select
          id="calendar-task"
          className={selectClassName}
          value={values.taskId}
          onChange={(event) => onChange("taskId", event.target.value)}
        >
          <option value="">None</option>
          {tasks.map((task) => (
            <option key={task.taskId} value={task.taskId}>
              {task.title}
            </option>
          ))}
        </select>
        <FieldError message={errors.taskId} />
      </div>

      <div>
        <FieldLabel htmlFor="calendar-document">Linked document</FieldLabel>
        <select
          id="calendar-document"
          className={selectClassName}
          value={values.documentId}
          onChange={(event) => onChange("documentId", event.target.value)}
        >
          <option value="">None</option>
          {documents.map((document) => (
            <option key={document.documentId} value={document.documentId}>
              {document.title}
            </option>
          ))}
        </select>
        <FieldError message={errors.documentId} />
      </div>

      <div>
        <FieldLabel htmlFor="calendar-time-entry">Linked time entry</FieldLabel>
        <select
          id="calendar-time-entry"
          className={selectClassName}
          value={values.timeEntryId}
          onChange={(event) => onChange("timeEntryId", event.target.value)}
        >
          <option value="">None</option>
          {timeEntries.map((entry) => (
            <option key={entry.timeEntryId} value={entry.timeEntryId}>
              {entry.timeEntryReference} — {entry.narrative.slice(0, 40)}
            </option>
          ))}
        </select>
        <FieldError message={errors.timeEntryId} />
      </div>

      <div>
        <FieldLabel htmlFor="calendar-reminders">Reminder minutes</FieldLabel>
        <Input
          id="calendar-reminders"
          value={values.reminderMinutes}
          onChange={(event) => onChange("reminderMinutes", event.target.value)}
          placeholder="60, 1440"
        />
      </div>
    </div>
  );
}
