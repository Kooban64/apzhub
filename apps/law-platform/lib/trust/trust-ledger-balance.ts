import { TRUST_LEDGER_ERROR_CODES, TrustLedgerError } from "./trust-ledger-errors";
import {
  TRUST_CHART_ACCOUNT_CODES,
  type TrustBalance,
  type TrustBalanceScope,
  type TrustJournalEntry,
  type TrustPosting,
} from "./trust-ledger-types";

function balanceKey(
  tenantId: string,
  trustAccountId: string,
  scope: TrustBalanceScope,
  clientId?: string,
  matterId?: string,
): string {
  return [tenantId, trustAccountId, scope, clientId ?? "", matterId ?? ""].join("|");
}

function isLiabilityAccount(code: string): boolean {
  return (
    code === TRUST_CHART_ACCOUNT_CODES.TRUST_LIABILITY_CLIENT ||
    code === TRUST_CHART_ACCOUNT_CODES.TRUST_LIABILITY_MATTER
  );
}

function lineDelta(
  line: TrustPosting,
  scope: TrustBalanceScope,
  clientId?: string,
  matterId?: string,
): number | null {
  if (
    scope === "account" &&
    line.accountCode === TRUST_CHART_ACCOUNT_CODES.TRUST_CASH
  ) {
    return line.side === "debit" ? line.amount : -line.amount;
  }

  if (
    scope === "client" &&
    line.accountCode === TRUST_CHART_ACCOUNT_CODES.TRUST_LIABILITY_CLIENT &&
    line.clientId === clientId
  ) {
    return line.side === "credit" ? line.amount : -line.amount;
  }

  if (
    scope === "matter" &&
    line.accountCode === TRUST_CHART_ACCOUNT_CODES.TRUST_LIABILITY_MATTER &&
    line.matterId === matterId
  ) {
    return line.side === "credit" ? line.amount : -line.amount;
  }

  return null;
}

export function computeBalanceFromJournal(
  entries: readonly TrustJournalEntry[],
  options: {
    readonly tenantId: string;
    readonly trustAccountId: string;
    readonly currency: string;
    readonly scope: TrustBalanceScope;
    readonly clientId?: string;
    readonly matterId?: string;
  },
): TrustBalance | undefined {
  const { tenantId, trustAccountId, currency, scope, clientId, matterId } = options;

  let balanceAmount = 0;
  let lastJournalEntryId = "";
  let asOfDate = "";

  for (const entry of entries) {
    if (entry.tenantId !== tenantId || entry.trustAccountId !== trustAccountId) {
      continue;
    }

    for (const line of entry.lines) {
      if (scope === "client" && line.clientId !== clientId) {
        continue;
      }
      if (scope === "matter" && line.matterId !== matterId) {
        continue;
      }

      const delta = lineDelta(line, scope, clientId, matterId);
      if (delta === null) {
        continue;
      }

      balanceAmount += delta;
    }

    lastJournalEntryId = entry.journalEntryId;
    asOfDate = entry.postedAt;
  }

  if (lastJournalEntryId.length === 0) {
    return undefined;
  }

  return {
    scope,
    tenantId,
    trustAccountId,
    clientId,
    matterId,
    balanceAmount,
    currency,
    asOfDate,
    lastJournalEntryId,
  };
}

export function computeAllBalances(
  entries: readonly TrustJournalEntry[],
  options: {
    readonly tenantId: string;
    readonly trustAccountId: string;
    readonly currency: string;
  },
): TrustBalance[] {
  const balances: TrustBalance[] = [];

  const accountBalance = computeBalanceFromJournal(entries, {
    ...options,
    scope: "account",
  });
  if (accountBalance) {
    balances.push(accountBalance);
  }

  const clientIds = new Set<string>();
  const matterKeys = new Set<string>();

  for (const entry of entries) {
    for (const line of entry.lines) {
      if (isLiabilityAccount(line.accountCode) && line.clientId) {
        clientIds.add(line.clientId);
      }
      if (
        line.accountCode === TRUST_CHART_ACCOUNT_CODES.TRUST_LIABILITY_MATTER &&
        line.matterId
      ) {
        matterKeys.add(`${line.clientId ?? ""}:${line.matterId}`);
      }
    }
  }

  for (const clientId of clientIds) {
    const clientBalance = computeBalanceFromJournal(entries, {
      ...options,
      scope: "client",
      clientId,
    });
    if (clientBalance) {
      balances.push(clientBalance);
    }
  }

  for (const key of matterKeys) {
    const [clientId, matterId] = key.split(":");
    if (!matterId) {
      continue;
    }
    const matterBalance = computeBalanceFromJournal(entries, {
      ...options,
      scope: "matter",
      clientId: clientId || undefined,
      matterId,
    });
    if (matterBalance) {
      balances.push(matterBalance);
    }
  }

  return balances;
}

export function getAvailableBalance(
  balances: readonly TrustBalance[],
  options: {
    readonly tenantId: string;
    readonly trustAccountId: string;
    readonly clientId: string;
    readonly matterId?: string;
  },
): number {
  const scope: TrustBalanceScope = options.matterId ? "matter" : "client";
  const match = balances.find(
    (balance) =>
      balance.tenantId === options.tenantId &&
      balance.trustAccountId === options.trustAccountId &&
      balance.scope === scope &&
      balance.clientId === options.clientId &&
      (scope === "client" || balance.matterId === options.matterId),
  );

  return match?.balanceAmount ?? 0;
}

export { balanceKey };

export function assertSufficientBalance(available: number, amount: number): void {
  if (available < amount) {
    throw new TrustLedgerError(
      TRUST_LEDGER_ERROR_CODES.TRUST_INSUFFICIENT_BALANCE,
      `Insufficient trust balance: available ${available}, requested ${amount}`,
    );
  }
}
