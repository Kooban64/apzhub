"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-background p-8 text-foreground antialiased">
        <h1 className="text-lg font-semibold">APZHUB hit a critical error</h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{error.message}</p>
        <button
          type="button"
          className="mt-4 rounded-md border border-border bg-muted px-3 py-1.5 text-sm"
          onClick={reset}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
