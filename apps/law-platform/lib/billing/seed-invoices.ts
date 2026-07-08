import type { InvoiceStatus } from "@apzhub/legal-business-core";
import { InvoiceFactory } from "@apzhub/legal-business-core";

import { SEED_MATTERS } from "../matters/seed-matters";
import { SEED_TIME_ENTRIES } from "../time/seed-time-entries";
import type { ManagedInvoice } from "./invoice-types";

function matter(index: number) {
  return SEED_MATTERS[index % SEED_MATTERS.length]!;
}

function timeEntry(index: number) {
  return SEED_TIME_ENTRIES[(index - 1) % SEED_TIME_ENTRIES.length]!;
}

function isoDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

function dueDate(daysFromIssue: number, issueDaysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - issueDaysAgo + daysFromIssue);
  return date.toISOString().slice(0, 10);
}

interface SeedConfig {
  readonly index: number;
  readonly matterIndex: number;
  readonly timeEntryIndices: readonly number[];
  readonly status: InvoiceStatus;
  readonly issueDaysAgo: number;
  readonly dueDaysFromIssue: number;
  readonly expensesPlaceholder?: number;
  readonly disbursementsPlaceholder?: number;
}

const SEED_CONFIGS: readonly SeedConfig[] = [
  {
    index: 1,
    matterIndex: 0,
    timeEntryIndices: [1, 2],
    status: "issued",
    issueDaysAgo: 5,
    dueDaysFromIssue: 30,
  },
  {
    index: 2,
    matterIndex: 0,
    timeEntryIndices: [41],
    status: "sent",
    issueDaysAgo: 10,
    dueDaysFromIssue: 30,
    expensesPlaceholder: 45,
  },
  {
    index: 3,
    matterIndex: 1,
    timeEntryIndices: [3, 4],
    status: "paid",
    issueDaysAgo: 20,
    dueDaysFromIssue: 30,
  },
  {
    index: 4,
    matterIndex: 1,
    timeEntryIndices: [37, 42],
    status: "overdue",
    issueDaysAgo: 45,
    dueDaysFromIssue: 14,
  },
  {
    index: 5,
    matterIndex: 2,
    timeEntryIndices: [5],
    status: "draft",
    issueDaysAgo: 1,
    dueDaysFromIssue: 30,
  },
  {
    index: 6,
    matterIndex: 2,
    timeEntryIndices: [6, 7],
    status: "issued",
    issueDaysAgo: 8,
    dueDaysFromIssue: 30,
    disbursementsPlaceholder: 120,
  },
  {
    index: 7,
    matterIndex: 3,
    timeEntryIndices: [8],
    status: "sent",
    issueDaysAgo: 12,
    dueDaysFromIssue: 21,
  },
  {
    index: 8,
    matterIndex: 3,
    timeEntryIndices: [39],
    status: "partially_paid",
    issueDaysAgo: 18,
    dueDaysFromIssue: 30,
  },
  {
    index: 9,
    matterIndex: 4,
    timeEntryIndices: [9, 10],
    status: "paid",
    issueDaysAgo: 25,
    dueDaysFromIssue: 30,
  },
  {
    index: 10,
    matterIndex: 4,
    timeEntryIndices: [40],
    status: "void",
    issueDaysAgo: 15,
    dueDaysFromIssue: 30,
  },
  {
    index: 11,
    matterIndex: 5,
    timeEntryIndices: [11],
    status: "issued",
    issueDaysAgo: 6,
    dueDaysFromIssue: 30,
  },
  {
    index: 12,
    matterIndex: 5,
    timeEntryIndices: [12, 13],
    status: "overdue",
    issueDaysAgo: 50,
    dueDaysFromIssue: 14,
  },
  {
    index: 13,
    matterIndex: 6,
    timeEntryIndices: [14],
    status: "draft",
    issueDaysAgo: 2,
    dueDaysFromIssue: 30,
  },
  {
    index: 14,
    matterIndex: 6,
    timeEntryIndices: [15, 16],
    status: "sent",
    issueDaysAgo: 14,
    dueDaysFromIssue: 30,
    expensesPlaceholder: 85,
  },
  {
    index: 15,
    matterIndex: 7,
    timeEntryIndices: [17],
    status: "paid",
    issueDaysAgo: 30,
    dueDaysFromIssue: 30,
  },
  {
    index: 16,
    matterIndex: 7,
    timeEntryIndices: [18, 19],
    status: "issued",
    issueDaysAgo: 7,
    dueDaysFromIssue: 30,
  },
  {
    index: 17,
    matterIndex: 8,
    timeEntryIndices: [20],
    status: "sent",
    issueDaysAgo: 11,
    dueDaysFromIssue: 21,
  },
  {
    index: 18,
    matterIndex: 8,
    timeEntryIndices: [21, 22],
    status: "overdue",
    issueDaysAgo: 40,
    dueDaysFromIssue: 14,
  },
  {
    index: 19,
    matterIndex: 9,
    timeEntryIndices: [23],
    status: "draft",
    issueDaysAgo: 0,
    dueDaysFromIssue: 30,
  },
  {
    index: 20,
    matterIndex: 9,
    timeEntryIndices: [24, 25],
    status: "paid",
    issueDaysAgo: 28,
    dueDaysFromIssue: 30,
  },
  {
    index: 21,
    matterIndex: 10,
    timeEntryIndices: [26, 27],
    status: "issued",
    issueDaysAgo: 9,
    dueDaysFromIssue: 30,
    disbursementsPlaceholder: 65,
  },
  {
    index: 22,
    matterIndex: 11,
    timeEntryIndices: [28, 29, 30],
    status: "sent",
    issueDaysAgo: 16,
    dueDaysFromIssue: 30,
    expensesPlaceholder: 150,
  },
];

function buildSeedInvoice(config: SeedConfig): ManagedInvoice {
  const selectedMatter = matter(config.matterIndex);
  const entries = config.timeEntryIndices.map((index) => timeEntry(index));
  const issueDate = isoDate(config.issueDaysAgo);

  const base = InvoiceFactory.create({
    clientId: selectedMatter.clientId,
    matterId: selectedMatter.matterId,
    issueDate,
    dueDate: dueDate(config.dueDaysFromIssue, config.issueDaysAgo),
    invoiceReference: `INV-2026-${String(config.index).padStart(6, "0")}`,
    invoiceStatus: config.status,
    expensesPlaceholder: config.expensesPlaceholder,
    disbursementsPlaceholder: config.disbursementsPlaceholder,
    lineItems: entries.map((entry) => ({
      description: entry.narrative,
      quantity: entry.durationMinutes / 60,
      unitPrice: entry.rate,
      matterId: entry.matterId,
      timeEntryId: entry.timeEntryId,
    })),
  });

  return {
    ...base,
    invoiceId: `inv1000001-0001-4000-8000-${String(config.index).padStart(12, "0")}`,
    expensesPlaceholder: config.expensesPlaceholder ?? 0,
    disbursementsPlaceholder: config.disbursementsPlaceholder ?? 0,
    notes: `Seed invoice for ${selectedMatter.title}`,
    createdAt: new Date(Date.now() - config.issueDaysAgo * 86_400_000).toISOString(),
  };
}

export const SEED_INVOICES: readonly ManagedInvoice[] =
  SEED_CONFIGS.map(buildSeedInvoice);
