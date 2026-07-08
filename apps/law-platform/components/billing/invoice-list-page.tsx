"use client";

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
import { InvoiceContextPanel } from "./invoice-context-panel";
import { InvoiceListTable } from "./invoice-list-table";
import { useInvoiceWorkflow } from "../../lib/billing/invoice-workflow-context";
import {
  INVOICE_STATUS_OPTIONS,
  getSharedInvoiceRepository,
  invoiceCreateRoute,
  invoiceDetailRoute,
  type ManagedInvoice,
} from "../../lib/billing";
import { getSharedMatterRepository } from "../../lib/matters";
import { getSharedClientRepository } from "../../lib/clients";

const PAGE_SIZE = 10;

export interface InvoiceListPageProps {
  readonly initialQuery?: string;
}

export function InvoiceListPage({ initialQuery = "" }: InvoiceListPageProps) {
  const router = useRouter();
  const workflow = useInvoiceWorkflow();
  const repository = getSharedInvoiceRepository();
  const matters = useMemo(() => getSharedMatterRepository().list(), []);
  const clients = useMemo(() => getSharedClientRepository().list(), []);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [matterFilter, setMatterFilter] = useState<string>("all");
  const [clientFilter, setClientFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<ManagedInvoice | undefined>();

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 250);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    const timer = window.setTimeout(() => {
      workflow.searchInvoices({
        query,
        invoiceStatus:
          statusFilter === "all"
            ? "all"
            : (statusFilter as ManagedInvoice["invoiceStatus"]),
        matterId: matterFilter,
        clientId: clientFilter,
      });
    }, 300);

    return () => window.clearTimeout(timer);
  }, [loading, query, statusFilter, matterFilter, clientFilter, workflow]);

  const filteredInvoices = useMemo(
    () =>
      repository.list({
        query,
        invoiceStatus:
          statusFilter === "all"
            ? "all"
            : (statusFilter as ManagedInvoice["invoiceStatus"]),
        matterId: matterFilter,
        clientId: clientFilter,
      }),
    [repository, query, statusFilter, matterFilter, clientFilter],
  );

  const pageCount = Math.max(1, Math.ceil(filteredInvoices.length / PAGE_SIZE));
  const pageInvoices = filteredInvoices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectClassName =
    "h-9 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 text-sm";

  return (
    <div data-testid="invoice-list-page">
      <LawListPageLayout
        header={
          <LawPageHeader
            eyebrow="Billing"
            title="Invoices"
            subtitle="Manage firm invoices aggregated from matters and time entries. In-memory only."
            primaryAction={
              <LawPageHeaderButton onClick={() => router.push(invoiceCreateRoute())}>
                Create Invoice
              </LawPageHeaderButton>
            }
          />
        }
        searchArea={
          <LawSearchBar
            placeholder="Search invoices by reference, client, matter, or status…"
            value={query}
            onChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            data-testid="invoice-search-bar"
          />
        }
        filtersArea={
          <LawFilterBar label="Invoice filters">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Status</span>
              <select
                className={selectClassName}
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(1);
                }}
              >
                {INVOICE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Client</span>
              <select
                className={selectClassName}
                value={clientFilter}
                onChange={(event) => {
                  setClientFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All clients</option>
                {clients.map((client) => (
                  <option key={client.clientId} value={client.clientId}>
                    {client.displayName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Matter</span>
              <select
                className={selectClassName}
                value={matterFilter}
                onChange={(event) => {
                  setMatterFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All matters</option>
                {matters.map((matter) => (
                  <option key={matter.matterId} value={matter.matterId}>
                    {matter.title}
                  </option>
                ))}
              </select>
            </label>
          </LawFilterBar>
        }
        table={
          loading ? (
            <LawTableLoadingSkeleton />
          ) : pageInvoices.length === 0 ? (
            <LawEmptyState variant="no-results" />
          ) : (
            <InvoiceListTable
              invoices={pageInvoices}
              selectedInvoiceId={selectedInvoice?.invoiceId}
              onSelect={setSelectedInvoice}
              onOpen={(invoice) => router.push(invoiceDetailRoute(invoice.invoiceId))}
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
        contextPanel={<InvoiceContextPanel />}
      />
    </div>
  );
}
