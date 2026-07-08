"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import {
  LawActivityFeed,
  LawBreadcrumbs,
  LawDetailPageLayout,
  LawEmptyState,
  LawInformationCard,
  LawLinkList,
  LawPageHeader,
  LawPageHeaderButton,
  LawStatisticsCard,
  LawStatusCard,
  LawTabs,
} from "../ux";
import { ClientContextPanel } from "./client-context-panel";
import { useClientWorkflow } from "../../lib/clients/client-workflow-context";
import {
  clientEditRoute,
  clientListRoute,
  composeClientDetailSnapshot,
  getSharedClientRepository,
  type Client,
} from "../../lib/clients";

const DETAIL_TABS = [
  { id: "notes", label: "Profile" },
  { id: "matters", label: "Matters" },
  { id: "documents", label: "Documents" },
  { id: "invoices", label: "Invoices" },
  { id: "activities", label: "Activities" },
  { id: "timeline", label: "Timeline" },
] as const;

export interface ClientDetailPageProps {
  readonly clientId: string;
}

function PropertyGrid({ client }: { readonly client: Client }) {
  const entries: Array<{ label: string; value: string }> = [
    { label: "Client ID", value: client.clientId },
    { label: "Reference", value: client.clientReference },
    { label: "Display name", value: client.displayName },
    { label: "Client type", value: client.clientType },
    { label: "Status", value: client.status },
    { label: "Primary contact ID", value: client.primaryContactId ?? "—" },
    { label: "Billing address ID", value: client.billingAddressId ?? "—" },
    { label: "Tags", value: client.tags.length > 0 ? client.tags.join(", ") : "—" },
    {
      label: "Custom fields",
      value:
        Object.keys(client.customFields).length > 0
          ? Object.entries(client.customFields)
              .map(([key, value]) => `${key}=${value}`)
              .join("; ")
          : "—",
    },
  ];

  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {entries.map((entry) => (
        <div key={entry.label}>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
            {entry.label}
          </dt>
          <dd className="mt-1 text-sm text-[var(--color-foreground)]">{entry.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Client detail page — LawDetailPageLayout with workflow open/delete (LAW-002-03). */
export function ClientDetailPage({ clientId }: ClientDetailPageProps) {
  const router = useRouter();
  const workflow = useClientWorkflow();
  const repository = getSharedClientRepository();
  const client = useMemo(() => repository.getById(clientId), [repository, clientId]);
  const snapshot = useMemo(
    () => (client ? composeClientDetailSnapshot(client) : undefined),
    [client],
  );
  const [activeTab, setActiveTab] = useState<string>("notes");
  const openedClientIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!client || openedClientIdRef.current === client.clientId) {
      return;
    }

    openedClientIdRef.current = client.clientId;
    workflow.openClient(client.clientId);
  }, [client, workflow]);

  function handleDelete() {
    const result = workflow.deleteClient(clientId);
    if (result.ok) {
      router.push(clientListRoute());
    }
  }

  if (!client) {
    return (
      <LawDetailPageLayout
        header={
          <LawPageHeader
            eyebrow="Client Management"
            title="Client not found"
            subtitle="The requested client is not in the in-memory repository."
            primaryAction={
              <LawPageHeaderButton onClick={() => router.push(clientListRoute())}>
                Back to clients
              </LawPageHeaderButton>
            }
          />
        }
        properties={<LawEmptyState variant="no-results" />}
      />
    );
  }

  return (
    <LawDetailPageLayout
      header={
        <>
          <LawBreadcrumbs
            items={[
              { label: "Clients", href: clientListRoute() },
              { label: client.displayName },
            ]}
          />
          <LawPageHeader
            eyebrow="Client Management"
            title={client.displayName}
            subtitle={client.clientReference}
            primaryAction={
              <LawPageHeaderButton
                onClick={() => router.push(clientEditRoute(client.clientId))}
              >
                Edit Client
              </LawPageHeaderButton>
            }
            secondaryActions={
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(clientListRoute())}
                >
                  Back to list
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDelete}
                  data-testid="client-delete-button"
                >
                  Delete Client
                </Button>
              </>
            }
          />
        </>
      }
      summaryCards={
        <>
          <LawStatisticsCard
            label="Matters"
            value={String(snapshot?.matterCount ?? 0)}
          />
          <LawStatisticsCard
            label="Documents"
            value={String(snapshot?.documentCount ?? 0)}
          />
          <LawStatusCard
            label="Status"
            status={client.status}
            tone={client.status === "active" ? "success" : "neutral"}
          />
          <LawStatisticsCard
            label="Outstanding invoices"
            value={String(snapshot?.outstandingInvoiceCount ?? 0)}
          />
        </>
      }
      tabs={
        <>
          <LawTabs items={DETAIL_TABS} activeId={activeTab} onChange={setActiveTab} />
          {activeTab === "notes" ? (
            <LawInformationCard title="Client profile">
              <dl className="grid gap-3 sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Organisation
                  </dt>
                  <dd className="mt-1 text-sm">{snapshot?.organisationLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Primary contact
                  </dt>
                  <dd className="mt-1 text-sm">{snapshot?.primaryContactLabel}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    Tags
                  </dt>
                  <dd className="mt-1 text-sm">
                    {client.tags.length > 0 ? client.tags.join(", ") : "—"}
                  </dd>
                </div>
              </dl>
            </LawInformationCard>
          ) : null}
          {activeTab === "matters" ? (
            <LawInformationCard
              title={`Related matters (${snapshot?.matterCount ?? 0})`}
            >
              <LawLinkList
                items={snapshot?.relatedMatters ?? []}
                emptyLabel="No matters linked to this client."
                testId="client-related-matters"
              />
            </LawInformationCard>
          ) : null}
          {activeTab === "documents" ? (
            <LawInformationCard title={`Documents (${snapshot?.documentCount ?? 0})`}>
              <LawLinkList
                items={snapshot?.relatedDocuments ?? []}
                emptyLabel="No documents linked to this client."
                testId="client-related-documents"
              />
            </LawInformationCard>
          ) : null}
          {activeTab === "invoices" ? (
            <LawInformationCard
              title={`Outstanding invoices (${snapshot?.outstandingInvoiceCount ?? 0})`}
            >
              <LawLinkList
                items={snapshot?.relatedInvoices ?? []}
                emptyLabel="No outstanding invoices for this client."
                testId="client-related-invoices"
              />
            </LawInformationCard>
          ) : null}
          {activeTab === "activities" ? (
            <LawActivityFeed title="Client activity" limit={8} />
          ) : null}
          {activeTab === "timeline" ? (
            <LawActivityFeed title="Client timeline" limit={12} />
          ) : null}
        </>
      }
      properties={
        <LawInformationCard title="Properties">
          <PropertyGrid client={client} />
        </LawInformationCard>
      }
      timeline={<LawActivityFeed title="Recent timeline" limit={6} />}
      documents={
        <LawInformationCard title="Recent documents">
          <LawLinkList
            items={snapshot?.relatedDocuments ?? []}
            emptyLabel="No documents for this client."
          />
        </LawInformationCard>
      }
      activity={<LawActivityFeed title="Recent activity" limit={5} />}
      contextPanel={<ClientContextPanel client={client} />}
    />
  );
}
