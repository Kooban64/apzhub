"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import { MEMORY_COMPANION_JOURNEY } from "@/lib/knowledge/memory-companion-model";
import {
  canViewKnowledge,
  type KnowledgePermissionSource,
} from "@/lib/knowledge/permissions";
import { knowledgeCompanionPath, knowledgeHomePath } from "@/lib/knowledge/routes";

import { EmptyState, KNOWLEDGE_PRODUCT_NAME, PageShell } from "./knowledge-ui";

export function KnowledgeHelpView({
  permissions,
}: {
  readonly permissions?: KnowledgePermissionSource;
}) {
  const router = useRouter();

  if (!canViewKnowledge(permissions)) {
    return (
      <PageShell title="Help" breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Help"]}>
        <EmptyState
          title="Permission required"
          description="You do not have permission to view APZ Knowledge help."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Help"
      description="How to use the Memory Companion."
      breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Help"]}
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(knowledgeHomePath())}
        >
          Home
        </Button>
      }
    >
      <div
        className="space-y-4 text-sm text-[var(--color-muted-foreground)]"
        data-testid="knowledge-help-content"
      >
        <p>
          <strong className="text-[var(--color-foreground)]">
            {MEMORY_COMPANION_JOURNEY}
          </strong>
        </p>
        <p>
          APZ Knowledge is organisational memory. Use Home to ask what you need to know,
          browse memory types for curated understanding, and open the Memory Companion
          model to see how memory accompanies other products.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Lessons, standards, procedures, guidance, rationale — not articles.</li>
          <li>Knowledge Discovery finds memory; it is not this product.</li>
          <li>Learning belongs to APZQEP. Search and AI may consume memory only.</li>
          <li>Documents remain the file SoR. Law remains the governance SoR.</li>
        </ul>
        <section
          className="rounded-lg border border-[var(--color-border)] p-4 text-[var(--color-muted-foreground)]"
          data-testid="knowledge-help-limitations"
        >
          <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
            Current limitations
          </h2>
          <p className="mt-2">
            APZ Knowledge v1.0 is honest about what is not complete. These are product
            limits — not temporary glitches.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>
              <strong className="text-[var(--color-foreground)]">
                Consumer overlays
              </strong>{" "}
              in other products are deferred — not shipped in v1.0.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">
                AI / RAG / chat
              </strong>{" "}
              are out of product identity for v1.0.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">
                Organisational memory
              </strong>{" "}
              requires a durable platform store in production — unavailable storage
              fails closed.
            </li>
            <li>
              <strong className="text-[var(--color-foreground)]">Diagnostics</strong>{" "}
              are operator surfaces — not the default Memory Companion path.
            </li>
          </ul>
        </section>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(knowledgeCompanionPath())}
          data-testid="knowledge-help-open-companion"
        >
          Open Memory Companion model
        </Button>
      </div>
    </PageShell>
  );
}
