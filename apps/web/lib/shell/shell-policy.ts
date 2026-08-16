/**
 * Phase G — shell policy: tenant productivity vs platform/admin chrome.
 *
 * DesktopShell = Activity Bar + Sidebar workbench (tenant staff).
 * OperatorShell = console/org/ops/finance/compliance (+ gated APZPEN layout).
 * Full visual unify is out of scope; this module is the contract.
 */

import type { DemoPersonaKind } from "@/lib/demo/demo-personas";
import type { OperatorShellId } from "@/lib/operator/shell-landing";

/** Shells that use OperatorShell chrome (not the dual-rail DesktopShell). */
export const OPERATOR_SHELL_IDS = [
  "console",
  "ops",
  "finance",
  "compliance",
  "org",
  "apzpen",
] as const satisfies readonly OperatorShellId[];

export type PlatformOperatorShellId = (typeof OPERATOR_SHELL_IDS)[number];

/** Personas that must stay on OperatorShell (redirected off DesktopShell). */
export const OPERATOR_PERSONA_KINDS = [
  "superadmin",
  "platform_admin",
  "org_admin",
  "finance",
  "compliance",
  "support",
] as const satisfies readonly DemoPersonaKind[];

export type OperatorPersonaKind = (typeof OPERATOR_PERSONA_KINDS)[number];

export function isPlatformOperatorShell(shell: OperatorShellId): boolean {
  return (OPERATOR_SHELL_IDS as readonly string[]).includes(shell);
}

export function isOperatorPersonaKind(kind: DemoPersonaKind): boolean {
  return (OPERATOR_PERSONA_KINDS as readonly string[]).includes(kind);
}

/**
 * Tenant productivity personas use DesktopShell via workbench routes.
 * Platform/admin personas (incl. platform `support`) use OperatorShell.
 * APZOR org staff use `tenant_*` kinds → DesktopShell.
 */
export function preferredShellFamily(kind: DemoPersonaKind): "desktop" | "operator" {
  if (isOperatorPersonaKind(kind)) {
    return "operator";
  }
  return "desktop";
}
