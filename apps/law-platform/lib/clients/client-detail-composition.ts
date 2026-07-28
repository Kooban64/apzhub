import { getSharedInvoiceRepository } from "../billing/in-memory-invoice-repository";
import { getSharedDocumentRepository } from "../documents/in-memory-document-repository";
import { getSharedMatterRepository } from "../matters/in-memory-matter-repository";
import {
  formatInvoiceAmount,
  invoiceDetailRoute,
  isOutstandingInvoiceStatus,
} from "../billing";
import { documentDetailRoute } from "../documents/document-routes";
import { matterWorkspaceRoute } from "../matters/matter-routes";
import type { Client } from "./client-types";

export interface ClientDetailLinkItem {
  readonly title: string;
  readonly subtitle: string;
  readonly route: string;
}

export interface ClientDetailSnapshot {
  readonly clientId: string;
  readonly displayName: string;
  readonly organisationLabel: string;
  readonly primaryContactLabel: string;
  readonly relatedMatters: readonly ClientDetailLinkItem[];
  readonly relatedDocuments: readonly ClientDetailLinkItem[];
  readonly relatedInvoices: readonly ClientDetailLinkItem[];
  readonly matterCount: number;
  readonly documentCount: number;
  readonly outstandingInvoiceCount: number;
}

/** Client CRM snapshot from existing repositories (LAW-013-04). */
export function composeClientDetailSnapshot(client: Client): ClientDetailSnapshot {
  const matters = getSharedMatterRepository()
    .list()
    .filter((matter) => matter.clientId === client.clientId);

  const matterIds = new Set(matters.map((matter) => matter.matterId));

  const documents = getSharedDocumentRepository()
    .list()
    .filter(
      (document) =>
        document.clientId === client.clientId ||
        (document.matterId ? matterIds.has(document.matterId) : false),
    );

  const invoices = getSharedInvoiceRepository()
    .list()
    .filter((invoice) => invoice.clientId === client.clientId);

  const outstanding = invoices.filter((invoice) =>
    isOutstandingInvoiceStatus(invoice.invoiceStatus),
  );

  const organisationLabel =
    client.clientType === "organisation"
      ? client.displayName
      : ((client.customFields.organisation as string | undefined) ??
        "Individual client");

  const primaryContactLabel =
    (client.customFields.primaryContact as string | undefined) ??
    client.primaryContactId ??
    "Not specified";

  return {
    clientId: client.clientId,
    displayName: client.displayName,
    organisationLabel,
    primaryContactLabel,
    matterCount: matters.length,
    documentCount: documents.length,
    outstandingInvoiceCount: outstanding.length,
    relatedMatters: matters.slice(0, 8).map((matter) => ({
      title: matter.title,
      subtitle: `${matter.matterReference} · ${matter.matterStatus}`,
      route: matterWorkspaceRoute(matter.matterId),
    })),
    relatedDocuments: documents.slice(0, 8).map((document) => ({
      title: document.title,
      subtitle: document.documentReference,
      route: documentDetailRoute(document.documentId),
    })),
    relatedInvoices: outstanding.slice(0, 8).map((invoice) => ({
      title: invoice.invoiceReference,
      subtitle: `${invoice.invoiceStatus} · ${formatInvoiceAmount(invoice.total, invoice.currency)}`,
      route: invoiceDetailRoute(invoice.invoiceId),
    })),
  };
}
