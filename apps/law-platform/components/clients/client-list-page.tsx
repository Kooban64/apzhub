"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  LawEmptyState,
  LawFilterBar,
  LawListPageLayout,
  LawPageHeader,
  LawPageHeaderButton,
  LawPagination,
  LawSearchBar,
  LawTableLoadingSkeleton,
} from "../ux";
import { downloadCsv } from "../../lib/ux/export-csv";
import { ClientContextPanel } from "./client-context-panel";
import { ClientListTable } from "./client-list-table";
import { useClientWorkflow } from "../../lib/clients/client-workflow-context";
import {
  CLIENT_STATUSES,
  CLIENT_TYPES,
  clientCreateRoute,
  clientDetailRoute,
  getSharedClientRepository,
  type Client,
  type ClientStatus,
  type ClientType,
} from "../../lib/clients";

const PAGE_SIZE = 10;

export interface ClientListPageProps {
  readonly initialQuery?: string;
}

/** Client list page — LawListPageLayout with workflow search (LAW-002-03). */
export function ClientListPage({ initialQuery = "" }: ClientListPageProps) {
  const router = useRouter();
  const workflow = useClientWorkflow();
  const repository = getSharedClientRepository();
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<ClientStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ClientType | "all">("all");
  const [page, setPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>();

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, typeFilter]);

  useEffect(() => {
    if (loading) {
      return;
    }

    const timer = window.setTimeout(() => {
      workflow.searchClients({
        query,
        status: statusFilter,
        clientType: typeFilter,
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [loading, query, statusFilter, typeFilter, workflow]);

  const filteredClients = useMemo(
    () =>
      repository.list({
        query,
        status: statusFilter,
        clientType: typeFilter,
      }),
    [repository, query, statusFilter, typeFilter],
  );

  const pageCount = Math.max(1, Math.ceil(filteredClients.length / PAGE_SIZE));
  const pageClients = filteredClients.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectClassName =
    "h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm";

  return (
    <LawListPageLayout
      header={
        <LawPageHeader
          eyebrow="Client Management"
          title="Clients"
          subtitle="Browse and search the firm client directory. Data is in-memory only for UX validation."
          primaryAction={
            <LawPageHeaderButton onClick={() => router.push(clientCreateRoute())}>
              Create Client
            </LawPageHeaderButton>
          }
        />
      }
      toolbar={
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setQuery("")}
          >
            Clear search
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              downloadCsv(
                "clients-export",
                ["Reference", "Display Name", "Type", "Status", "Tags"],
                filteredClients.map((client) => [
                  client.clientReference,
                  client.displayName,
                  client.clientType,
                  client.status,
                  client.tags.join("; "),
                ]),
              )
            }
            data-testid="client-export-csv"
          >
            Export CSV
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => router.push(clientCreateRoute())}
            data-testid="client-toolbar-create"
          >
            New client
          </Button>
        </div>
      }
      searchArea={
        <LawSearchBar
          placeholder="Search clients by name, reference, tag, or status…"
          value={query}
          onChange={setQuery}
          data-testid="client-search-bar"
        />
      }
      filtersArea={
        <LawFilterBar label="Client filters">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-[var(--color-muted-foreground)]">Status</span>
            <select
              className={selectClassName}
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ClientStatus | "all")
              }
              data-testid="client-filter-status"
            >
              <option value="all">All statuses</option>
              {CLIENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-[var(--color-muted-foreground)]">Type</span>
            <select
              className={selectClassName}
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value as ClientType | "all")
              }
              data-testid="client-filter-type"
            >
              <option value="all">All types</option>
              {CLIENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
        </LawFilterBar>
      }
      state={
        loading ? (
          <LawTableLoadingSkeleton />
        ) : filteredClients.length === 0 ? (
          <LawEmptyState
            variant={repository.count() === 0 ? "no-clients" : "no-results"}
          />
        ) : null
      }
      table={
        loading ? (
          <div aria-hidden="true" />
        ) : (
          <ClientListTable
            clients={pageClients}
            selectedClientId={selectedClient?.clientId}
            onSelect={setSelectedClient}
            onOpen={(client) => router.push(clientDetailRoute(client.clientId))}
          />
        )
      }
      pagination={
        loading ? null : (
          <LawPagination
            page={page}
            pageCount={pageCount}
            onPrevious={() => setPage((current) => Math.max(1, current - 1))}
            onNext={() => setPage((current) => Math.min(pageCount, current + 1))}
          />
        )
      }
      contextPanel={<ClientContextPanel client={selectedClient} />}
    />
  );
}
