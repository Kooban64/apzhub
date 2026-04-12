"use client";

/**
 * Short-lived denial notice seeded from `?denied=` then stripped via `replaceState`.
 * Do not copy this URL-driven pattern for other product messaging — use flash / toast state later.
 */
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function WorkspaceDenialBanner() {
  const params = useSearchParams();
  const cleared = useRef(false);
  const [kind, setKind] = useState<"admin" | "route" | null>(null);

  useEffect(() => {
    const d = params.get("denied");
    if ((d === "admin" || d === "route") && !cleared.current) {
      cleared.current = true;
      window.history.replaceState(null, "", "/workspace");
      queueMicrotask(() => setKind(d));
    }
  }, [params]);

  if (!kind) {
    return null;
  }

  const message =
    kind === "admin"
      ? "You do not have access to Admin. Ask an administrator if you need that area."
      : "That area is not available for your account.";

  return (
    <div
      className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground"
      role="status"
      data-testid="workspace-denied-banner"
    >
      {message}
    </div>
  );
}
