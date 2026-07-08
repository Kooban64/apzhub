import type { TrustAllocation } from "./trust-allocation-types";
import {
  computeClientAllocatedBalance,
  computeMatterAllocatedBalance,
  signedAllocationAmount,
} from "./trust-allocation-balance";
import type {
  TrustInterestAccrualLine,
  TrustInterestAccrualMethod,
  TrustInterestBalanceProjection,
  TrustInterestRule,
} from "./trust-interest-types";
import { createTrustId } from "./trust-id";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface TrustInterestEngineInput {
  readonly rule: TrustInterestRule;
  readonly trustAccountId: string;
  readonly currency: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly allocations: readonly TrustAllocation[];
}

export interface TrustInterestEngineOutput {
  readonly lineItems: readonly TrustInterestAccrualLine[];
  readonly totalInterestAmount: number;
}

function parseIsoDate(value: string): Date {
  const parts = value.split("-").map(Number);
  const year = parts[0] ?? 0;
  const month = parts[1] ?? 1;
  const day = parts[2] ?? 1;
  return new Date(Date.UTC(year, month - 1, day));
}

export function countDaysInclusive(start: string, end: string): number {
  const startDate = parseIsoDate(start);
  const endDate = parseIsoDate(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  if (diffMs < 0) {
    return 0;
  }
  return Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1;
}

export function countMonthsInclusive(start: string, end: string): number {
  const startDate = parseIsoDate(start);
  const endDate = parseIsoDate(end);
  if (endDate < startDate) {
    return 0;
  }
  return (
    (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
    (endDate.getUTCMonth() - startDate.getUTCMonth()) +
    1
  );
}

export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/** Computes interest for a principal balance using the active rule policy. */
export function calculateInterestAmount(options: {
  readonly principalBalance: number;
  readonly annualRatePercent: number;
  readonly accrualMethod: TrustInterestAccrualMethod;
  readonly periodStart: string;
  readonly periodEnd: string;
}): number {
  const { principalBalance, annualRatePercent, accrualMethod, periodStart, periodEnd } =
    options;

  if (principalBalance <= 0 || annualRatePercent <= 0) {
    return 0;
  }

  const rate = annualRatePercent / 100;

  if (accrualMethod === "simple_daily") {
    const days = countDaysInclusive(periodStart, periodEnd);
    return roundCurrency(principalBalance * rate * (days / 365));
  }

  const months = countMonthsInclusive(periodStart, periodEnd);
  return roundCurrency(principalBalance * rate * (months / 12));
}

/** Collects positive client and matter allocation balances for accrual. */
export function collectInterestBalanceProjections(
  allocations: readonly TrustAllocation[],
  tenantId: string,
  trustAccountId: string,
  currency: string,
): readonly TrustInterestBalanceProjection[] {
  const matterKeys = new Map<string, { clientId: string; matterId: string }>();
  const clientOnlyKeys = new Set<string>();

  for (const allocation of allocations) {
    if (
      allocation.tenantId !== tenantId ||
      allocation.trustAccountId !== trustAccountId
    ) {
      continue;
    }
    if (allocation.matterId) {
      matterKeys.set(`${allocation.clientId}::${allocation.matterId}`, {
        clientId: allocation.clientId,
        matterId: allocation.matterId,
      });
    } else if (
      allocation.allocationType === "client" ||
      allocation.allocationType === "unallocated"
    ) {
      clientOnlyKeys.add(allocation.clientId);
    }
  }

  const projections: TrustInterestBalanceProjection[] = [];

  for (const { clientId, matterId } of matterKeys.values()) {
    const balance = computeMatterAllocatedBalance(
      allocations,
      tenantId,
      trustAccountId,
      clientId,
      matterId,
      currency,
    );
    if (balance.balanceAmount > 0) {
      projections.push({
        tenantId,
        trustAccountId,
        clientId,
        matterId,
        scope: "matter",
        principalBalance: balance.balanceAmount,
        currency,
      });
    }
  }

  for (const clientId of clientOnlyKeys) {
    const hasMatterProjection = projections.some((item) => item.clientId === clientId);
    if (hasMatterProjection) {
      continue;
    }
    const balance = computeClientAllocatedBalance(
      allocations,
      tenantId,
      trustAccountId,
      clientId,
      currency,
    );
    if (balance.balanceAmount > 0) {
      projections.push({
        tenantId,
        trustAccountId,
        clientId,
        scope: "client",
        principalBalance: balance.balanceAmount,
        currency,
      });
    }
  }

  return projections.sort((a, b) => {
    const clientCompare = a.clientId.localeCompare(b.clientId);
    if (clientCompare !== 0) {
      return clientCompare;
    }
    return (a.matterId ?? "").localeCompare(b.matterId ?? "");
  });
}

/** Pure interest accrual engine (LAW-015-06). */
export function runTrustInterestAccrual(
  input: TrustInterestEngineInput,
): TrustInterestEngineOutput {
  const minimumBalance = input.rule.minimumBalance ?? 0;
  const projections = collectInterestBalanceProjections(
    input.allocations,
    input.rule.tenantId,
    input.trustAccountId,
    input.currency,
  );

  const lineItems: TrustInterestAccrualLine[] = [];

  for (const projection of projections) {
    if (projection.principalBalance < minimumBalance) {
      continue;
    }

    const interestAmount = calculateInterestAmount({
      principalBalance: projection.principalBalance,
      annualRatePercent: input.rule.annualRatePercent,
      accrualMethod: input.rule.accrualMethod,
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
    });

    if (interestAmount <= 0) {
      continue;
    }

    lineItems.push({
      lineId: createTrustId("int"),
      clientId: projection.clientId,
      matterId: projection.matterId,
      principalBalance: projection.principalBalance,
      interestAmount,
      currency: projection.currency,
    });
  }

  const totalInterestAmount = roundCurrency(
    lineItems.reduce((sum, line) => sum + line.interestAmount, 0),
  );

  return { lineItems, totalInterestAmount };
}

export function validateInterestPeriod(
  periodStart: string,
  periodEnd: string,
): boolean {
  if (!ISO_DATE_PATTERN.test(periodStart) || !ISO_DATE_PATTERN.test(periodEnd)) {
    return false;
  }
  return parseIsoDate(periodEnd) >= parseIsoDate(periodStart);
}

export function sumSignedAllocations(allocations: readonly TrustAllocation[]): number {
  return allocations.reduce((sum, item) => sum + signedAllocationAmount(item), 0);
}
