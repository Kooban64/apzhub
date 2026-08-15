"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import type { DemoPersonaKind } from "@/lib/demo/demo-personas";
import {
  isOperatorKind,
  shellLandingForKind,
  type OperatorShellId,
} from "@/lib/operator/shell-landing";

const SHELL_KINDS: Record<OperatorShellId, readonly DemoPersonaKind[]> = {
  console: ["superadmin"],
  ops: ["platform_admin", "support", "superadmin"],
  finance: ["finance", "superadmin"],
  compliance: ["compliance", "superadmin"],
  org: ["org_admin", "superadmin"],
  apzpen: ["superadmin", "platform_admin", "support", "org_admin", "org_member"],
  workspace: ["org_member", "individual"],
};

type HomeContextPayload = {
  kind?: DemoPersonaKind;
  landing?: { path?: string };
  entitlements?: { productKeys?: readonly string[] };
};

function mayUseApzpen(
  kind: DemoPersonaKind,
  entitlements: HomeContextPayload["entitlements"],
): boolean {
  if (kind === "superadmin" || kind === "platform_admin" || kind === "support") {
    return true;
  }
  return Boolean(entitlements?.productKeys?.includes("pentest"));
}

export function OperatorGate({
  shell,
  children,
}: {
  readonly shell: OperatorShellId;
  readonly children: ReactNode;
}) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/me/home-context");
        const body = (await res.json()) as { data?: HomeContextPayload };
        if (cancelled) return;
        const kind = body.data?.kind ?? "org_member";
        const allowed = SHELL_KINDS[shell] ?? [];
        const entitled =
          shell !== "apzpen" || mayUseApzpen(kind, body.data?.entitlements);
        if (!allowed.includes(kind) || !entitled) {
          const landing = shellLandingForKind(kind);
          router.replace(landing.path);
          return;
        }
        setOk(true);
      } catch {
        if (!cancelled) router.replace("/login");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, shell]);

  if (!ok) {
    return (
      <div className="p-6 text-xs text-[var(--color-muted-foreground)]">
        Checking access…
      </div>
    );
  }

  return <div className="flex h-full min-h-0 flex-1 flex-col">{children}</div>;
}

/**
 * Keep operator personas off the productivity DesktopShell
 * (ActivityBar + Sidebar dual rail). Send them to their console home.
 */
export function WorkbenchOperatorRedirect({
  children,
}: {
  readonly children: ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/me/home-context", {
          cache: "no-store",
        });
        const body = (await res.json()) as {
          data?: { kind?: DemoPersonaKind; landing?: { path?: string } };
        };
        if (cancelled) return;
        const kind = body.data?.kind ?? "org_member";
        if (isOperatorKind(kind)) {
          const target = body.data?.landing?.path ?? shellLandingForKind(kind).path;
          router.replace(target);
          return;
        }
        setReady(true);
      } catch {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!ready) {
    return (
      <div className="flex h-dvh items-center justify-center text-xs text-[var(--color-muted-foreground)]">
        Opening your console…
      </div>
    );
  }
  return <>{children}</>;
}
