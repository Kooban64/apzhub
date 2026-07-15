"use client";

/**
 * Minimal global error boundary — avoids root-layout providers during
 * Next.js /_global-error prerender (known Next 16 + React 19 interaction).
 */
export default function GlobalError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <h2>Something went wrong</h2>
        <p>{error.message}</p>
        <button type="button" onClick={() => reset()}>
          Try again
        </button>
      </body>
    </html>
  );
}
