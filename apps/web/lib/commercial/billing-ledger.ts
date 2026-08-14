/**
 * SPR-IAM-COMMERCIAL-001 — billing account ledger + Cursor-like dunning.
 */

import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type DunningState =
  | "active"
  | "notice"
  | "warning"
  | "grace"
  | "soft_limited"
  | "suspended"
  | "cancelled";

export type BillingAccountKind = "organisation" | "individual";

export type BillingAccount = {
  readonly billingAccountId: string;
  readonly kind: BillingAccountKind;
  readonly ownerId: string;
  /** organisation tenant id or personal user id */
  readonly subjectId: string;
  readonly dunningState: DunningState;
  readonly currency: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly platformOperatorOrg?: boolean;
};

export type InvoiceStatus = "draft" | "issued" | "paid" | "void" | "refunded";

export type InvoiceRecord = {
  readonly invoiceId: string;
  readonly billingAccountId: string;
  readonly skuId: string;
  readonly amountCents: number;
  readonly currency: string;
  readonly status: InvoiceStatus;
  readonly issuedAt: string;
  readonly dueAt: string;
  readonly paidAt?: string;
  readonly discountCents?: number;
  readonly creditCents?: number;
};

export type PaymentRecord = {
  readonly paymentId: string;
  readonly invoiceId: string;
  readonly billingAccountId: string;
  readonly amountCents: number;
  readonly currency: string;
  readonly provider: "payfast" | "manual";
  readonly providerRef?: string;
  readonly status: "received" | "failed" | "refunded";
  readonly createdAt: string;
};

export type RefundRecord = {
  readonly refundId: string;
  readonly invoiceId: string;
  readonly billingAccountId: string;
  readonly amountCents: number;
  readonly reason?: string;
  readonly createdAt: string;
};

export type CreditRecord = {
  readonly creditId: string;
  readonly billingAccountId: string;
  readonly amountCents: number;
  readonly reason: string;
  readonly createdAt: string;
};

type LedgerSnapshot = {
  accounts: BillingAccount[];
  invoices: InvoiceRecord[];
  payments: PaymentRecord[];
  refunds: RefundRecord[];
  credits: CreditRecord[];
};

const ledger: LedgerSnapshot = {
  accounts: [],
  invoices: [],
  payments: [],
  refunds: [],
  credits: [],
};
let hydrated = false;

const DUNNING_ORDER: readonly DunningState[] = [
  "active",
  "notice",
  "warning",
  "grace",
  "soft_limited",
  "suspended",
];

function persistEnabled(): boolean {
  if (process.env.APZHUB_QEP_LEDGER_PERSIST === "true") return true;
  if (process.env.VITEST === "true" || process.env.NODE_ENV === "test") return false;
  return true;
}

function dataDir(): string {
  const override = process.env.APZHUB_QEP_DATA_DIR?.trim();
  const cwd = process.cwd();
  const base = override
    ? override
    : cwd.endsWith("/apps/web") || cwd.endsWith("\\apps/web")
      ? join(cwd, ".data")
      : join(cwd, "apps/web/.data");
  return join(base, "commercial-billing");
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  if (!persistEnabled()) return;
  const path = join(dataDir(), "ledger.json");
  if (!existsSync(path)) return;
  try {
    const snap = JSON.parse(readFileSync(path, "utf8")) as LedgerSnapshot;
    ledger.accounts = snap.accounts ?? [];
    ledger.invoices = snap.invoices ?? [];
    ledger.payments = snap.payments ?? [];
    ledger.refunds = snap.refunds ?? [];
    ledger.credits = snap.credits ?? [];
  } catch {
    /* ignore */
  }
}

function persistAll(): void {
  if (!persistEnabled()) return;
  mkdirSync(dataDir(), { recursive: true });
  writeFileSync(
    join(dataDir(), "ledger.json"),
    JSON.stringify(ledger, null, 2),
    "utf8",
  );
}

export function resetBillingLedgerForTests(): void {
  ledger.accounts = [];
  ledger.invoices = [];
  ledger.payments = [];
  ledger.refunds = [];
  ledger.credits = [];
  hydrated = false;
}

export function ensureBillingAccount(input: {
  readonly kind: BillingAccountKind;
  readonly ownerId: string;
  readonly subjectId: string;
  readonly platformOperatorOrg?: boolean;
  readonly now?: () => Date;
}): BillingAccount {
  hydrate();
  const existing = ledger.accounts.find(
    (row) => row.kind === input.kind && row.subjectId === input.subjectId,
  );
  if (existing) return existing;
  const now = (input.now ?? (() => new Date()))().toISOString();
  const account: BillingAccount = {
    billingAccountId: `bill-${randomUUID()}`,
    kind: input.kind,
    ownerId: input.ownerId,
    subjectId: input.subjectId,
    dunningState: "active",
    currency: "ZAR",
    createdAt: now,
    updatedAt: now,
    platformOperatorOrg: input.platformOperatorOrg,
  };
  ledger.accounts.unshift(account);
  persistAll();
  return account;
}

export function getBillingAccount(
  billingAccountId: string,
): BillingAccount | undefined {
  hydrate();
  return ledger.accounts.find((row) => row.billingAccountId === billingAccountId);
}

export function listBillingAccountsForSubject(
  subjectId: string,
): readonly BillingAccount[] {
  hydrate();
  return ledger.accounts.filter((row) => row.subjectId === subjectId);
}

export function issueInvoice(input: {
  readonly billingAccountId: string;
  readonly skuId: string;
  readonly amountCents: number;
  readonly currency?: string;
  readonly discountCents?: number;
  readonly dueInDays?: number;
  readonly now?: () => Date;
}): InvoiceRecord {
  hydrate();
  const account = getBillingAccount(input.billingAccountId);
  if (!account) throw new Error("billing.account_not_found");
  const nowDate = input.now ?? (() => new Date());
  const issued = nowDate();
  const due = new Date(issued.getTime() + (input.dueInDays ?? 14) * 86_400_000);
  const invoice: InvoiceRecord = {
    invoiceId: `inv-${randomUUID()}`,
    billingAccountId: input.billingAccountId,
    skuId: input.skuId,
    amountCents: Math.max(0, input.amountCents - (input.discountCents ?? 0)),
    currency: input.currency ?? account.currency,
    status: "issued",
    issuedAt: issued.toISOString(),
    dueAt: due.toISOString(),
    discountCents: input.discountCents,
  };
  ledger.invoices.unshift(invoice);
  persistAll();
  return invoice;
}

export function listInvoices(billingAccountId: string): readonly InvoiceRecord[] {
  hydrate();
  return ledger.invoices.filter((row) => row.billingAccountId === billingAccountId);
}

export function recordPayment(input: {
  readonly invoiceId: string;
  readonly amountCents: number;
  readonly provider: "payfast" | "manual";
  readonly providerRef?: string;
  readonly status?: "received" | "failed";
  readonly now?: () => Date;
}): PaymentRecord {
  hydrate();
  const invoice = ledger.invoices.find((row) => row.invoiceId === input.invoiceId);
  if (!invoice) throw new Error("billing.invoice_not_found");
  const now = (input.now ?? (() => new Date()))().toISOString();
  const status = input.status ?? "received";
  const payment: PaymentRecord = {
    paymentId: `pay-${randomUUID()}`,
    invoiceId: invoice.invoiceId,
    billingAccountId: invoice.billingAccountId,
    amountCents: input.amountCents,
    currency: invoice.currency,
    provider: input.provider,
    providerRef: input.providerRef,
    status,
    createdAt: now,
  };
  ledger.payments.unshift(payment);
  if (status === "received") {
    const idx = ledger.invoices.findIndex((row) => row.invoiceId === invoice.invoiceId);
    ledger.invoices[idx] = {
      ...invoice,
      status: "paid",
      paidAt: now,
    };
    setDunningState(invoice.billingAccountId, "active", input.now);
  } else {
    advanceDunning(invoice.billingAccountId, input.now);
  }
  persistAll();
  return payment;
}

export function issueRefund(input: {
  readonly invoiceId: string;
  readonly amountCents: number;
  readonly reason?: string;
  readonly now?: () => Date;
}): RefundRecord {
  hydrate();
  const invoice = ledger.invoices.find((row) => row.invoiceId === input.invoiceId);
  if (!invoice) throw new Error("billing.invoice_not_found");
  const now = (input.now ?? (() => new Date()))().toISOString();
  const refund: RefundRecord = {
    refundId: `ref-${randomUUID()}`,
    invoiceId: invoice.invoiceId,
    billingAccountId: invoice.billingAccountId,
    amountCents: input.amountCents,
    reason: input.reason,
    createdAt: now,
  };
  ledger.refunds.unshift(refund);
  const idx = ledger.invoices.findIndex((row) => row.invoiceId === invoice.invoiceId);
  ledger.invoices[idx] = { ...invoice, status: "refunded" };
  persistAll();
  return refund;
}

export function applyCredit(input: {
  readonly billingAccountId: string;
  readonly amountCents: number;
  readonly reason: string;
  readonly now?: () => Date;
}): CreditRecord {
  hydrate();
  if (!getBillingAccount(input.billingAccountId)) {
    throw new Error("billing.account_not_found");
  }
  const credit: CreditRecord = {
    creditId: `crd-${randomUUID()}`,
    billingAccountId: input.billingAccountId,
    amountCents: input.amountCents,
    reason: input.reason,
    createdAt: (input.now ?? (() => new Date()))().toISOString(),
  };
  ledger.credits.unshift(credit);
  persistAll();
  return credit;
}

export function setDunningState(
  billingAccountId: string,
  state: DunningState,
  now?: () => Date,
): BillingAccount {
  hydrate();
  const index = ledger.accounts.findIndex(
    (row) => row.billingAccountId === billingAccountId,
  );
  if (index < 0) throw new Error("billing.account_not_found");
  const current = ledger.accounts[index]!;
  const updated: BillingAccount = {
    ...current,
    dunningState: state,
    updatedAt: (now ?? (() => new Date()))().toISOString(),
  };
  ledger.accounts[index] = updated;
  persistAll();
  return updated;
}

/** Advance one step — never jumps to suspended from active. */
export function advanceDunning(
  billingAccountId: string,
  now?: () => Date,
): BillingAccount {
  hydrate();
  const account = getBillingAccount(billingAccountId);
  if (!account) throw new Error("billing.account_not_found");
  const idx = DUNNING_ORDER.indexOf(account.dunningState);
  if (idx < 0 || idx >= DUNNING_ORDER.length - 1) return account;
  return setDunningState(billingAccountId, DUNNING_ORDER[idx + 1]!, now);
}

export function composeStatement(billingAccountId: string): {
  readonly account: BillingAccount;
  readonly invoices: readonly InvoiceRecord[];
  readonly payments: readonly PaymentRecord[];
  readonly refunds: readonly RefundRecord[];
  readonly credits: readonly CreditRecord[];
  readonly balanceCents: number;
} {
  hydrate();
  const account = getBillingAccount(billingAccountId);
  if (!account) throw new Error("billing.account_not_found");
  const invoices = listInvoices(billingAccountId);
  const payments = ledger.payments.filter(
    (row) => row.billingAccountId === billingAccountId,
  );
  const refunds = ledger.refunds.filter(
    (row) => row.billingAccountId === billingAccountId,
  );
  const credits = ledger.credits.filter(
    (row) => row.billingAccountId === billingAccountId,
  );
  const owed = invoices
    .filter((row) => row.status === "issued")
    .reduce((sum, row) => sum + row.amountCents, 0);
  const creditTotal = credits.reduce((sum, row) => sum + row.amountCents, 0);
  return {
    account,
    invoices,
    payments,
    refunds,
    credits,
    balanceCents: Math.max(0, owed - creditTotal),
  };
}

export function isSoftLimitedOrWorse(state: DunningState): boolean {
  return state === "soft_limited" || state === "suspended" || state === "cancelled";
}
