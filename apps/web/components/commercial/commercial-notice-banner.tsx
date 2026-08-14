"use client";

/**
 * Cursor-like commercial notices — tokens only, no colour splash.
 */

export function CommercialNoticeBanner({
  dunningState,
}: {
  readonly dunningState: string;
}) {
  if (dunningState === "active" || !dunningState) return null;

  const copy: Record<string, { title: string; body: string }> = {
    notice: {
      title: "Payment notice",
      body: "We could not process a recent payment. Please update billing to avoid interruption.",
    },
    warning: {
      title: "Payment warning",
      body: "Your account still has an outstanding balance. Paid features may enter a soft-limited state soon.",
    },
    grace: {
      title: "Grace period",
      body: "You are in a grace period. Resolve outstanding invoices to keep full access.",
    },
    soft_limited: {
      title: "Soft-limited access",
      body: "New paid-capacity actions are paused. Existing data remains readable. Pay to restore.",
    },
    suspended: {
      title: "Account suspended",
      body: "Billing suspension is in effect after prior notices. Contact your organisation admin or settle invoices to restore.",
    },
    cancelled: {
      title: "Subscription cancelled",
      body: "This billing account is cancelled. You can re-subscribe from the catalogue.",
    },
  };

  const content = copy[dunningState];
  if (!content) return null;

  return (
    <div
      role="status"
      data-testid="commercial-notice-banner"
      className="mb-4 rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/40 px-4 py-3"
    >
      <p className="text-sm font-medium text-[var(--color-foreground)]">
        {content.title}
      </p>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
        {content.body}
      </p>
    </div>
  );
}
