"use client";

import { Input } from "@apzhub/ui";
import { useMemo } from "react";

import type { InvoiceFormValues } from "../../lib/billing";
import type { InvoiceValidationResult } from "../../lib/billing/invoice-validation";
import { getSharedClientRepository } from "../../lib/clients";
import { getSharedMatterRepository } from "../../lib/matters";
import { getSharedTimeEntryRepository } from "../../lib/time";

export interface InvoiceFormFieldsProps {
  readonly values: InvoiceFormValues;
  readonly errors: InvoiceValidationResult["errors"];
  readonly onChange: (field: keyof InvoiceFormValues, value: string) => void;
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

export function InvoiceFormFields({
  values,
  errors,
  onChange,
}: InvoiceFormFieldsProps) {
  const clients = getSharedClientRepository().list();
  const matters = getSharedMatterRepository().list();
  const timeEntries = useMemo(
    () =>
      values.matterId
        ? getSharedTimeEntryRepository().list({
            matterId: values.matterId,
            billableFilter: "billable",
          })
        : [],
    [values.matterId],
  );

  const selectedIds = new Set(
    values.timeEntryIds
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean),
  );

  function handleMatterChange(matterId: string) {
    onChange("matterId", matterId);
    onChange("timeEntryIds", "");
    const matter = getSharedMatterRepository().getById(matterId);
    if (matter) {
      onChange("clientId", matter.clientId);
    }
  }

  function toggleTimeEntry(timeEntryId: string) {
    const next = new Set(selectedIds);
    if (next.has(timeEntryId)) {
      next.delete(timeEntryId);
    } else {
      next.add(timeEntryId);
    }
    onChange("timeEntryIds", [...next].join(","));
  }

  return (
    <div className="grid gap-6 md:grid-cols-2" data-testid="invoice-form-fields">
      <div>
        <FieldLabel htmlFor="invoiceReference">Invoice reference</FieldLabel>
        <Input
          id="invoiceReference"
          value={values.invoiceReference}
          onChange={(event) => onChange("invoiceReference", event.target.value)}
          placeholder="INV-2026-000001"
        />
        <FieldError message={errors.invoiceReference} />
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
          <option value="">Select client</option>
          {clients.map((client) => (
            <option key={client.clientId} value={client.clientId}>
              {client.displayName}
            </option>
          ))}
        </select>
        <FieldError message={errors.clientId} />
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
        <FieldLabel htmlFor="issueDate" required>
          Issue date
        </FieldLabel>
        <Input
          id="issueDate"
          type="date"
          value={values.issueDate}
          onChange={(event) => onChange("issueDate", event.target.value)}
        />
        <FieldError message={errors.issueDate} />
      </div>

      <div>
        <FieldLabel htmlFor="dueDate" required>
          Due date
        </FieldLabel>
        <Input
          id="dueDate"
          type="date"
          value={values.dueDate}
          onChange={(event) => onChange("dueDate", event.target.value)}
        />
        <FieldError message={errors.dueDate} />
      </div>

      <div>
        <FieldLabel htmlFor="expensesPlaceholder">Expenses (placeholder)</FieldLabel>
        <Input
          id="expensesPlaceholder"
          type="number"
          min="0"
          step="0.01"
          value={values.expensesPlaceholder}
          onChange={(event) => onChange("expensesPlaceholder", event.target.value)}
        />
        <FieldError message={errors.expensesPlaceholder} />
      </div>

      <div>
        <FieldLabel htmlFor="disbursementsPlaceholder">
          Disbursements (placeholder)
        </FieldLabel>
        <Input
          id="disbursementsPlaceholder"
          type="number"
          min="0"
          step="0.01"
          value={values.disbursementsPlaceholder}
          onChange={(event) => onChange("disbursementsPlaceholder", event.target.value)}
        />
        <FieldError message={errors.disbursementsPlaceholder} />
      </div>

      <div className="md:col-span-2">
        <FieldLabel htmlFor="notes">Notes</FieldLabel>
        <Input
          id="notes"
          value={values.notes}
          onChange={(event) => onChange("notes", event.target.value)}
        />
      </div>

      <div className="md:col-span-2">
        <FieldLabel htmlFor="timeEntryIds" required>
          Time entries
        </FieldLabel>
        <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-[var(--color-border)] p-3">
          {timeEntries.length === 0 ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Select a matter to choose billable time entries.
            </p>
          ) : (
            timeEntries.map((entry) => (
              <label key={entry.timeEntryId} className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedIds.has(entry.timeEntryId)}
                  onChange={() => toggleTimeEntry(entry.timeEntryId)}
                />
                <span>
                  {entry.timeEntryReference} — {entry.narrative}
                </span>
              </label>
            ))
          )}
        </div>
        <FieldError message={errors.timeEntryIds} />
      </div>
    </div>
  );
}
