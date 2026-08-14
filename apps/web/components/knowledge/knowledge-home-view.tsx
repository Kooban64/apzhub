"use client";

import { Button } from "@apzhub/ui";
import { useRouter } from "next/navigation";

import { listPublishedMemory } from "@/lib/knowledge/memory-catalogue";
import {
  MEMORY_COMPANION_JOURNEY,
  MEMORY_HOME_PROMPTS,
} from "@/lib/knowledge/memory-companion-model";
import { MEMORY_TYPES } from "@/lib/knowledge/memory-types";
import {
  canAdminKnowledge,
  canViewKnowledge,
  type KnowledgePermissionSource,
} from "@/lib/knowledge/permissions";
import {
  knowledgeCompanionPath,
  knowledgeDecisionKnowledgePath,
  knowledgeDiagnosticsPath,
  knowledgeHelpPath,
  knowledgeLessonsPath,
  knowledgeLibraryPath,
  knowledgeMemoryObjectPath,
  knowledgeMemoryPath,
  knowledgeMemoryTypePath,
  knowledgeQualityPath,
  knowledgeSettingsPath,
} from "@/lib/knowledge/routes";

import { KnowledgeLiveMemoryPanel } from "./knowledge-live-memory-panel";
import { EmptyState, KNOWLEDGE_PRODUCT_NAME, PageShell } from "./knowledge-ui";

const COMPANION_LINKS = [
  {
    label: "Memory types",
    path: knowledgeMemoryPath,
    testId: "knowledge-home-link-memory",
  },
  {
    label: "Operational lessons",
    path: knowledgeLessonsPath,
    testId: "knowledge-home-link-lessons",
  },
  {
    label: "Best practice library",
    path: knowledgeLibraryPath,
    testId: "knowledge-home-link-library",
  },
  {
    label: "Decision knowledge",
    path: knowledgeDecisionKnowledgePath,
    testId: "knowledge-home-link-decision-knowledge",
  },
  {
    label: "Knowledge quality",
    path: knowledgeQualityPath,
    testId: "knowledge-home-link-quality",
  },
  {
    label: "Memory Companion",
    path: knowledgeCompanionPath,
    testId: "knowledge-home-link-companion",
  },
  {
    label: "Help",
    path: knowledgeHelpPath,
    testId: "knowledge-home-link-help",
  },
  {
    label: "Settings",
    path: knowledgeSettingsPath,
    testId: "knowledge-home-link-settings",
  },
] as const;

export function KnowledgeHomeView({
  permissions,
}: {
  readonly permissions?: KnowledgePermissionSource;
}) {
  const router = useRouter();
  const canView = canViewKnowledge(permissions);
  const isOperator = canAdminKnowledge(permissions);
  const illustrative = listPublishedMemory().slice(0, 3);

  if (!canView) {
    return (
      <PageShell title="Home" breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Home"]}>
        <EmptyState
          title="Permission required"
          description="You do not have permission to view APZ Knowledge."
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Home"
      description={`${MEMORY_COMPANION_JOURNEY}. Your Memory Companion — not a document library or search portal.`}
      breadcrumbs={[KNOWLEDGE_PRODUCT_NAME, "Home"]}
      actions={
        <Button
          type="button"
          size="sm"
          onClick={() => router.push(knowledgeCompanionPath())}
          data-testid="knowledge-home-open-companion"
        >
          How memory accompanies work
        </Button>
      }
    >
      <section data-testid="knowledge-home-onboarding">
        <h2 className="mb-2 text-sm font-semibold">
          What do I need to know to do this well?
        </h2>
        <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
          Start from organisational memory that applies to your work. You should not
          need to search a repository first — memory appears so you can act with
          confidence.
        </p>
        <div className="flex flex-wrap gap-2" data-testid="knowledge-home-links">
          {COMPANION_LINKS.map((link) => (
            <Button
              key={link.testId}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(link.path())}
              data-testid={link.testId}
            >
              {link.label}
            </Button>
          ))}
        </div>
      </section>

      <section className="mt-6" data-testid="knowledge-home-prompts">
        <h2 className="mb-2 text-sm font-semibold">Start with a memory question</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {MEMORY_HOME_PROMPTS.map((prompt) => (
            <li
              key={prompt.id}
              className="rounded-lg border border-[var(--color-border)] p-3"
              data-testid={`knowledge-home-prompt-${prompt.id}`}
            >
              <p className="text-sm font-medium">{prompt.question}</p>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                {prompt.hint}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6" data-testid="knowledge-home-types">
        <h2 className="mb-2 text-sm font-semibold">Organisational memory types</h2>
        <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
          Memory is expressed as business concepts — not articles or files.
        </p>
        <div className="flex flex-wrap gap-2">
          {MEMORY_TYPES.map((type) => (
            <Button
              key={type.key}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(knowledgeMemoryTypePath(type.key))}
              data-testid={`knowledge-home-type-${type.key}`}
            >
              {type.pluralLabel}
            </Button>
          ))}
        </div>
      </section>

      <KnowledgeLiveMemoryPanel
        title="Trusted memory in focus"
        testId="knowledge-home-live-memory"
      />

      <section className="mt-6" data-testid="knowledge-home-featured">
        <h2 className="mb-2 text-sm font-semibold">Illustrative examples</h2>
        <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
          Catalogue samples for orientation — not the System of Record.
        </p>
        <ul className="grid gap-2">
          {illustrative.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className="w-full rounded-lg border border-dashed border-[var(--color-border)] p-3 text-left hover:bg-[var(--color-accent)]/40"
                onClick={() => router.push(knowledgeMemoryObjectPath(item.id))}
                data-testid={`knowledge-home-memory-${item.id}`}
              >
                <p className="text-sm font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                  {item.summary}
                </p>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6" data-testid="knowledge-home-sor">
        <h2 className="mb-2 text-sm font-semibold">Systems of Record</h2>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Knowledge owns curated organisational memory only. It references trusted
          Systems of Record and never owns operational truth, files, governance,
          workflow state, analytics, or project data.
        </p>
      </section>

      {isOperator ? (
        <section
          className="mt-6 rounded-lg border border-dashed border-[var(--color-border)] p-4"
          data-testid="knowledge-home-operator"
        >
          <h2 className="mb-1 text-sm font-semibold">Operator note</h2>
          <p className="mb-3 text-sm text-[var(--color-muted-foreground)]">
            Content administration and diagnostics are secondary. They must not define
            the Memory Companion experience.
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(knowledgeDiagnosticsPath())}
            data-testid="knowledge-home-open-diagnostics"
          >
            Open diagnostics
          </Button>
        </section>
      ) : null}
    </PageShell>
  );
}
