import type { KnowledgeProvider } from "@apzhub/knowledge-discovery-framework";
import type { KnowledgeContext } from "@apzhub/knowledge-discovery-framework";
import type { KnowledgeDocument } from "@apzhub/knowledge-discovery-framework";
import type { KnowledgeQuery } from "@apzhub/knowledge-discovery-framework";
import type { KnowledgeResult } from "@apzhub/knowledge-discovery-framework";
import type { KnowledgeSource } from "@apzhub/knowledge-discovery-framework";
import type { KnowledgeRegistry } from "@apzhub/knowledge-discovery-framework/server";

import { getSharedClientRepository } from "../clients/in-memory-client-repository";
import { clientDetailRoute } from "../clients/client-routes";
import { getSharedDocumentRepository } from "../documents/in-memory-document-repository";
import { documentDetailRoute } from "../documents/document-routes";
import { getSharedMatterRepository } from "../matters/in-memory-matter-repository";
import { matterDetailRoute } from "../matters/matter-routes";
import { getSharedTaskRepository } from "../tasks/in-memory-task-repository";
import { taskDetailRoute } from "../tasks/task-routes";
import { getSharedTimeEntryRepository } from "../time/in-memory-time-entry-repository";
import { timeEntryDetailRoute } from "../time/time-entry-routes";
import { getSharedCalendarEventRepository } from "../calendar/in-memory-calendar-event-repository";
import { calendarEventDetailRoute } from "../calendar/calendar-event-routes";
import { getSharedInvoiceRepository } from "../billing/in-memory-invoice-repository";
import { invoiceDetailRoute } from "../billing/invoice-routes";
import { getSharedTrustWorkbench } from "../trust/shared-trust-workbench";
import { trustDashboardRoute, trustTransactionsRoute } from "../trust/trust-routes";
import {
  buildCalendarEventSearchCriteria,
  buildClientSearchCriteria,
  buildDocumentSearchCriteria,
  buildInvoiceSearchCriteria,
  buildMatterSearchCriteria,
  buildTaskSearchCriteria,
  buildTimeEntrySearchCriteria,
  matchesLegalSearchDateRange,
  readLegalSearchFiltersFromKnowledgeQuery,
  shouldIncludeEntityType,
} from "./legal-search-provider-filters";
import { resolveLegalSearchTenantScope } from "./legal-search-tenant-scope";
import {
  LEGAL_CLIENT_SEARCH_SOURCE_ID,
  LEGAL_DOCUMENT_SEARCH_SOURCE_ID,
  LEGAL_MATTER_SEARCH_SOURCE_ID,
  LEGAL_TASK_SEARCH_SOURCE_ID,
  LEGAL_TIME_SEARCH_SOURCE_ID,
  LEGAL_CALENDAR_SEARCH_SOURCE_ID,
  LEGAL_INVOICE_SEARCH_SOURCE_ID,
  LEGAL_TRUST_SEARCH_SOURCE_ID,
} from "./legal-search-source-ids";

function buildResult(
  source: KnowledgeSource,
  documents: readonly KnowledgeDocument[],
  startedAt: number,
): KnowledgeResult {
  const durationMs = performance.now() - startedAt;

  if (documents.length === 0) {
    return {
      status: "empty",
      sourceId: source.id,
      documents: [],
      message: "No matching records in in-memory repository",
      durationMs,
    };
  }

  return {
    status: "ok",
    sourceId: source.id,
    documents,
    durationMs,
  };
}

function emptySearchWithoutTenantScope(
  source: KnowledgeSource,
  startedAt: number,
): KnowledgeResult | undefined {
  if (!resolveLegalSearchTenantScope()) {
    return buildResult(source, [], startedAt);
  }

  return undefined;
}

function createClientSearchProvider(source: KnowledgeSource): KnowledgeProvider {
  return {
    source,
    async query(
      query: KnowledgeQuery,
      _context: KnowledgeContext,
    ): Promise<KnowledgeResult> {
      const startedAt = performance.now();
      const withoutTenant = emptySearchWithoutTenantScope(source, startedAt);
      if (withoutTenant) {
        return withoutTenant;
      }

      const text = query.text?.trim() ?? "";
      const filters = readLegalSearchFiltersFromKnowledgeQuery(query);
      if (!text || !shouldIncludeEntityType(filters.entityType, "client")) {
        return buildResult(source, [], startedAt);
      }

      const repository = getSharedClientRepository();

      const documents = repository
        .list(buildClientSearchCriteria(text, filters))
        .filter((client) => {
          if (filters.clientId && client.clientId !== filters.clientId) {
            return false;
          }
          if (filters.scopeClientId && client.clientId !== filters.scopeClientId) {
            return false;
          }
          return true;
        })
        .map((client): KnowledgeDocument => ({
          documentId: `${source.id}:${client.clientId}`,
          sourceId: source.id,
          kind: "person",
          title: client.displayName,
          description: client.clientReference,
          keywords: [
            client.displayName,
            client.clientReference,
            client.status,
            ...client.tags,
          ],
          permission: "legal.client.view",
          navigation: {
            type: "workbench-route",
            target: clientDetailRoute(client.clientId),
            workspaceId: "law",
          },
          actionRef: {
            actionId: "legal.client.open",
            handlerContext: { clientId: client.clientId },
          },
          metadata: {
            entityType: "client",
            clientId: client.clientId,
            reference: client.clientReference,
            relatedLabel: client.clientType,
            status: client.status,
          },
        }));

      return buildResult(source, documents, startedAt);
    },
  };
}

function createMatterSearchProvider(source: KnowledgeSource): KnowledgeProvider {
  return {
    source,
    async query(
      query: KnowledgeQuery,
      _context: KnowledgeContext,
    ): Promise<KnowledgeResult> {
      const startedAt = performance.now();
      const withoutTenant = emptySearchWithoutTenantScope(source, startedAt);
      if (withoutTenant) {
        return withoutTenant;
      }

      const text = query.text?.trim() ?? "";
      const filters = readLegalSearchFiltersFromKnowledgeQuery(query);
      if (!text || !shouldIncludeEntityType(filters.entityType, "matter")) {
        return buildResult(source, [], startedAt);
      }

      const repository = getSharedMatterRepository();
      const clients = getSharedClientRepository();
      const scopedMatterId = filters.matterId ?? filters.scopeMatterId;

      const documents = repository
        .list(buildMatterSearchCriteria(text, filters))
        .filter((matter) => {
          if (scopedMatterId && matter.matterId !== scopedMatterId) {
            return false;
          }
          if (filters.clientId && matter.clientId !== filters.clientId) {
            return false;
          }
          if (filters.scopeClientId && matter.clientId !== filters.scopeClientId) {
            return false;
          }
          return matchesLegalSearchDateRange(matter.openedAt, filters);
        })
        .map((matter): KnowledgeDocument => {
          const clientName =
            clients.getById(matter.clientId)?.displayName ?? matter.clientId;

          return {
            documentId: `${source.id}:${matter.matterId}`,
            sourceId: source.id,
            kind: "project",
            title: matter.title,
            description: matter.matterReference,
            keywords: [
              matter.title,
              matter.matterReference,
              matter.matterStatus,
              ...matter.tags,
            ],
            permission: "legal.matter.view",
            navigation: {
              type: "workbench-route",
              target: matterDetailRoute(matter.matterId),
              workspaceId: "law",
            },
            actionRef: {
              actionId: "legal.matter.open",
              handlerContext: { matterId: matter.matterId },
            },
            metadata: {
              entityType: "matter",
              matterId: matter.matterId,
              clientId: matter.clientId,
              reference: matter.matterReference,
              relatedLabel: clientName,
              status: matter.matterStatus,
              createdAt: matter.openedAt,
            },
          };
        });

      return buildResult(source, documents, startedAt);
    },
  };
}

function createDocumentSearchProvider(source: KnowledgeSource): KnowledgeProvider {
  return {
    source,
    async query(
      query: KnowledgeQuery,
      _context: KnowledgeContext,
    ): Promise<KnowledgeResult> {
      const startedAt = performance.now();
      const withoutTenant = emptySearchWithoutTenantScope(source, startedAt);
      if (withoutTenant) {
        return withoutTenant;
      }

      const text = query.text?.trim() ?? "";
      const filters = readLegalSearchFiltersFromKnowledgeQuery(query);
      if (!text || !shouldIncludeEntityType(filters.entityType, "document")) {
        return buildResult(source, [], startedAt);
      }

      const repository = getSharedDocumentRepository();
      const matters = getSharedMatterRepository();

      const documents = repository
        .list(buildDocumentSearchCriteria(text, filters))
        .map((document): KnowledgeDocument => {
          const matterTitle =
            matters.getById(document.matterId)?.title ?? document.matterId;

          return {
            documentId: `${source.id}:${document.documentId}`,
            sourceId: source.id,
            kind: "document",
            title: document.title,
            description: document.documentReference,
            keywords: [
              document.title,
              document.documentReference,
              document.fileName,
              document.documentStatus,
              ...document.tags,
            ],
            permission: "legal.document.view",
            navigation: {
              type: "workbench-route",
              target: documentDetailRoute(document.documentId),
              workspaceId: "law",
            },
            actionRef: {
              actionId: "legal.document.open",
              handlerContext: { documentId: document.documentId },
            },
            metadata: {
              entityType: "document",
              documentId: document.documentId,
              matterId: document.matterId,
              clientId: matters.getById(document.matterId)?.clientId,
              reference: document.documentReference,
              relatedLabel: matterTitle,
              documentStatus: document.documentStatus,
              status: document.documentStatus,
            },
          };
        });

      return buildResult(source, documents, startedAt);
    },
  };
}

function createTaskSearchProvider(source: KnowledgeSource): KnowledgeProvider {
  return {
    source,
    async query(
      query: KnowledgeQuery,
      _context: KnowledgeContext,
    ): Promise<KnowledgeResult> {
      const startedAt = performance.now();
      const withoutTenant = emptySearchWithoutTenantScope(source, startedAt);
      if (withoutTenant) {
        return withoutTenant;
      }

      const text = query.text?.trim() ?? "";
      const filters = readLegalSearchFiltersFromKnowledgeQuery(query);
      if (!text || !shouldIncludeEntityType(filters.entityType, "task")) {
        return buildResult(source, [], startedAt);
      }

      const repository = getSharedTaskRepository();
      const matters = getSharedMatterRepository();

      const documents = repository
        .list(buildTaskSearchCriteria(text, filters))
        .filter((task) =>
          matchesLegalSearchDateRange(task.dueAt ?? task.createdAt, filters),
        )
        .map((task): KnowledgeDocument => {
          const matterTitle =
            matters.getById(task.matterId ?? "")?.title ?? task.matterId ?? "—";

          return {
            documentId: `${source.id}:${task.taskId}`,
            sourceId: source.id,
            kind: "custom",
            title: task.title,
            description: task.taskReference,
            keywords: [
              task.title,
              task.taskReference,
              task.taskStatus,
              task.taskPriority,
              task.assigneeUserId,
              ...task.tags,
            ],
            permission: "legal.task.view",
            navigation: {
              type: "workbench-route",
              target: taskDetailRoute(task.taskId),
              workspaceId: "law",
            },
            actionRef: {
              actionId: "legal.task.open",
              handlerContext: { taskId: task.taskId },
            },
            metadata: {
              entityType: "task",
              taskId: task.taskId,
              matterId: task.matterId,
              reference: task.taskReference,
              relatedLabel: matterTitle,
              taskStatus: task.taskStatus,
              status: task.taskStatus,
              dueAt: task.dueAt,
              createdAt: task.createdAt,
            },
          };
        });

      return buildResult(source, documents, startedAt);
    },
  };
}

function createTimeEntrySearchProvider(source: KnowledgeSource): KnowledgeProvider {
  return {
    source,
    async query(
      query: KnowledgeQuery,
      _context: KnowledgeContext,
    ): Promise<KnowledgeResult> {
      const startedAt = performance.now();
      const withoutTenant = emptySearchWithoutTenantScope(source, startedAt);
      if (withoutTenant) {
        return withoutTenant;
      }

      const text = query.text?.trim() ?? "";
      const filters = readLegalSearchFiltersFromKnowledgeQuery(query);
      if (!text || !shouldIncludeEntityType(filters.entityType, "time_entry")) {
        return buildResult(source, [], startedAt);
      }

      const repository = getSharedTimeEntryRepository();
      const matters = getSharedMatterRepository();

      const documents = repository
        .list(buildTimeEntrySearchCriteria(text, filters))
        .filter((entry) => matchesLegalSearchDateRange(entry.entryDate, filters))
        .map((entry): KnowledgeDocument => {
          const matterTitle = matters.getById(entry.matterId)?.title ?? entry.matterId;

          return {
            documentId: `${source.id}:${entry.timeEntryId}`,
            sourceId: source.id,
            kind: "custom",
            title: entry.narrative,
            description: entry.timeEntryReference,
            keywords: [
              entry.narrative,
              entry.timeEntryReference,
              entry.userId,
              entry.billingStatus,
              entry.activityCode ?? "",
            ],
            permission: "legal.time.view",
            navigation: {
              type: "workbench-route",
              target: timeEntryDetailRoute(entry.timeEntryId),
              workspaceId: "law",
            },
            actionRef: {
              actionId: "legal.time.open",
              handlerContext: { timeEntryId: entry.timeEntryId },
            },
            metadata: {
              entityType: "time_entry",
              timeEntryId: entry.timeEntryId,
              matterId: entry.matterId,
              reference: entry.timeEntryReference,
              relatedLabel: matterTitle,
              status: entry.billingStatus,
              entryDate: entry.entryDate,
            },
          };
        });

      return buildResult(source, documents, startedAt);
    },
  };
}

function createCalendarEventSearchProvider(source: KnowledgeSource): KnowledgeProvider {
  return {
    source,
    async query(
      query: KnowledgeQuery,
      _context: KnowledgeContext,
    ): Promise<KnowledgeResult> {
      const startedAt = performance.now();
      const withoutTenant = emptySearchWithoutTenantScope(source, startedAt);
      if (withoutTenant) {
        return withoutTenant;
      }

      const text = query.text?.trim() ?? "";
      const filters = readLegalSearchFiltersFromKnowledgeQuery(query);
      if (!text || !shouldIncludeEntityType(filters.entityType, "calendar_event")) {
        return buildResult(source, [], startedAt);
      }

      const repository = getSharedCalendarEventRepository();
      const matters = getSharedMatterRepository();
      const clients = getSharedClientRepository();

      const documents = repository
        .list(buildCalendarEventSearchCriteria(text, filters))
        .filter((event) => matchesLegalSearchDateRange(event.startsAt, filters))
        .map((event): KnowledgeDocument => {
          const matterTitle =
            matters.getById(event.matterId ?? "")?.title ?? event.matterId ?? "—";
          const clientName = clients.getById(event.clientId ?? "")?.displayName;

          return {
            documentId: `${source.id}:${event.calendarEventId}`,
            sourceId: source.id,
            kind: "custom",
            title: event.title,
            description: event.calendarEventReference,
            keywords: [
              event.title,
              event.calendarEventReference,
              event.eventType,
              event.calendarEventStatus,
              event.ownerUserId,
              event.location ?? "",
              event.description ?? "",
            ],
            permission: "legal.calendar.view",
            navigation: {
              type: "workbench-route",
              target: calendarEventDetailRoute(event.calendarEventId),
              workspaceId: "law",
            },
            actionRef: {
              actionId: "legal.calendar.open",
              handlerContext: { calendarEventId: event.calendarEventId },
            },
            metadata: {
              entityType: "calendar_event",
              calendarEventId: event.calendarEventId,
              matterId: event.matterId,
              clientId: event.clientId,
              reference: event.calendarEventReference,
              relatedLabel: clientName ?? matterTitle,
              status: event.calendarEventStatus,
              startsAt: event.startsAt,
              eventType: event.eventType,
            },
          };
        });

      return buildResult(source, documents, startedAt);
    },
  };
}

function createInvoiceSearchProvider(source: KnowledgeSource): KnowledgeProvider {
  return {
    source,
    async query(
      query: KnowledgeQuery,
      _context: KnowledgeContext,
    ): Promise<KnowledgeResult> {
      const startedAt = performance.now();
      const withoutTenant = emptySearchWithoutTenantScope(source, startedAt);
      if (withoutTenant) {
        return withoutTenant;
      }

      const text = query.text?.trim() ?? "";
      const filters = readLegalSearchFiltersFromKnowledgeQuery(query);
      if (!text || !shouldIncludeEntityType(filters.entityType, "invoice")) {
        return buildResult(source, [], startedAt);
      }

      const repository = getSharedInvoiceRepository();
      const matters = getSharedMatterRepository();
      const clients = getSharedClientRepository();

      const documents = repository
        .list(buildInvoiceSearchCriteria(text, filters))
        .filter((invoice) => matchesLegalSearchDateRange(invoice.issueDate, filters))
        .map((invoice): KnowledgeDocument => {
          const matterTitle = invoice.matterId
            ? (matters.getById(invoice.matterId)?.title ?? invoice.matterId)
            : "—";
          const clientName =
            clients.getById(invoice.clientId)?.displayName ?? invoice.clientId;

          return {
            documentId: `${source.id}:${invoice.invoiceId}`,
            sourceId: source.id,
            kind: "custom",
            title: invoice.invoiceReference,
            description: `${clientName} · ${matterTitle}`,
            keywords: [
              invoice.invoiceReference,
              invoice.invoiceStatus,
              clientName,
              matterTitle,
              invoice.notes ?? "",
            ],
            permission: "legal.invoice.view",
            navigation: {
              type: "workbench-route",
              target: invoiceDetailRoute(invoice.invoiceId),
              workspaceId: "law",
            },
            actionRef: {
              actionId: "legal.invoice.open",
              handlerContext: { invoiceId: invoice.invoiceId },
            },
            metadata: {
              entityType: "invoice",
              invoiceId: invoice.invoiceId,
              clientId: invoice.clientId,
              matterId: invoice.matterId,
              reference: invoice.invoiceReference,
              relatedLabel: matterTitle,
              status: invoice.invoiceStatus,
              issueDate: invoice.issueDate,
            },
          };
        });

      return buildResult(source, documents, startedAt);
    },
  };
}

function createTrustSearchProvider(source: KnowledgeSource): KnowledgeProvider {
  return {
    source,
    async query(
      query: KnowledgeQuery,
      _context: KnowledgeContext,
    ): Promise<KnowledgeResult> {
      const startedAt = performance.now();
      const withoutTenant = emptySearchWithoutTenantScope(source, startedAt);
      if (withoutTenant) {
        return withoutTenant;
      }

      const text = query.text?.trim().toLowerCase() ?? "";
      const filters = readLegalSearchFiltersFromKnowledgeQuery(query);
      if (!text) {
        return buildResult(source, [], startedAt);
      }
      if (filters.entityType && filters.entityType !== "all") {
        return buildResult(source, [], startedAt);
      }

      const bundle = getSharedTrustWorkbench();
      const accountDocuments = bundle.ledgerService
        .listAccounts(bundle.tenantId)
        .filter(
          (account) =>
            account.name.toLowerCase().includes(text) ||
            account.trustAccountCode.toLowerCase().includes(text),
        )
        .map((account): KnowledgeDocument => ({
          documentId: `${source.id}:account:${account.trustAccountId}`,
          sourceId: source.id,
          kind: "custom",
          title: account.name,
          description: account.trustAccountCode,
          keywords: [account.name, account.trustAccountCode, "trust", "account"],
          permission: "legal.trust.view",
          navigation: {
            type: "workbench-route",
            target: trustDashboardRoute(),
            workspaceId: "law",
          },
          actionRef: {
            actionId: "legal.trust.open",
            handlerContext: { trustAccountId: account.trustAccountId },
          },
          metadata: {
            entityType: "custom",
            trustAccountId: account.trustAccountId,
          },
        }));

      const transactionDocuments = bundle.ledgerService
        .listTransactions(bundle.tenantId, bundle.accountId)
        .filter(
          (transaction) =>
            transaction.transactionReference.toLowerCase().includes(text) ||
            transaction.narrative.toLowerCase().includes(text) ||
            transaction.trustTransactionType.toLowerCase().includes(text),
        )
        .map((transaction): KnowledgeDocument => ({
          documentId: `${source.id}:transaction:${transaction.trustTransactionId}`,
          sourceId: source.id,
          kind: "custom",
          title: transaction.transactionReference,
          description: `${transaction.trustTransactionType} · ${transaction.narrative}`,
          keywords: [
            transaction.transactionReference,
            transaction.trustTransactionType,
            transaction.narrative,
            "trust",
            "transaction",
          ],
          permission: "legal.trust.view",
          navigation: {
            type: "workbench-route",
            target: trustTransactionsRoute(),
            workspaceId: "law",
          },
          actionRef: {
            actionId: "legal.trust.transactions.open",
            handlerContext: { trustTransactionId: transaction.trustTransactionId },
          },
          metadata: {
            entityType: "custom",
            trustTransactionId: transaction.trustTransactionId,
          },
        }));

      return buildResult(
        source,
        [...accountDocuments, ...transactionDocuments],
        startedAt,
      );
    },
  };
}

const SEARCH_SOURCE_DEFINITIONS = [
  {
    id: LEGAL_CLIENT_SEARCH_SOURCE_ID,
    label: "Client Search Index",
    kind: "metadata-index" as const,
    tier: "T1" as const,
    priority: 11,
    permission: "legal.client.view",
    provides: ["person"] as const,
    capabilityId: "legal-clients",
    createProvider: createClientSearchProvider,
  },
  {
    id: LEGAL_MATTER_SEARCH_SOURCE_ID,
    label: "Matter Search Index",
    kind: "metadata-index" as const,
    tier: "T1" as const,
    priority: 12,
    permission: "legal.matter.view",
    provides: ["project"] as const,
    capabilityId: "legal-matters",
    createProvider: createMatterSearchProvider,
  },
  {
    id: LEGAL_DOCUMENT_SEARCH_SOURCE_ID,
    label: "Document Search Index",
    kind: "metadata-index" as const,
    tier: "T1" as const,
    priority: 13,
    permission: "legal.document.view",
    provides: ["document"] as const,
    capabilityId: "legal-documents",
    createProvider: createDocumentSearchProvider,
  },
  {
    id: LEGAL_TASK_SEARCH_SOURCE_ID,
    label: "Task Search Index",
    kind: "metadata-index" as const,
    tier: "T1" as const,
    priority: 14,
    permission: "legal.task.view",
    provides: ["custom"] as const,
    capabilityId: "legal-tasks",
    createProvider: createTaskSearchProvider,
  },
  {
    id: LEGAL_TIME_SEARCH_SOURCE_ID,
    label: "Time Entry Search Index",
    kind: "metadata-index" as const,
    tier: "T1" as const,
    priority: 15,
    permission: "legal.time.view",
    provides: ["custom"] as const,
    capabilityId: "legal-time",
    createProvider: createTimeEntrySearchProvider,
  },
  {
    id: LEGAL_CALENDAR_SEARCH_SOURCE_ID,
    label: "Calendar Event Search Index",
    kind: "metadata-index" as const,
    tier: "T1" as const,
    priority: 16,
    permission: "legal.calendar.view",
    provides: ["custom"] as const,
    capabilityId: "legal-calendar",
    createProvider: createCalendarEventSearchProvider,
  },
  {
    id: LEGAL_INVOICE_SEARCH_SOURCE_ID,
    label: "Invoice Search Index",
    kind: "metadata-index" as const,
    tier: "T1" as const,
    priority: 17,
    permission: "legal.invoice.view",
    provides: ["custom"] as const,
    capabilityId: "legal-billing",
    createProvider: createInvoiceSearchProvider,
  },
  {
    id: LEGAL_TRUST_SEARCH_SOURCE_ID,
    label: "Trust Search Index",
    kind: "metadata-index" as const,
    tier: "T1" as const,
    priority: 18,
    permission: "legal.trust.view",
    provides: ["custom"] as const,
    capabilityId: "legal-trust",
    createProvider: createTrustSearchProvider,
  },
] as const;

/** Registers unified legal search knowledge sources (LAW-007-01). */
export function registerLegalSearchKnowledgeSources(registry: KnowledgeRegistry): void {
  for (const definition of SEARCH_SOURCE_DEFINITIONS) {
    if (registry.hasSource(definition.id)) {
      continue;
    }

    registry.registerSource({
      id: definition.id,
      label: definition.label,
      kind: definition.kind,
      tier: definition.tier,
      priority: definition.priority,
      status: "active",
      permission: definition.permission,
      provides: definition.provides,
      version: "1.0.0",
      capabilityId: definition.capabilityId,
      origin: "manifest",
    });
  }
}

/** Registers unified legal search knowledge providers (LAW-007-01). */
export function registerLegalSearchKnowledgeProviders(
  registry: KnowledgeRegistry,
): void {
  registerLegalSearchKnowledgeSources(registry);

  for (const definition of SEARCH_SOURCE_DEFINITIONS) {
    const source = registry.getSource(definition.id);
    if (!source || registry.getProvider(definition.id)) {
      continue;
    }

    registry.registerProvider(definition.createProvider(source));
  }
}
