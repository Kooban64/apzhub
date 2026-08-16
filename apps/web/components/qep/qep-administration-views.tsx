"use client";

import Link from "next/link";

import { useSoftProductAccess } from "@/lib/commercial/use-soft-product-access";
import { QEP_AUTOMATION_ROUTES, QEP_SCM_ROUTES } from "@/lib/qep/routes";
import { SOURCE_ROUTES } from "@/lib/source/routes";

import { QepPageShell, QepPanel, QepStatusBadge } from "./qep-ui";

const linkClass =
  "text-xs text-[var(--color-primary)] underline-offset-2 hover:underline";

/**
 * Stream 2 Q2-12 — Admin hub: providers, entitlements, Source connect, onboarding.
 * Does not duplicate IAM; deep-links Organisation / Console / Integration Centre.
 */
export function QepAdministrationRouterView() {
  const productAccess = useSoftProductAccess("qep");

  return (
    <QepPageShell
      title="Administration"
      description="QEP tenant posture — entitlements, providers, Source connect, and onboarding. IAM stays in Organisation / PermissionService."
      breadcrumbs={["QEP", "Administration"]}
    >
      <div
        className="mb-4 rounded-lg border border-[var(--color-border)] p-4"
        data-testid="qep-admin-entitlement"
      >
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-semibold">Product entitlement</h2>
          {productAccess === null ? (
            <span className="text-xs text-[var(--color-muted-foreground)]">
              Checking…
            </span>
          ) : (
            <QepStatusBadge
              status={productAccess.status === "allowed" ? "ready" : "blocked"}
            />
          )}
        </div>
        <p className="mb-2 text-xs text-[var(--color-muted-foreground)]">
          {productAccess === null
            ? "Resolving QEP entitlement from home context…"
            : productAccess.status === "allowed"
              ? "QEP is entitled for this session (soft-gate / bootstrap open when no commercial ledger)."
              : `QEP access: ${productAccess.reason ?? "denied"} — manage subscriptions and user grants in Organisation.`}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/org/subscriptions" className={linkClass}>
            Org · Subscriptions →
          </Link>
          <Link href="/org/members" className={linkClass}>
            Org · Members & RBAC →
          </Link>
          <Link href="/org/services" className={linkClass}>
            Org · Service roles →
          </Link>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <QepPanel title="Providers & integrations">
          <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
            Automation ingest, Playwright runner, and SCM connectors. Provider names
            stay subordinate in user chrome.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/workspace/qep/integrations" className={linkClass}>
              Integration Centre →
            </Link>
            <Link href={QEP_AUTOMATION_ROUTES.home} className={linkClass}>
              Automation providers →
            </Link>
            <Link href={QEP_SCM_ROUTES.providers} className={linkClass}>
              Source providers (admin) →
            </Link>
          </div>
        </QepPanel>

        <QepPanel title="Source connect">
          <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
            Register repositories via Quality overlays; everyday browse is Shared Source
            — provider-neutral.
          </p>
          <div className="flex flex-col gap-2">
            <Link href={SOURCE_ROUTES.home} className={linkClass}>
              Open Shared Source →
            </Link>
            <Link href={QEP_SCM_ROUTES.home} className={linkClass}>
              Register / sync repositories →
            </Link>
          </div>
        </QepPanel>

        <QepPanel title="Organisation & RBAC">
          <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
            Member roles and service grants are owned by the Organisation console. QEP
            consumes PermissionService — it does not duplicate IAM.
          </p>
          <Link href="/org/members" className={linkClass}>
            Open Org · Members & RBAC →
          </Link>
        </QepPanel>

        <QepPanel title="Authentication posture">
          <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
            AuthN is BetterAuth only. APZHUB PermissionService owns roles and grants.
            Engine silent handoff is adapter work (Document 007).
          </p>
          <Link href="/ops/sessions" className={linkClass}>
            Open Ops · Sessions →
          </Link>
        </QepPanel>

        <QepPanel title="Environments & live flags">
          <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
            Live automation and secret-backed SCM credentials are ops-runbook controlled
            — see docs/operations/runbooks/qep-*.md.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/console" className={linkClass}>
              Platform Console →
            </Link>
            <Link href="/ops" className={linkClass}>
              Operations workspace →
            </Link>
          </div>
        </QepPanel>

        <QepPanel title="Audit">
          <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
            QEP-scoped audit trail and platform administration audit.
          </p>
          <Link href="/workspace/qep/audit" className={linkClass}>
            Open QEP Audit →
          </Link>
        </QepPanel>
      </div>

      <div className="mt-4" data-testid="qep-admin-onboarding">
        <QepPanel title="Onboarding checklist">
          <ol className="list-decimal space-y-2 pl-5 text-sm">
            <li>
              Confirm{" "}
              <Link href="/org/subscriptions" className={linkClass}>
                QEP entitlement
              </Link>{" "}
              for the organisation and user grants.
            </li>
            <li>
              Connect a repository in{" "}
              <Link href={QEP_SCM_ROUTES.home} className={linkClass}>
                Source admin
              </Link>{" "}
              then browse in{" "}
              <Link href={SOURCE_ROUTES.home} className={linkClass}>
                Shared Source
              </Link>
              .
            </li>
            <li>
              Verify{" "}
              <Link href="/workspace/qep/integrations" className={linkClass}>
                automation providers
              </Link>{" "}
              and optional live runner flags.
            </li>
            <li>
              Open{" "}
              <Link href="/workspace/qep/home" className={linkClass}>
                Quality Home
              </Link>{" "}
              — persona My Work should surface attention items.
            </li>
          </ol>
        </QepPanel>
      </div>
    </QepPageShell>
  );
}
