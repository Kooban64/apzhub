import {
  REFERENCE_PREFIXES,
  createValidationResult,
  validateReferenceNumber,
  type ValidationResult,
} from "@apzhub/legal-business-core";

import { getSharedClientRepository } from "../clients/in-memory-client-repository";
import { getSharedMatterRepository } from "../matters/in-memory-matter-repository";
import { getSharedTimeEntryRepository } from "../time/in-memory-time-entry-repository";
import {
  parsePlaceholderAmount,
  parseTimeEntryIdsInput,
  type InvoiceFormValues,
} from "./invoice-types";

export type InvoiceValidationResult = ValidationResult;

/** Validates Billing form values for in-memory workflow (LAW-010-01). */
export function validateInvoiceForm(
  values: InvoiceFormValues,
): InvoiceValidationResult {
  const errors: Record<string, string> = {};

  if (values.clientId.trim().length === 0) {
    errors.clientId = "Client is required.";
  } else if (!getSharedClientRepository().getById(values.clientId.trim())) {
    errors.clientId = "Select a valid client from the repository.";
  }

  if (values.matterId.trim().length === 0) {
    errors.matterId = "Matter is required.";
  } else if (!getSharedMatterRepository().getById(values.matterId.trim())) {
    errors.matterId = "Select a valid matter from the repository.";
  }

  if (values.issueDate.trim().length === 0) {
    errors.issueDate = "Issue date is required.";
  }

  if (values.dueDate.trim().length === 0) {
    errors.dueDate = "Due date is required.";
  }

  if (
    values.issueDate.trim().length > 0 &&
    values.dueDate.trim().length > 0 &&
    values.dueDate < values.issueDate
  ) {
    errors.dueDate = "Due date must be on or after the issue date.";
  }

  if (
    values.invoiceReference.trim().length > 0 &&
    !validateReferenceNumber(values.invoiceReference.trim(), {
      prefix: REFERENCE_PREFIXES.invoice,
    })
  ) {
    errors.invoiceReference = "Reference must match INV-YYYY-NNNNNN.";
  }

  const timeEntryIds = parseTimeEntryIdsInput(values.timeEntryIds);
  if (timeEntryIds.length === 0) {
    errors.timeEntryIds = "Select at least one time entry for the invoice.";
  } else {
    for (const timeEntryId of timeEntryIds) {
      const entry = getSharedTimeEntryRepository().getById(timeEntryId);
      if (!entry) {
        errors.timeEntryIds = "All selected time entries must exist in the repository.";
        break;
      }
      if (entry.matterId !== values.matterId.trim()) {
        errors.timeEntryIds = "All time entries must belong to the selected matter.";
        break;
      }
    }
  }

  if (parsePlaceholderAmount(values.expensesPlaceholder) < 0) {
    errors.expensesPlaceholder = "Expenses placeholder must be zero or positive.";
  }

  if (parsePlaceholderAmount(values.disbursementsPlaceholder) < 0) {
    errors.disbursementsPlaceholder =
      "Disbursements placeholder must be zero or positive.";
  }

  return createValidationResult(errors);
}
