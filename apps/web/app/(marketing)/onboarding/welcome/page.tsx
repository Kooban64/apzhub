import Link from "next/link";

export default function AdminWelcomePage() {
  return (
    <div
      className="mx-auto max-w-lg px-4 py-16 sm:px-8"
      data-testid="onboarding-welcome"
    >
      <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
        Welcome to APZ
      </h1>
      <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
        Your workspace is ready.
      </p>
      <div className="mt-8 space-y-4 text-sm">
        <div>
          <p className="font-medium">APZPRD</p>
          <p className="text-[var(--color-muted-foreground)]">
            Productivity — access what your organisation has assigned to you
          </p>
        </div>
        <div>
          <p className="font-medium">APZQEP</p>
          <p className="text-[var(--color-muted-foreground)]">Quality Engineering</p>
        </div>
        <div>
          <p className="font-medium">APZPEN</p>
          <p className="text-[var(--color-muted-foreground)]">Security Testing</p>
        </div>
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/workspace/home"
          className="rounded-[var(--marketing-radius-control,0.5rem)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-primary-foreground)]"
          data-testid="welcome-enter-workspace"
        >
          Enter Workspace
        </Link>
        <Link
          href="/onboarding/team"
          className="rounded-[var(--marketing-radius-control,0.5rem)] border border-[var(--color-border)] px-5 py-2.5 text-sm"
          data-testid="welcome-get-started"
        >
          Invite team
        </Link>
      </div>
    </div>
  );
}
