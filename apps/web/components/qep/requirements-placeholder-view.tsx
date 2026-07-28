"use client";

/**
 * APZQEP-ENG-020A — placeholder shell only. No business UI.
 */
export function RequirementsPlaceholderView() {
  return (
    <section
      data-testid="qep-requirements-placeholder"
      className="flex h-full min-h-[16rem] flex-col items-start justify-center gap-3 p-8"
    >
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Requirements
      </h1>
      <p className="text-base text-muted-foreground">Requirements Module Coming Soon</p>
      <p className="max-w-xl text-sm text-muted-foreground">
        Domain foundation is in place (APZQEP-ENG-020A). Persistence, CRUD, and
        workflows are deferred to subsequent Engineering programmes.
      </p>
    </section>
  );
}
