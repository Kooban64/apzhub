"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "apzhub.cookie-notice.dismissed";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) !== "1") {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie notice"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 py-3 backdrop-blur"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--color-muted-foreground)]">
          We use essential cookies for authentication and preferences. See our{" "}
          <Link
            href="/legal/cookies"
            className="underline hover:text-[var(--color-foreground)]"
          >
            Cookie Policy
          </Link>
          .
        </p>
        <button
          type="button"
          className="shrink-0 rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm hover:bg-[var(--color-muted)]"
          onClick={() => {
            try {
              window.localStorage.setItem(STORAGE_KEY, "1");
            } catch {
              /* ignore */
            }
            setVisible(false);
          }}
        >
          Got it
        </button>
      </div>
    </div>
  );
}
