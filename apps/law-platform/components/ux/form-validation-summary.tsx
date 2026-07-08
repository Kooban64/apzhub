export interface LawFormValidationSummaryProps {
  readonly errors: Record<string, string | undefined>;
  readonly title?: string;
}

/** Form-level validation summary for keyboard and screen-reader users (LAW-013-06). */
export function LawFormValidationSummary({
  errors,
  title = "Please correct the following before saving:",
}: LawFormValidationSummaryProps) {
  const messages = Object.entries(errors).filter((entry): entry is [string, string] =>
    Boolean(entry[1]),
  );

  if (messages.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-md border border-[var(--color-destructive)]/40 bg-[var(--color-destructive)]/10 px-4 py-3 text-sm text-[var(--color-foreground)]"
      role="alert"
      aria-live="polite"
    >
      <p className="font-medium">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {messages.map(([field, message]) => (
          <li key={field}>
            <a
              href={`#field-${field}`}
              className="text-[var(--law-accent)] hover:underline"
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
