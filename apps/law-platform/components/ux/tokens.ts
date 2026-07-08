/** Law Platform UX spacing, typography, and colour class tokens (LAW-001-02). */
export const lawUxTokens = {
  page: "flex flex-col gap-6 p-6",
  section: "flex flex-col gap-4",
  stackSm: "flex flex-col gap-2",
  stackMd: "flex flex-col gap-4",
  row: "flex flex-wrap items-center gap-3",
  rowBetween: "flex flex-wrap items-center justify-between gap-3",
  headingDisplay: "text-2xl font-semibold text-[var(--color-foreground)]",
  headingSection: "text-lg font-semibold text-[var(--color-foreground)]",
  subtitle: "text-sm text-[var(--color-muted-foreground)]",
  label: "text-xs font-semibold uppercase tracking-[0.16em] text-[var(--law-accent)]",
  surface: "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]",
  surfaceMuted: "rounded-md bg-[var(--color-muted)]/40",
  accentBorder: "border-[var(--law-accent)]/30",
} as const;

export type LawEmptyStateVariant =
  "no-clients" | "no-matters" | "no-documents" | "no-results" | "coming-soon";

export const LAW_EMPTY_STATE_COPY: Record<
  LawEmptyStateVariant,
  { readonly title: string; readonly description: string }
> = {
  "no-clients": {
    title: "No clients yet",
    description: "Client records will appear here once Client Management is enabled.",
  },
  "no-matters": {
    title: "No matters yet",
    description:
      "Matter workspaces will appear here once Matter Management is enabled.",
  },
  "no-documents": {
    title: "No documents yet",
    description: "Documents will appear here once the Documents module is enabled.",
  },
  "no-results": {
    title: "No results found",
    description: "Try adjusting your search or filters.",
  },
  "coming-soon": {
    title: "Coming soon",
    description: "This module is part of the Law Platform roadmap.",
  },
};
