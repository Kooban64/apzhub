"use client";

import Link from "next/link";

import { QepPageShell, QepPanel } from "./qep-ui";

export function QepAdministrationRouterView() {
  return (
    <QepPageShell
      title="Administration"
      description="QEP tenant posture, roles, and policy entry points (M20 MVP)."
      breadcrumbs={["QEP", "Administration"]}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <QepPanel title="Organisation & RBAC">
          <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
            Member roles and service grants are owned by the Organisation console. QEP
            consumes platform PermissionService — it does not duplicate IAM.
          </p>
          <Link
            href="/org/members"
            className="text-xs text-[var(--color-primary)] underline-offset-2 hover:underline"
          >
            Open Org · Members & RBAC →
          </Link>
        </QepPanel>
        <QepPanel title="Authentication posture">
          <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
            AuthN is BetterAuth email/password sessions. APZHUB PermissionService owns
            roles and grants. Enterprise IdP / SSO and silent engine handoff are
            platform IAM follow-on (Document 007) — not configured inside QEP. Legacy
            host Authentik is coexistence-only, not the QEP login path.
          </p>
          <Link
            href="/ops/sessions"
            className="text-xs text-[var(--color-primary)] underline-offset-2 hover:underline"
          >
            Open Ops · Sessions →
          </Link>
        </QepPanel>
        <QepPanel title="Platform console">
          <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
            Superadmin catalogue, limits, and credentials live in Platform Console.
          </p>
          <Link
            href="/console"
            className="text-xs text-[var(--color-primary)] underline-offset-2 hover:underline"
          >
            Open Platform Console →
          </Link>
        </QepPanel>
        <QepPanel title="Integrations & live tools">
          <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
            Automation and SCM provider health. Live flags and Typst are ops-runbook
            controlled — see docs/operations/runbooks/qep-*.md.
          </p>
          <Link
            href="/workspace/qep/integrations"
            className="text-xs text-[var(--color-primary)] underline-offset-2 hover:underline"
          >
            Open Integration Centre →
          </Link>
        </QepPanel>
        <QepPanel title="Audit">
          <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
            QEP-scoped audit trail and platform administration audit.
          </p>
          <Link
            href="/workspace/qep/audit"
            className="text-xs text-[var(--color-primary)] underline-offset-2 hover:underline"
          >
            Open QEP Audit →
          </Link>
        </QepPanel>
      </div>
    </QepPageShell>
  );
}
