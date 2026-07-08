"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  LawBreadcrumbs,
  LawFormPageLayout,
  LawFormValidationSummary,
  LawPageHeader,
  LawSuccessDialog,
} from "../ux";
import { ClientFormFields } from "./client-form-fields";
import { useClientWorkflow } from "../../lib/clients/client-workflow-context";
import {
  clientDetailRoute,
  clientListRoute,
  clientToFormValues,
  createEmptyClientFormValues,
  getSharedClientRepository,
  validateClientForm,
  type ClientFormValues,
} from "../../lib/clients";

export interface ClientFormPageProps {
  readonly mode: "create" | "edit";
  readonly clientId?: string;
}

/** Client create/edit form — full in-memory workflow (LAW-002-03). */
export function ClientFormPage({ mode, clientId }: ClientFormPageProps) {
  const router = useRouter();
  const workflow = useClientWorkflow();
  const repository = getSharedClientRepository();
  const existingClient = useMemo(
    () => (mode === "edit" && clientId ? repository.getById(clientId) : undefined),
    [mode, clientId, repository],
  );

  const [values, setValues] = useState<ClientFormValues>(() =>
    existingClient ? clientToFormValues(existingClient) : createEmptyClientFormValues(),
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedClientId, setSavedClientId] = useState<string | undefined>();
  const validation = useMemo(() => validateClientForm(values), [values]);

  const title = mode === "create" ? "Create Client" : "Edit Client";
  const subtitle =
    mode === "create"
      ? "Complete all canonical Client fields. Saved to the in-memory repository for workflow validation."
      : existingClient
        ? `Editing ${existingClient.displayName}. Changes are stored in-memory only.`
        : "Client not found in the in-memory repository.";

  function handleFieldChange(field: keyof ClientFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function handleSave() {
    const result =
      mode === "create"
        ? workflow.createClient(values)
        : clientId
          ? workflow.updateClient(clientId, values)
          : { ok: false, run: workflow.searchClients({}, "legal.client.edit").run };

    if (!result.ok || !result.client || Array.isArray(result.client)) {
      return;
    }

    setSavedClientId(result.client.clientId);
    setShowSuccess(true);
  }

  function handleCancel() {
    if (mode === "edit" && clientId) {
      router.push(clientDetailRoute(clientId));
      return;
    }

    router.push(clientListRoute());
  }

  if (mode === "edit" && clientId && !existingClient) {
    return (
      <LawFormPageLayout
        header={
          <LawPageHeader
            eyebrow="Client Management"
            title="Client not found"
            subtitle="Cannot edit a client that is not in the in-memory repository."
          />
        }
        sections={null}
        onCancel={() => router.push(clientListRoute())}
      />
    );
  }

  return (
    <>
      <LawFormPageLayout
        header={
          <>
            <LawBreadcrumbs
              items={[
                { label: "Clients", href: clientListRoute() },
                ...(existingClient
                  ? [
                      {
                        label: existingClient.displayName,
                        href: clientDetailRoute(existingClient.clientId),
                      },
                    ]
                  : []),
                { label: title },
              ]}
            />
            <LawPageHeader
              eyebrow="Client Management"
              title={title}
              subtitle={subtitle}
            />
          </>
        }
        sections={
          <ClientFormFields
            values={values}
            errors={validation.errors}
            onChange={handleFieldChange}
          />
        }
        validationSummary={
          validation.valid ? null : (
            <LawFormValidationSummary errors={validation.errors} />
          )
        }
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <LawSuccessDialog
        open={showSuccess}
        title={mode === "create" ? "Client created" : "Client updated"}
        description="Client workflow completed. Domain event, notification, and activity placeholders were triggered."
        onClose={() => {
          setShowSuccess(false);
          if (savedClientId) {
            router.push(clientDetailRoute(savedClientId));
            return;
          }
          if (mode === "edit" && clientId) {
            router.push(clientDetailRoute(clientId));
            return;
          }
          router.push(clientListRoute());
        }}
      />
    </>
  );
}
