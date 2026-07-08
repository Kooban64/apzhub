"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  LawBreadcrumbs,
  LawFormPageLayout,
  LawPageHeader,
  LawPageHeaderButton,
} from "../ux";
import { InvoiceFormFields } from "./invoice-form-fields";
import { useInvoiceWorkflow } from "../../lib/billing/invoice-workflow-context";
import {
  createEmptyInvoiceFormValues,
  getSharedInvoiceRepository,
  invoiceDetailRoute,
  invoiceListRoute,
  invoiceToFormValues,
  type InvoiceFormValues,
} from "../../lib/billing";
import { validateInvoiceForm } from "../../lib/billing/invoice-validation";

export interface InvoiceFormPageProps {
  readonly mode: "create" | "edit";
  readonly invoiceId?: string;
  readonly initialMatterId?: string;
  readonly initialClientId?: string;
}

export function InvoiceFormPage({
  mode,
  invoiceId,
  initialMatterId,
  initialClientId,
}: InvoiceFormPageProps) {
  const router = useRouter();
  const workflow = useInvoiceWorkflow();
  const repository = getSharedInvoiceRepository();
  const existing = useMemo(
    () => (mode === "edit" && invoiceId ? repository.getById(invoiceId) : undefined),
    [mode, invoiceId, repository],
  );

  const [values, setValues] = useState<InvoiceFormValues>(() =>
    existing
      ? invoiceToFormValues(existing)
      : createEmptyInvoiceFormValues(initialMatterId ?? "", initialClientId ?? ""),
  );

  useEffect(() => {
    if (existing) {
      setValues(invoiceToFormValues(existing));
    }
  }, [existing]);

  const validation = useMemo(() => validateInvoiceForm(values), [values]);
  const title = mode === "create" ? "Create Invoice" : "Edit Invoice";
  const subtitle =
    mode === "create"
      ? "Aggregate billable time entries into an invoice. Saved to the in-memory repository for workflow validation."
      : existing
        ? `Editing ${existing.invoiceReference}. Changes are stored in-memory only.`
        : "Invoice not found in the in-memory repository.";

  function handleFieldChange(field: keyof InvoiceFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSave() {
    const result =
      mode === "create"
        ? workflow.createInvoice(values)
        : invoiceId
          ? workflow.updateInvoice(invoiceId, values)
          : { ok: false, run: workflow.searchInvoices({}, "legal.invoice.edit").run };

    if (!result.ok || !result.invoice || Array.isArray(result.invoice)) {
      return;
    }

    router.push(invoiceDetailRoute(result.invoice.invoiceId));
  }

  function handleCancel() {
    if (mode === "edit" && invoiceId) {
      router.push(invoiceDetailRoute(invoiceId));
      return;
    }

    router.push(invoiceListRoute());
  }

  if (mode === "edit" && invoiceId && !existing) {
    return (
      <LawFormPageLayout
        header={
          <LawPageHeader
            eyebrow="Billing"
            title="Invoice not found"
            subtitle="Cannot edit an invoice that is not in the repository."
          />
        }
        sections={null}
        onCancel={() => router.push(invoiceListRoute())}
      />
    );
  }

  return (
    <div data-testid="invoice-form-page">
      <LawFormPageLayout
        header={
          <>
            <LawBreadcrumbs
              items={[
                { label: "Invoices", href: invoiceListRoute() },
                ...(existing
                  ? [
                      {
                        label: existing.invoiceReference,
                        href: invoiceDetailRoute(existing.invoiceId),
                      },
                    ]
                  : []),
                { label: title },
              ]}
            />
            <LawPageHeader
              eyebrow="Billing"
              title={title}
              subtitle={subtitle}
              primaryAction={
                <LawPageHeaderButton
                  type="button"
                  onClick={handleSave}
                  disabled={!validation.valid}
                >
                  {mode === "create" ? "Create Invoice" : "Save Invoice"}
                </LawPageHeaderButton>
              }
            />
          </>
        }
        sections={
          <InvoiceFormFields
            values={values}
            errors={validation.errors}
            onChange={handleFieldChange}
          />
        }
        validationSummary={
          validation.valid ? null : (
            <p>Resolve the highlighted fields before saving this invoice.</p>
          )
        }
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
