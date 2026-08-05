"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import {
  documentsSectionPath,
  documentsHelpPath,
  documentsSettingsPath,
} from "@/lib/documents/routes";

import { DOCUMENTS_PRODUCT_NAME, PageShell } from "./documents-ui";

/**
 * Native APZHUB help for APZ Documents — work companion framing; no engine docs.
 */
export function DocumentsHelpView() {
  const router = useRouter();

  return (
    <PageShell
      title="Help"
      description="How APZ Documents supports work inside APZHUB."
      breadcrumbs={[DOCUMENTS_PRODUCT_NAME, "Help"]}
    >
      <div className="grid gap-4 lg:grid-cols-2" data-testid="documents-help">
        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Getting started</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-[var(--color-muted-foreground)]">
            <li>
              Start from the work — a project, support request, or quality evidence.
            </li>
            <li>Attach or open the document that supports that work.</li>
            <li>Use Overview to see documents with their work context.</li>
            <li>
              Use the Enterprise Document Library when you need governed browse — not as
              your daily starting point.
            </li>
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => router.push("/workspace/projects")}
            >
              Open Projects
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(documentsSectionPath("overview"))}
            >
              Documents overview
            </Button>
          </div>
        </section>

        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Where things live</h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted-foreground)]">
            <li>
              <strong className="text-[var(--color-foreground)]">Overview</strong> —
              work-companion home for documents.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">Library</strong> —
              Enterprise Document Library (governed browse).
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">
                Relationships / Retention / Audit
              </strong>{" "}
              — governance and discoverability around documents.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">
                Help / Settings
              </strong>{" "}
              — APZHUB product guidance and preferences.
            </li>
          </ul>
        </section>

        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Documentation</h2>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            APZ Documents is an APZHUB product. It protects, organises, and governs
            enterprise documents so work elsewhere has the right records. Behaviour and
            permissions are owned by APZHUB — not by any implementation engine.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => router.push(documentsSectionPath("overview"))}
          >
            Back to Overview
          </Button>
        </section>

        <section className="rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-sm font-semibold">Need more help?</h2>
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            Contact your APZHUB administrator for organisation-specific document
            practices. Product preferences are under Settings.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(documentsSettingsPath())}
            >
              Settings
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(documentsHelpPath())}
            >
              Refresh help
            </Button>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
