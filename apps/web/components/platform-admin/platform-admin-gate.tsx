"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { PLATFORM_ADMIN_PERMISSION } from "@/lib/platform-admin/nav";

type GateState =
  | { readonly status: "loading" }
  | { readonly status: "ok" }
  | { readonly status: "denied"; readonly message: string };

/**
 * Permission gate for Platform Admin — server is authoritative via overview API;
 * this prevents flashing shell chrome for unauthorised users.
 */
export function PlatformAdminGate({ children }: { readonly children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<GateState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/me/home-context", { cache: "no-store" });
        if (cancelled) return;
        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return;
        }
        if (!res.ok) {
          // Transient — still try overview (server enforces permission).
          setState({ status: "ok" });
          return;
        }
        const body = (await res.json()) as {
          data?: { permissions?: readonly string[]; kind?: string };
        };
        const perms = body.data?.permissions ?? [];
        const allowed =
          perms.includes(PLATFORM_ADMIN_PERMISSION) ||
          perms.includes("*") ||
          body.data?.kind === "superadmin" ||
          body.data?.kind === "platform_admin";
        if (!allowed) {
          setState({
            status: "denied",
            message:
              "You do not have permission to access Platform Admin (platform.nav.administration.view).",
          });
          return;
        }
        setState({ status: "ok" });
      } catch {
        if (!cancelled) setState({ status: "ok" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (state.status === "loading") {
    return (
      <div className="flex h-dvh items-center justify-center text-xs text-[var(--color-muted-foreground)]">
        Checking Platform Admin access…
      </div>
    );
  }

  if (state.status === "denied") {
    return (
      <div
        className="mx-auto flex max-w-md flex-col gap-3 p-8"
        data-testid="platform-admin-access-denied"
        role="alert"
      >
        <h1 className="text-lg font-semibold">Access denied</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">{state.message}</p>
        <a href="/login" className="text-sm text-[var(--color-primary)] underline">
          Back to sign in
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
