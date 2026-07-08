"use client";

import { Input } from "@apzhub/ui";

import {
  CLIENT_STATUSES,
  CLIENT_TYPES,
  type ClientFormValues,
  type ClientValidationResult,
} from "../../lib/clients";

export interface ClientFormFieldsProps {
  readonly values: ClientFormValues;
  readonly errors: ClientValidationResult["errors"];
  readonly onChange: (field: keyof ClientFormValues, value: string) => void;
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

/** Canonical Client form fields — validation only, no persistence (LAW-002-01). */
export function ClientFormFields({ values, errors, onChange }: ClientFormFieldsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2" data-testid="client-form-fields">
      <div>
        <FieldLabel htmlFor="clientReference">Client reference</FieldLabel>
        <Input
          id="clientReference"
          value={values.clientReference}
          onChange={(event) => onChange("clientReference", event.target.value)}
          placeholder="CLT-2026-00001"
        />
        <FieldError message={errors.clientReference} />
      </div>

      <div>
        <FieldLabel htmlFor="displayName" required>
          Display name
        </FieldLabel>
        <Input
          id="displayName"
          value={values.displayName}
          onChange={(event) => onChange("displayName", event.target.value)}
          placeholder="Client display name"
        />
        <FieldError message={errors.displayName} />
      </div>

      <div>
        <FieldLabel htmlFor="clientType" required>
          Client type
        </FieldLabel>
        <select
          id="clientType"
          className={selectClassName}
          value={values.clientType}
          onChange={(event) => onChange("clientType", event.target.value)}
        >
          {CLIENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <FieldError message={errors.clientType} />
      </div>

      <div>
        <FieldLabel htmlFor="status" required>
          Status
        </FieldLabel>
        <select
          id="status"
          className={selectClassName}
          value={values.status}
          onChange={(event) => onChange("status", event.target.value)}
        >
          {CLIENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <FieldError message={errors.status} />
      </div>

      <div>
        <FieldLabel htmlFor="primaryContactId">Primary contact ID</FieldLabel>
        <Input
          id="primaryContactId"
          value={values.primaryContactId}
          onChange={(event) => onChange("primaryContactId", event.target.value)}
          placeholder="Contact UUID (optional)"
        />
        <FieldError message={errors.primaryContactId} />
      </div>

      <div>
        <FieldLabel htmlFor="billingAddressId">Billing address ID</FieldLabel>
        <Input
          id="billingAddressId"
          value={values.billingAddressId}
          onChange={(event) => onChange("billingAddressId", event.target.value)}
          placeholder="Address UUID (optional)"
        />
        <FieldError message={errors.billingAddressId} />
      </div>

      <div className="md:col-span-2">
        <FieldLabel htmlFor="tags">Tags</FieldLabel>
        <Input
          id="tags"
          value={values.tags}
          onChange={(event) => onChange("tags", event.target.value)}
          placeholder="corporate, retainer"
        />
      </div>

      <div className="md:col-span-2">
        <FieldLabel htmlFor="customFields">Custom fields</FieldLabel>
        <textarea
          id="customFields"
          className={`${selectClassName} min-h-[6rem]`}
          value={values.customFields}
          onChange={(event) => onChange("customFields", event.target.value)}
          placeholder={"industry=Property\njurisdiction=NSW"}
        />
        <FieldError message={errors.customFields} />
      </div>
    </div>
  );
}
