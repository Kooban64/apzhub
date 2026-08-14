import type { ReactNode } from "react";

export function LegalPageShell({
  title,
  updated,
  children,
}: {
  readonly title: string;
  readonly updated: string;
  readonly children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
        Last updated: {updated}
      </p>
      <div className="prose-marketing mt-8 space-y-4 text-sm leading-relaxed text-[var(--color-foreground)]">
        {children}
      </div>
    </article>
  );
}
