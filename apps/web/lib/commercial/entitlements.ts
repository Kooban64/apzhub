/**
 * SPR-IAM-COMMERCIAL-001 — Entitlement grants derived from paid SKUs + dunning.
 */

import { getCatalogueSku } from "@/lib/commercial/catalogue";
import {
  composeStatement,
  isSoftLimitedOrWorse,
  listBillingAccountsForSubject,
  type DunningState,
} from "@/lib/commercial/billing-ledger";

export type EntitlementDecision =
  | { readonly allowed: true; readonly capabilities: readonly string[] }
  | {
      readonly allowed: false;
      readonly reason: "upgrade_required" | "forbidden_soft_limit" | "suspended";
      readonly dunningState?: DunningState;
      readonly missingCapability: string;
    };

const grantByAccount = new Map<string, Set<string>>();

export function resetEntitlementsForTests(): void {
  grantByAccount.clear();
}

export function grantSkuCapabilities(
  billingAccountId: string,
  skuId: string,
): readonly string[] {
  const sku = getCatalogueSku(skuId);
  if (!sku) throw new Error("entitlement.sku_unknown");
  const set = grantByAccount.get(billingAccountId) ?? new Set<string>();
  for (const capability of sku.capabilities) set.add(capability);
  grantByAccount.set(billingAccountId, set);
  return [...set];
}

export function listCapabilitiesForSubject(subjectId: string): {
  readonly capabilities: readonly string[];
  readonly dunningState: DunningState;
  readonly billingAccountId?: string;
} {
  const accounts = listBillingAccountsForSubject(subjectId);
  if (accounts.length === 0) {
    return { capabilities: [], dunningState: "active" };
  }
  const account = accounts[0]!;
  // Rehydrate from paid invoices if map empty (process restart without persist of grants)
  if (!grantByAccount.has(account.billingAccountId)) {
    const statement = composeStatement(account.billingAccountId);
    for (const invoice of statement.invoices) {
      if (invoice.status === "paid") {
        try {
          grantSkuCapabilities(account.billingAccountId, invoice.skuId);
        } catch {
          /* ignore unknown sku */
        }
      }
    }
  }
  const caps = [...(grantByAccount.get(account.billingAccountId) ?? [])];
  return {
    capabilities: caps,
    dunningState: account.dunningState,
    billingAccountId: account.billingAccountId,
  };
}

/**
 * Dual-gate helper: caller still must check RBAC separately.
 * Soft-limited accounts cannot exercise paid-capacity capabilities.
 */
export function requireEntitlement(
  subjectId: string,
  capability: string,
): EntitlementDecision {
  const { capabilities, dunningState } = listCapabilitiesForSubject(subjectId);
  if (dunningState === "suspended" || dunningState === "cancelled") {
    return {
      allowed: false,
      reason: "suspended",
      dunningState,
      missingCapability: capability,
    };
  }
  if (!capabilities.includes(capability)) {
    return {
      allowed: false,
      reason: "upgrade_required",
      dunningState,
      missingCapability: capability,
    };
  }
  if (isSoftLimitedOrWorse(dunningState) && capability.startsWith("cap.qep.")) {
    return {
      allowed: false,
      reason: "forbidden_soft_limit",
      dunningState,
      missingCapability: capability,
    };
  }
  return { allowed: true, capabilities };
}
