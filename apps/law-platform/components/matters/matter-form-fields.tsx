"use client";

import { Input } from "@apzhub/ui";

import { getSharedClientRepository } from "../../lib/clients";
import {
  MATTER_PRIORITIES,
  MATTER_STATUS_OPTIONS,
  MATTER_TYPE_OPTIONS,
  PRACTICE_AREA_OPTIONS,
  SEED_ATTORNEYS,
  type MatterFormValues,
  type MatterValidationResult,
} from "../../lib/matters";

export interface MatterFormFieldsProps {
  readonly values: MatterFormValues;
  readonly errors: MatterValidationResult["errors"];
  readonly onChange: (field: keyof MatterFormValues, value: string) => void;
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

/** Canonical Matter form fields — validation only, no persistence (LAW-003-01). */
export function MatterFormFields({ values, errors, onChange }: MatterFormFieldsProps) {
  const clients = getSharedClientRepository().list();

  return (
    <div className="grid gap-6 md:grid-cols-2" data-testid="matter-form-fields">
      <div>
        <FieldLabel htmlFor="matterReference">Matter reference</FieldLabel>
        <Input
          id="matterReference"
          value={values.matterReference}
          onChange={(event) => onChange("matterReference", event.target.value)}
          placeholder="MAT-2026-00001"
        />
        <FieldError message={errors.matterReference} />
      </div>

      <div>
        <FieldLabel htmlFor="title" required>
          Title
        </FieldLabel>
        <Input
          id="title"
          value={values.title}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder="Matter title"
        />
        <FieldError message={errors.title} />
      </div>

      <div className="md:col-span-2">
        <FieldLabel htmlFor="description">Description</FieldLabel>
        <textarea
          id="description"
          className={`${selectClassName} min-h-[6rem]`}
          value={values.description}
          onChange={(event) => onChange("description", event.target.value)}
          placeholder="Brief matter description (optional)"
        />
        <FieldError message={errors.description} />
      </div>

      <div>
        <FieldLabel htmlFor="clientId" required>
          Client
        </FieldLabel>
        <select
          id="clientId"
          className={selectClassName}
          value={values.clientId}
          onChange={(event) => onChange("clientId", event.target.value)}
        >
          <option value="">Select client…</option>
          {clients.map((client) => (
            <option key={client.clientId} value={client.clientId}>
              {client.displayName}
            </option>
          ))}
        </select>
        <FieldError message={errors.clientId} />
      </div>

      <div>
        <FieldLabel htmlFor="matterTypeId" required>
          Matter type
        </FieldLabel>
        <select
          id="matterTypeId"
          className={selectClassName}
          value={values.matterTypeId}
          onChange={(event) => onChange("matterTypeId", event.target.value)}
        >
          {MATTER_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError message={errors.matterTypeId} />
      </div>

      <div>
        <FieldLabel htmlFor="practiceAreaId" required>
          Practice area
        </FieldLabel>
        <select
          id="practiceAreaId"
          className={selectClassName}
          value={values.practiceAreaId}
          onChange={(event) => onChange("practiceAreaId", event.target.value)}
        >
          {PRACTICE_AREA_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError message={errors.practiceAreaId} />
      </div>

      <div>
        <FieldLabel htmlFor="matterStatus" required>
          Status
        </FieldLabel>
        <select
          id="matterStatus"
          className={selectClassName}
          value={values.matterStatus}
          onChange={(event) => onChange("matterStatus", event.target.value)}
        >
          {MATTER_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <FieldError message={errors.matterStatus} />
      </div>

      <div>
        <FieldLabel htmlFor="priority" required>
          Priority
        </FieldLabel>
        <select
          id="priority"
          className={selectClassName}
          value={values.priority}
          onChange={(event) => onChange("priority", event.target.value)}
        >
          {MATTER_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priority}
            </option>
          ))}
        </select>
        <FieldError message={errors.priority} />
      </div>

      <div>
        <FieldLabel htmlFor="leadAttorneyId" required>
          Lead attorney
        </FieldLabel>
        <select
          id="leadAttorneyId"
          className={selectClassName}
          value={values.leadAttorneyId}
          onChange={(event) => onChange("leadAttorneyId", event.target.value)}
        >
          <option value="">Select attorney…</option>
          {SEED_ATTORNEYS.map((attorney) => (
            <option key={attorney.attorneyId} value={attorney.attorneyId}>
              {attorney.displayName}
            </option>
          ))}
        </select>
        <FieldError message={errors.leadAttorneyId} />
      </div>

      <div className="md:col-span-2">
        <FieldLabel htmlFor="tags">Tags</FieldLabel>
        <Input
          id="tags"
          value={values.tags}
          onChange={(event) => onChange("tags", event.target.value)}
          placeholder="planning, appeal"
        />
      </div>

      <div className="md:col-span-2">
        <FieldLabel htmlFor="customFields">Custom fields</FieldLabel>
        <textarea
          id="customFields"
          className={`${selectClassName} min-h-[6rem]`}
          value={values.customFields}
          onChange={(event) => onChange("customFields", event.target.value)}
          placeholder={"court=Land and Environment Court\njurisdiction=NSW"}
        />
        <FieldError message={errors.customFields} />
      </div>
    </div>
  );
}
