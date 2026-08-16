"use client";

import { useEffect, useState } from "react";

type Step = { id: string; label: string; status: string };

export function ProvisioningProgress({ className }: { readonly className?: string }) {
  const [steps, setSteps] = useState<Step[]>([]);
  const [overall, setOverall] = useState<string>("pending");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/commerce/provisioning/status");
        if (!res.ok) return;
        const body = (await res.json()) as {
          data?: { steps?: Step[]; overall?: string };
        };
        if (cancelled) return;
        setSteps(body.data?.steps ?? []);
        setOverall(body.data?.overall ?? "pending");
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (steps.length === 0) return null;

  return (
    <div className={className} data-testid="provisioning-progress" aria-live="polite">
      <p className="text-xs font-medium tracking-[0.14em] text-[var(--color-muted-foreground)] uppercase">
        Preparing your workspace · {overall}
      </p>
      <ul className="mt-3 space-y-2">
        {steps.map((step) => (
          <li key={step.id} className="flex items-center justify-between text-sm">
            <span>{step.label}</span>
            <span
              className={
                step.status === "complete"
                  ? "text-[var(--color-success)]"
                  : step.status === "failed"
                    ? "text-[var(--color-destructive)]"
                    : "text-[var(--color-muted-foreground)]"
              }
            >
              {step.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
