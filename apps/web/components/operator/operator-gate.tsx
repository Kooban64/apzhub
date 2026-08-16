"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { ProductAccessDeniedView } from "@/components/commercial/product-access-denied";
import type { DemoPersonaKind } from "@/lib/demo/demo-personas";
import {
  softEvaluateProductAccess,
  type EntitlementSnapshotLike,
} from "@/lib/commercial/soft-product-access";
import {
  shellLandingForKind,
  type OperatorShellId,
} from "@/lib/operator/shell-landing";
import { preferredShellFamily } from "@/lib/shell/shell-policy";

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
  entitlements?: EntitlementSnapshotLike | null;
};

type GateState =
  | { readonly status: "loading" }
  | { readonly status: "ok" }
  | {
      readonly status: "product_denied";
      readonly reason:
        "org_not_subscribed" | "user_not_granted" | "product_unavailable";
    }
  | { readonly status: "redirecting" };

function mayBypassApzpenProduct(kind: DemoPersonaKind): boolean {
  return kind === "superadmin" || kind === "platform_admin" || kind === "support";
}

export function OperatorGate({
  shell,
  children,
}: {
  readonly shell: OperatorShellId;
  readonly children: ReactNode;
}) {
  const router = useRouter();
  const [state, setState] = useState<GateState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/me/home-context");
        const body = (await res.json()) as { data?: HomeContextPayload };
        if (cancelled) return;
        const kind = body.data?.kind ?? "org_member";
        const allowed = SHELL_KINDS[shell] ?? [];
        if (!allowed.includes(kind)) {
          const landing = shellLandingForKind(kind);
          setState({ status: "redirecting" });
          router.replace(landing.path);
          return;
        }
        if (shell === "apzpen" && !mayBypassApzpenProduct(kind)) {
          const access = softEvaluateProductAccess("pentest", body.data?.entitlements);
          if (access.status === "denied") {
            setState({ status: "product_denied", reason: access.reason });
            return;
          }
        }
        setState({ status: "ok" });
      } catch {
        if (!cancelled) {
          setState({ status: "redirecting" });
          router.replace("/login");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, shell]);

  if (state.status === "product_denied") {
    return (
      <ProductAccessDeniedView
        productKey="pentest"
        reason={state.reason}
        breadcrumbs={["Security Assurance", "Product required"]}
      />
    );
  }

  if (state.status !== "ok") {
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
 * Policy: `preferredShellFamily` in `@/lib/shell/shell-policy`.
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
        if (preferredShellFamily(kind) === "operator") {
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
