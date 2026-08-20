"use client";

import Link from "next/link";

import { QepPageShell, QepPanel } from "./qep-ui";

/**
 * M05 Verification Design — MVP authoring entry that lands Cap specification
 * and verification workbenches (WF-04/05/08) without duplicating Cap SoR.
 */
export function QepVerificationDesignRouterView() {
  return (
    <QepPageShell
      title="Verification Design"
      description="Author and review verification intent — Cap specifications & verifications are the SoR."
      breadcrumbs={["QEP", "Verification Design"]}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <QepPanel title="Test specifications">
          <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
            Design procedures and acceptance criteria as governed specifications.
          </p>
          <Link
            href="/workspace/qep/test-specifications"
            className="text-xs text-[var(--color-primary)] underline-offset-2 hover:underline"
          >
            Open Test Specifications →
          </Link>
        </QepPanel>
        <QepPanel title="Verifications">
          <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
            Review and approve verification work items linked to requirements.
          </p>
          <Link
            href="/workspace/qep/verification"
            className="text-xs text-[var(--color-primary)] underline-offset-2 hover:underline"
          >
            Open Verification workbench →
          </Link>
        </QepPanel>
        <QepPanel title="Library (suites)">
          <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
            Reusable suite catalogue — catalogue slug Verification Library aliases here.
          </p>
          <Link
            href="/workspace/qep/suites"
            className="text-xs text-[var(--color-primary)] underline-offset-2 hover:underline"
          >
            Open Suites →
          </Link>
        </QepPanel>
        <QepPanel title="Test design assist">
          <p className="mb-3 text-xs text-[var(--color-muted-foreground)]">
            Governed suggestions only — never auto-runs or certifies.
          </p>
          <Link
            href="/workspace/qep/ai-companion"
            className="text-xs text-[var(--color-primary)] underline-offset-2 hover:underline"
          >
            Open AI Quality Companion →
          </Link>
        </QepPanel>
      </div>
    </QepPageShell>
  );
}
