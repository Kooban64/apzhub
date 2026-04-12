"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DENSITIES, type DensityId } from "@/lib/theme/appearance-vocabulary";
import { useAppTheme } from "@/lib/theme/theme-provider";
import { cn } from "@/lib/utils";

const DENSITY_LABEL: Record<DensityId, string> = {
  comfortable: "Comfortable",
  compact: "Compact",
};

export function AppFooter({ versionLabel }: { versionLabel: string }) {
  const { density, setDensity } = useAppTheme();

  return (
    <footer
      className="flex h-10 shrink-0 items-center justify-between gap-3 border-t border-border bg-panel px-[var(--shell-pad)] text-xs text-muted-foreground"
      data-testid="app-footer"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span className="rounded border border-border bg-muted/40 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-foreground/80">
          Local
        </span>
        <span
          className="hidden sm:inline"
          title="Connectivity status is wired in a later milestone."
        >
          Online
        </span>
        <span className="hidden lg:inline">Tenant: not configured</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="hidden font-mono text-[0.65rem] sm:inline" data-testid="app-version">
          {versionLabel}
        </span>
        <div className="flex items-center gap-1 rounded-md border border-border bg-background/60 p-0.5">
          {DENSITIES.map((id) => (
            <Button
              key={id}
              type="button"
              variant="ghost"
              size="xs"
              className={cn(
                "h-7 px-2 text-[0.65rem]",
                density === id && "bg-muted text-foreground shadow-sm",
              )}
              onClick={() => setDensity(id)}
              aria-pressed={density === id}
              data-testid={`density-${id}`}
            >
              {DENSITY_LABEL[id]}
            </Button>
          ))}
        </div>
        <Link
          href="/profile"
          className="h-7 px-2 text-[0.65rem] font-medium text-primary underline-offset-4 hover:underline"
          data-testid="footer-profile-link"
        >
          Profile
        </Link>
        <Button type="button" variant="link" size="xs" className="h-7 px-1 text-[0.65rem]" disabled>
          Help
        </Button>
      </div>
    </footer>
  );
}
