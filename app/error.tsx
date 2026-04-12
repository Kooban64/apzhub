"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background p-8 text-foreground">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-md text-center text-sm text-muted-foreground">{error.message}</p>
      <Button type="button" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
