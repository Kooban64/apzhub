"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * Workbench account menu — Profile / Personalisation / admin entries / Sign out.
 * Org Admin and Platform Admin appear only when authorised.
 */
export function WorkbenchAccountMenu({
  userName,
  userEmail,
  showOrgAdmin,
  showPlatformAdmin,
  onSignOut,
}: {
  readonly userName?: string;
  readonly userEmail?: string;
  readonly showOrgAdmin?: boolean;
  readonly showPlatformAdmin?: boolean;
  readonly onSignOut?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const label = userName?.trim() || userEmail?.trim() || "Account";

  return (
    <div className="relative pl-1" ref={rootRef} data-testid="workbench-account-menu">
      <button
        type="button"
        className="flex max-w-[10rem] items-center gap-1 truncate text-xs text-[var(--color-foreground)] hover:underline"
        aria-expanded={open}
        aria-haspopup="menu"
        data-testid="workbench-account-trigger"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="truncate" data-testid="workbench-user-name">
          {label}
        </span>
        <span aria-hidden className="text-[10px] text-[var(--color-muted-foreground)]">
          ▾
        </span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute top-full right-0 z-50 mt-1 min-w-56 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-lg"
          data-testid="workbench-account-dropdown"
        >
          <div className="border-b border-[var(--color-border)] px-3 py-2">
            <p className="truncate text-xs font-medium">{label}</p>
            {userEmail ? (
              <p className="truncate text-[10px] text-[var(--color-muted-foreground)]">
                {userEmail}
              </p>
            ) : null}
          </div>
          <Link
            href="/workspace/personalisation"
            role="menuitem"
            className="block px-3 py-1.5 text-xs hover:bg-[var(--color-muted)]"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <Link
            href="/workspace/personalisation"
            role="menuitem"
            className="block px-3 py-1.5 text-xs hover:bg-[var(--color-muted)]"
            onClick={() => setOpen(false)}
          >
            Personalisation
          </Link>
          <Link
            href="/workspace/notifications/inbox"
            role="menuitem"
            className="block px-3 py-1.5 text-xs hover:bg-[var(--color-muted)]"
            onClick={() => setOpen(false)}
          >
            Notifications
          </Link>
          {(showOrgAdmin || showPlatformAdmin) && (
            <div className="my-1 border-t border-[var(--color-border)]" />
          )}
          {showOrgAdmin ? (
            <Link
              href="/organisation-admin"
              role="menuitem"
              className="block px-3 py-1.5 text-xs hover:bg-[var(--color-muted)]"
              data-testid="workbench-account-org-admin"
              onClick={() => setOpen(false)}
            >
              Organisation Administration
            </Link>
          ) : null}
          {showOrgAdmin ? (
            <Link
              href="/organisation-admin/products"
              role="menuitem"
              className="block px-3 py-1.5 text-xs hover:bg-[var(--color-muted)]"
              data-testid="workbench-account-marketplace"
              onClick={() => setOpen(false)}
            >
              Marketplace
            </Link>
          ) : null}
          {showPlatformAdmin ? (
            <Link
              href="/platform-admin"
              role="menuitem"
              className="block px-3 py-1.5 text-xs hover:bg-[var(--color-muted)]"
              data-testid="workbench-account-platform-admin"
              onClick={() => setOpen(false)}
            >
              Platform Administration
            </Link>
          ) : null}
          <div className="my-1 border-t border-[var(--color-border)]" />
          {onSignOut ? (
            <button
              type="button"
              role="menuitem"
              className="block w-full px-3 py-1.5 text-left text-xs hover:bg-[var(--color-muted)]"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
            >
              Sign out
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
