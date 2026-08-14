"use client";

import { findQepModuleBySlug } from "@apzhub/qep-types";
import Link from "next/link";

import { QEP_REQUIREMENTS_ROUTES } from "@/lib/qep/routes";

import { QepPageShell, QepUnavailableState } from "./qep-ui";

function slugFromPathname(pathname: string): string | undefined {
  const normalized = pathname.replace(/\/+$/, "") || "/";
  const prefix = "/workspace/qep/";
  if (!normalized.startsWith(prefix)) {
    return undefined;
  }
  const rest = normalized.slice(prefix.length);
  const slug = rest.split("/")[0]?.trim();
  return slug && slug.length > 0 ? slug : undefined;
}

/**
 * Q6 — honest empty/unavailable for stub or unknown QEP workspace paths.
 * Never fall through to Requirements (or any other live module).
 */
export function QepUnavailableModuleView({ pathname }: { readonly pathname: string }) {
  const slug = slugFromPathname(pathname);
  const module = slug ? findQepModuleBySlug(slug) : undefined;
  const title = module?.title ?? (slug ? `QEP / ${slug}` : "QEP workspace");
  const detail = module
    ? module.status === "stub" || module.status === "planned"
      ? `${module.title} is declared in the QEP catalogue (${module.id}) but is not available in this build. Packages are retained; this surface will not pretend to be another module.`
      : `${module.title} is catalogued as enabled, but this path is not wired in the workspace router yet.`
    : slug
      ? `No QEP workspace surface is registered for “${slug}”.`
      : "Open a Quality Engineering module from navigation, or start from Requirements.";

  return (
    <QepPageShell
      title={title}
      description="Module unavailable"
      breadcrumbs={["QEP", module?.title ?? slug ?? "Workspace"]}
    >
      <QepUnavailableState
        title="This QEP module is not available yet."
        detail={detail}
      />
      <p className="mt-4 text-center text-sm">
        <Link
          href={QEP_REQUIREMENTS_ROUTES.list}
          className="text-[var(--color-primary)] underline-offset-4 hover:underline"
        >
          Go to Requirements
        </Link>
      </p>
    </QepPageShell>
  );
}
