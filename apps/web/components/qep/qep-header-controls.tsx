"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Link from "next/link";

import { QEP_DEFECT_ROUTES } from "@apzhub/qep-defects/presentation";
import { QEP_REQUIREMENTS_ROUTES } from "@apzhub/qep-requirements/presentation";
import { QEP_TEST_SPECIFICATION_ROUTES } from "@apzhub/qep-test-specifications/presentation";
import { useQepApplicationContext } from "@/lib/qep/qep-application-context";
import { hasQepPermission } from "@/lib/qep/qep-permission";

type PortfolioResponse = {
  readonly applications?: readonly {
    readonly id: string;
    readonly name: string;
    readonly projectRefs?: readonly string[];
  }[];
  readonly projects?: readonly { readonly id: string; readonly name: string }[];
};

async function fetchPortfolio(): Promise<PortfolioResponse> {
  const res = await fetch("/api/v1/qep/applications", { cache: "no-store" });
  const body = (await res.json()) as { data?: PortfolioResponse };
  if (!res.ok) return { applications: [] };
  return body.data ?? { applications: [] };
}

export function QepApplicationLoader() {
  const { setApplications } = useQepApplicationContext();
  const query = useQuery({
    queryKey: ["qep-applications", "header-applications"],
    queryFn: fetchPortfolio,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!query.data) return;
    const applications = query.data.applications;
    if (applications) {
      setApplications(
        applications.map((p) => ({
          id: p.id,
          name: p.name,
          ...(p.projectRefs ? { projectRefs: p.projectRefs } : {}),
        })),
      );
      return;
    }
    setApplications(
      (query.data.projects ?? []).map((p) => ({
        id: p.id,
        name: p.name,
      })),
    );
  }, [setApplications, query.data]);

  return null;
}

export function QepApplicationSelector() {
  const ctx = useQepApplicationContext();
  if (ctx.applications.length === 0) {
    return (
      <p
        className="flex min-w-0 items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]"
        data-testid="qep-application-selector"
      >
        <span className="text-[var(--color-border)]" aria-hidden>
          │
        </span>
        Application: None
      </p>
    );
  }

  return (
    <label
      className="flex min-w-0 items-center gap-1.5 text-xs"
      data-testid="qep-application-selector"
    >
      <span className="text-[var(--color-border)]" aria-hidden>
        │
      </span>
      <span className="text-[var(--color-muted-foreground)]">Application:</span>
      <select
        className="max-w-[12rem] truncate border-0 bg-transparent py-1 text-xs font-medium"
        value={ctx.selectedId ?? ""}
        onChange={(event) => ctx.selectApplication(event.target.value || null)}
      >
        <option value="">Select</option>
        {ctx.applications.map((app) => (
          <option key={app.id} value={app.id}>
            {app.name}
          </option>
        ))}
      </select>
    </label>
  );
}

export function QepCreateMenu({
  permissions,
}: {
  readonly permissions?: readonly string[];
}) {
  const [open, setOpen] = useState(false);
  const items: { href: string; label: string }[] = [];
  if (hasQepPermission(permissions, "qep.requirements.create")) {
    items.push({ href: QEP_REQUIREMENTS_ROUTES.new, label: "Requirement" });
  }
  if (hasQepPermission(permissions, "qep.specification.create")) {
    items.push({ href: QEP_TEST_SPECIFICATION_ROUTES.new, label: "Test Case" });
  }
  if (hasQepPermission(permissions, "qep.defects.create")) {
    items.push({ href: QEP_DEFECT_ROUTES.new, label: "Defect" });
  }
  if (items.length === 0) return null;

  return (
    <div className="relative" data-testid="qep-create-menu">
      <button
        type="button"
        className="flex h-8 items-center rounded-md bg-[var(--color-primary)] px-3 text-xs font-medium text-[var(--color-primary-foreground)]"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        + Create
      </button>
      {open ? (
        <ul
          className="absolute right-0 z-20 mt-1 min-w-[10rem] border border-[var(--color-border)] bg-[var(--color-surface)] py-1 text-xs shadow-sm"
          role="menu"
        >
          {items.map((item) => (
            <li key={item.href} role="none">
              <Link
                href={item.href}
                role="menuitem"
                className="block px-3 py-1.5 hover:bg-[var(--color-muted)]"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
