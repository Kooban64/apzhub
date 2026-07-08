"use client";

import { Input } from "@apzhub/ui";
import { useMemo } from "react";

import {
  SEED_TIME_ATTORNEYS,
  computeDurationFromTimes,
  formatTimeEntryRate,
  resolveAttorneyRate,
  type TimeEntryFormValues,
  type TimeEntryValidationResult,
} from "../../lib/time";
import { getSharedDocumentRepository } from "../../lib/documents";
import { getSharedMatterRepository } from "../../lib/matters";
import { getSharedTaskRepository } from "../../lib/tasks";

export interface TimeEntryFormFieldsProps {
  readonly values: TimeEntryFormValues;
  readonly errors: TimeEntryValidationResult["errors"];
  readonly onChange: (field: keyof TimeEntryFormValues, value: string) => void;
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

/** Canonical Time Entry form fields — manual duration, no timer (LAW-006-01). */
export function TimeEntryFormFields({
  values,
  errors,
  onChange,
}: TimeEntryFormFieldsProps) {
  const matters = getSharedMatterRepository().list();
  const tasks = useMemo(
    () =>
      values.matterId
        ? getSharedTaskRepository().list({ matterId: values.matterId })
        : [],
    [values.matterId],
  );
  const documents = useMemo(
    () =>
      values.matterId
        ? getSharedDocumentRepository().list({ matterId: values.matterId })
        : [],
    [values.matterId],
  );
  const computedDuration = computeDurationFromTimes(values.startTime, values.endTime);
  const displayRate = values.userId
    ? formatTimeEntryRate(resolveAttorneyRate(values.userId))
    : "—";

  function handleMatterChange(matterId: string) {
    onChange("matterId", matterId);
    onChange("taskId", "");
    onChange("documentId", "");
  }

  return (
    <div className="grid gap-6 md:grid-cols-2" data-testid="time-entry-form-fields">
      <div>
        <FieldLabel htmlFor="timeEntryReference">Time reference</FieldLabel>
        <Input
          id="timeEntryReference"
          value={values.timeEntryReference}
          onChange={(event) => onChange("timeEntryReference", event.target.value)}
          placeholder="TIM-2026-000001"
        />
        <FieldError message={errors.timeEntryReference} />
      </div>

      <div>
        <FieldLabel htmlFor="entryDate" required>
          Entry date
        </FieldLabel>
        <Input
          id="entryDate"
          type="date"
          value={values.entryDate}
          onChange={(event) => onChange("entryDate", event.target.value)}
        />
        <FieldError message={errors.entryDate} />
      </div>

      <div>
        <FieldLabel htmlFor="matterId" required>
          Matter
        </FieldLabel>
        <select
          id="matterId"
          className={selectClassName}
          value={values.matterId}
          onChange={(event) => handleMatterChange(event.target.value)}
          data-testid="time-entry-form-matter"
        >
          <option value="">Select matter…</option>
          {matters.map((matter) => (
            <option key={matter.matterId} value={matter.matterId}>
              {matter.title}
            </option>
          ))}
        </select>
        <FieldError message={errors.matterId} />
      </div>

      <div>
        <FieldLabel htmlFor="userId" required>
          Attorney
        </FieldLabel>
        <select
          id="userId"
          className={selectClassName}
          value={values.userId}
          onChange={(event) => onChange("userId", event.target.value)}
          data-testid="time-entry-form-attorney"
        >
          <option value="">Select attorney…</option>
          {SEED_TIME_ATTORNEYS.map((attorney) => (
            <option key={attorney.userId} value={attorney.userId}>
              {attorney.displayName}
            </option>
          ))}
        </select>
        <FieldError message={errors.userId} />
      </div>

      <div>
        <FieldLabel htmlFor="taskId">Task (optional)</FieldLabel>
        <select
          id="taskId"
          className={selectClassName}
          value={values.taskId}
          onChange={(event) => onChange("taskId", event.target.value)}
          data-testid="time-entry-form-task"
          disabled={!values.matterId}
        >
          <option value="">No linked task</option>
          {tasks.map((task) => (
            <option key={task.taskId} value={task.taskId}>
              {task.title}
            </option>
          ))}
        </select>
        <FieldError message={errors.taskId} />
      </div>

      <div>
        <FieldLabel htmlFor="documentId">Document (optional)</FieldLabel>
        <select
          id="documentId"
          className={selectClassName}
          value={values.documentId}
          onChange={(event) => onChange("documentId", event.target.value)}
          data-testid="time-entry-form-document"
          disabled={!values.matterId}
        >
          <option value="">No linked document</option>
          {documents.map((document) => (
            <option key={document.documentId} value={document.documentId}>
              {document.title}
            </option>
          ))}
        </select>
        <FieldError message={errors.documentId} />
      </div>

      <div>
        <FieldLabel htmlFor="startTime">Start time (optional)</FieldLabel>
        <Input
          id="startTime"
          type="datetime-local"
          value={values.startTime}
          onChange={(event) => onChange("startTime", event.target.value)}
        />
      </div>

      <div>
        <FieldLabel htmlFor="endTime">End time (optional)</FieldLabel>
        <Input
          id="endTime"
          type="datetime-local"
          value={values.endTime}
          onChange={(event) => onChange("endTime", event.target.value)}
        />
      </div>

      <div>
        <FieldLabel htmlFor="durationMinutes" required>
          Duration (minutes)
        </FieldLabel>
        <Input
          id="durationMinutes"
          type="number"
          min="1"
          value={values.durationMinutes}
          onChange={(event) => onChange("durationMinutes", event.target.value)}
          placeholder="Manual duration entry"
          data-testid="time-entry-form-duration"
        />
        {computedDuration > 0 ? (
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
            Computed from start/end: {computedDuration} minutes
          </p>
        ) : null}
        <FieldError message={errors.durationMinutes} />
      </div>

      <div>
        <FieldLabel htmlFor="billable">Billable</FieldLabel>
        <select
          id="billable"
          className={selectClassName}
          value={values.billable}
          onChange={(event) => onChange("billable", event.target.value)}
        >
          <option value="true">Billable</option>
          <option value="false">Non-billable</option>
        </select>
      </div>

      <div>
        <FieldLabel htmlFor="displayRate">Rate (display only)</FieldLabel>
        <Input id="displayRate" value={displayRate} readOnly disabled />
      </div>

      <div className="md:col-span-2">
        <FieldLabel htmlFor="narrative" required>
          Description
        </FieldLabel>
        <textarea
          id="narrative"
          className={`${selectClassName} min-h-24 py-2`}
          value={values.narrative}
          onChange={(event) => onChange("narrative", event.target.value)}
          placeholder="Describe work performed"
        />
        <FieldError message={errors.narrative} />
      </div>
    </div>
  );
}
