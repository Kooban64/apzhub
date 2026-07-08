"use client";

import { Input } from "@apzhub/ui";
import { useMemo } from "react";

import {
  SEED_TASK_ASSIGNEES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  type TaskFormValues,
  type TaskValidationResult,
} from "../../lib/tasks";
import { getSharedDocumentRepository } from "../../lib/documents";
import { getSharedMatterRepository } from "../../lib/matters";

export interface TaskFormFieldsProps {
  readonly values: TaskFormValues;
  readonly errors: TaskValidationResult["errors"];
  readonly onChange: (field: keyof TaskFormValues, value: string) => void;
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

function formatLabel(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Canonical Task form fields — validation only, no persistence (LAW-005-01). */
export function TaskFormFields({ values, errors, onChange }: TaskFormFieldsProps) {
  const matters = getSharedMatterRepository().list();
  const documents = useMemo(
    () =>
      values.matterId
        ? getSharedDocumentRepository().list({ matterId: values.matterId })
        : [],
    [values.matterId],
  );

  function handleMatterChange(matterId: string) {
    onChange("matterId", matterId);

    if (
      values.documentId &&
      !getSharedDocumentRepository()
        .list({ matterId })
        .some((document) => document.documentId === values.documentId)
    ) {
      onChange("documentId", "");
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2" data-testid="task-form-fields">
      <div>
        <FieldLabel htmlFor="taskReference">Task reference</FieldLabel>
        <Input
          id="taskReference"
          value={values.taskReference}
          onChange={(event) => onChange("taskReference", event.target.value)}
          placeholder="TSK-2026-00001"
        />
        <FieldError message={errors.taskReference} />
      </div>

      <div>
        <FieldLabel htmlFor="title" required>
          Title
        </FieldLabel>
        <Input
          id="title"
          value={values.title}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder="Task title"
        />
        <FieldError message={errors.title} />
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
          data-testid="task-form-matter"
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
        <FieldLabel htmlFor="documentId">Document (optional)</FieldLabel>
        <select
          id="documentId"
          className={selectClassName}
          value={values.documentId}
          onChange={(event) => onChange("documentId", event.target.value)}
          data-testid="task-form-document"
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
        <FieldLabel htmlFor="assigneeUserId" required>
          Assigned attorney
        </FieldLabel>
        <select
          id="assigneeUserId"
          className={selectClassName}
          value={values.assigneeUserId}
          onChange={(event) => onChange("assigneeUserId", event.target.value)}
          data-testid="task-form-assignee"
        >
          <option value="">Select assignee…</option>
          {SEED_TASK_ASSIGNEES.map((assignee) => (
            <option key={assignee.assigneeUserId} value={assignee.assigneeUserId}>
              {assignee.displayName}
            </option>
          ))}
        </select>
        <FieldError message={errors.assigneeUserId} />
      </div>

      <div>
        <FieldLabel htmlFor="taskPriority">Priority</FieldLabel>
        <select
          id="taskPriority"
          className={selectClassName}
          value={values.taskPriority}
          onChange={(event) => onChange("taskPriority", event.target.value)}
        >
          {TASK_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {formatLabel(priority)}
            </option>
          ))}
        </select>
        <FieldError message={errors.taskPriority} />
      </div>

      <div>
        <FieldLabel htmlFor="taskStatus">Status</FieldLabel>
        <select
          id="taskStatus"
          className={selectClassName}
          value={values.taskStatus}
          onChange={(event) => onChange("taskStatus", event.target.value)}
        >
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {formatLabel(status)}
            </option>
          ))}
        </select>
        <FieldError message={errors.taskStatus} />
      </div>

      <div>
        <FieldLabel htmlFor="dueAt">Due date</FieldLabel>
        <Input
          id="dueAt"
          type="datetime-local"
          value={values.dueAt}
          onChange={(event) => onChange("dueAt", event.target.value)}
        />
      </div>

      <div className="md:col-span-2">
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <textarea
          id="description"
          className={`${selectClassName} min-h-24 py-2`}
          value={values.description}
          onChange={(event) => onChange("description", event.target.value)}
          placeholder="Task description"
        />
      </div>

      <div className="md:col-span-2">
        <FieldLabel htmlFor="tags">Tags</FieldLabel>
        <Input
          id="tags"
          value={values.tags}
          onChange={(event) => onChange("tags", event.target.value)}
          placeholder="discovery, filing, review"
        />
      </div>
    </div>
  );
}
