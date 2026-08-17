"use client";

import Link from "next/link";

import { PLATFORM_ADMIN_BASE } from "@/lib/platform-admin/nav";

/** Honest stub for sidebar destinations not yet unlocked by Owner. */
export function PlatformAdminSectionStub({
  title,
  description,
}: {
  readonly title: string;
  readonly description?: string;
}) {
  return (
    <div className="flex flex-col gap-3 p-4" data-testid="platform-admin-section-stub">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        <p className="text-xs text-[var(--color-muted-foreground)]">
          {description ?? "Platform Admin section"}
        </p>
      </div>
      <div className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-4 text-xs text-[var(--color-muted-foreground)]">
        <p className="font-medium text-[var(--color-foreground)]">Not configured</p>
        <p className="mt-1">
          This screen is reserved in the Platform Admin information architecture.
          Implementation starts after Owner review of Overview. No operational metrics
          are simulated here.
        </p>
        <p className="mt-3">
          <Link
            href={PLATFORM_ADMIN_BASE}
            className="text-[var(--color-primary)] hover:underline"
          >
            ← Back to Overview
          </Link>
        </p>
      </div>
    </div>
  );
}
