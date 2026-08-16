import Link from "next/link";

export default function AdminWelcomePage() {
  return (
    <div
      className="mx-auto max-w-lg px-4 py-16 sm:px-8"
      data-testid="onboarding-welcome"
    >
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
        Welcome, administrator
      </h1>
      <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
        Your organisation is ready. Invite teammates, assign products, and enter the
        workspace when you are ready — nothing traps you in a wizard.
      </p>
      <ol className="mt-8 list-decimal space-y-3 pl-5 text-sm">
        <li>Invite your team and assign product access</li>
        <li>Review products and billing</li>
        <li>Open the entitlement-aware home</li>
      </ol>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/onboarding/team"
          className="rounded-[var(--marketing-radius-control,0.5rem)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)]"
          data-testid="welcome-get-started"
        >
          Get started
        </Link>
        <Link
          href="/workspace/home"
          className="rounded-[var(--marketing-radius-control,0.5rem)] border border-[var(--color-border)] px-5 py-2.5 text-sm"
          data-testid="welcome-skip"
        >
          Skip for now
        </Link>
      </div>
    </div>
  );
}
