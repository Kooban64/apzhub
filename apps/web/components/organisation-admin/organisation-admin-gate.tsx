"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { ORGANISATION_ADMIN_PERMISSION } from "@/lib/organisation-admin/nav";
import { ORG_ADMIN_SURFACE_PERMISSIONS } from "@/lib/organisation-admin/permissions";

type GateState =
  | { readonly status: "loading" }
  | { readonly status: "ok"; readonly permissions: readonly string[] }
  | { readonly status: "denied"; readonly message: string };

function hasPermission(granted: readonly string[], required: string): boolean {
  if (granted.includes("*") || granted.includes(required)) return true;
  if (granted.includes("tenant.*") && required.startsWith("tenant.")) return true;
  return [...granted].some(
    (g) => g.endsWith(".*") && required.startsWith(g.slice(0, -1)),
  );
}

/**
 * Nav display set for org administrators.
 * home-context truncates permissions (slice 0..80); surface keys may fall off.
 * API routes still enforce real AuthZ — this only restores shell menu honesty.
 */
function navPermissionsForOrgAdmin(granted: readonly string[]): readonly string[] {
  const surface = [
    ...ORG_ADMIN_SURFACE_PERMISSIONS.people,
    ...ORG_ADMIN_SURFACE_PERMISSIONS.teams,
    ...ORG_ADMIN_SURFACE_PERMISSIONS.rolesAccess,
    ...ORG_ADMIN_SURFACE_PERMISSIONS.products,
    ...ORG_ADMIN_SURFACE_PERMISSIONS.provisioning,
    ...ORG_ADMIN_SURFACE_PERMISSIONS.workspaceSettings,
    ...ORG_ADMIN_SURFACE_PERMISSIONS.integrations,
    ...ORG_ADMIN_SURFACE_PERMISSIONS.security,
    ...ORG_ADMIN_SURFACE_PERMISSIONS.audit,
    ...ORG_ADMIN_SURFACE_PERMISSIONS.settings,
    "admin.read",
  ];
  return [...new Set([...granted, ...surface])];
}

export function OrganisationAdminGate({
  children,
}: {
  readonly children: (permissions: readonly string[]) => ReactNode;
}) {
  const router = useRouter();
  const [state, setState] = useState<GateState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (!cancelled) {
        setState({
          status: "ok",
          permissions: navPermissionsForOrgAdmin([ORGANISATION_ADMIN_PERMISSION]),
        });
      }
    }, 12_000);

    void (async () => {
      try {
        const res = await fetch("/api/v1/me/home-context", { cache: "no-store" });
        if (cancelled) return;
        if (res.status === 401 || res.status === 403) {
          setState({
            status: "denied",
            message: "Sign in required for Organisation Admin.",
          });
          router.replace("/login");
          return;
        }
        if (!res.ok) {
          setState({
            status: "ok",
            permissions: navPermissionsForOrgAdmin([ORGANISATION_ADMIN_PERMISSION]),
          });
          return;
        }
        const body = (await res.json()) as {
          data?: {
            permissions?: readonly string[];
            kind?: string;
          };
        };
        const perms = body.data?.permissions ?? [];
        const allowed =
          hasPermission(perms, ORGANISATION_ADMIN_PERMISSION) ||
          body.data?.kind === "org_admin";
        if (!allowed) {
          setState({
            status: "denied",
            message:
              "You do not have organisation administration authority (identity.manage).",
          });
          return;
        }
        setState({
          status: "ok",
          permissions: navPermissionsForOrgAdmin(perms),
        });
      } catch {
        if (!cancelled) {
          setState({
            status: "ok",
            permissions: navPermissionsForOrgAdmin([ORGANISATION_ADMIN_PERMISSION]),
          });
        }
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [router]);

  if (state.status === "loading") {
    return (
      <div
        className="flex h-dvh items-center justify-center text-xs text-[var(--color-muted-foreground)]"
        data-testid="organisation-admin-gate-loading"
      >
        Checking Organisation Admin access…
      </div>
    );
  }

  if (state.status === "denied") {
    return (
      <div
        className="mx-auto flex max-w-md flex-col gap-3 p-8"
        data-testid="organisation-admin-access-denied"
        role="alert"
      >
        <h1 className="text-lg font-semibold">Access denied</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">{state.message}</p>
        <a
          href="/workspace/home"
          className="text-sm text-[var(--color-primary)] underline"
        >
          Back to workbench
        </a>
      </div>
    );
  }

  return <>{children(state.permissions)}</>;
}
