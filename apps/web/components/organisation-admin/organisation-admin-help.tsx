"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import {
  OrgAdminPageHeader,
  OrgAdminSectionTitle,
} from "@/components/organisation-admin/org-admin-ui";
import type { OrganisationAdminHelpPayload } from "@/lib/organisation-admin/build-help";

async function fetchHelp(): Promise<OrganisationAdminHelpPayload> {
  const res = await fetch("/api/v1/organisation-admin/help", { cache: "no-store" });
  const body = (await res.json()) as {
    data?: OrganisationAdminHelpPayload;
    error?: { message?: string };
  };
  if (!res.ok || !body.data) {
    throw new Error(body.error?.message ?? `Help failed (${res.status})`);
  }
  return body.data;
}

export function OrganisationAdminHelpView() {
  const q = useQuery({
    queryKey: ["organisation-admin", "help"],
    queryFn: fetchHelp,
  });

  return (
    <div
      className="flex flex-col gap-3 px-5 py-4"
      data-testid="organisation-admin-help"
    >
      <OrgAdminPageHeader title="Help" subtitle="How can we help?" />

      <div className="max-w-xl">
        <label className="relative flex min-w-[12rem] flex-1 items-center gap-1.5 border border-[var(--color-border)] px-2 py-1.5 opacity-60">
          <input
            type="search"
            disabled
            placeholder="Search help…"
            className="w-full bg-transparent text-xs outline-none"
            data-testid="org-admin-help-search"
            aria-disabled="true"
          />
        </label>
        {q.data?.search.availability === "not_configured" ? (
          <p className="mt-1.5 text-[11px] text-[var(--color-muted-foreground)]">
            Not configured — {q.data.search.message}
          </p>
        ) : null}
      </div>

      {q.isLoading ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading…</p>
      ) : null}
      {q.isError ? (
        <p className="text-xs text-[var(--color-destructive)]" role="alert">
          {(q.error as Error).message}
        </p>
      ) : null}

      {q.data ? (
        <section data-testid="org-admin-help-topics">
          <OrgAdminSectionTitle>Get Help</OrgAdminSectionTitle>
          <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
            {q.data.topics.map((topic) => (
              <li
                key={topic.id}
                className="py-3"
                data-testid={`org-admin-help-${topic.id}`}
              >
                {topic.href && topic.availability === "ok" ? (
                  <Link href={topic.href} className="block hover:underline">
                    <p className="text-sm font-medium">{topic.title}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
                      {topic.description}
                    </p>
                  </Link>
                ) : (
                  <div>
                    <p className="text-sm font-medium">{topic.title}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
                      {topic.description}
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--color-muted-foreground)]">
                      Not configured
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3 max-w-2xl text-[11px] text-[var(--color-muted-foreground)]">
            {q.data.note}
          </p>
        </section>
      ) : null}
    </div>
  );
}
