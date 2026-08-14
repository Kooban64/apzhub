"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Check, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type TenantMembership = {
  readonly tenantId: string;
  readonly isPrimary: boolean;
  readonly status: string;
};

async function fetchTenants() {
  const res = await fetch("/api/v1/me/tenants");
  const body = await res.json();
  if (!res.ok) throw new Error(body?.error?.message ?? "Tenants failed");
  return body.data as {
    activeTenantId: string | null;
    memberships: readonly TenantMembership[];
  };
}

export function TenantSwitcher({ className = "" }: { readonly className?: string }) {
  const router = useRouter();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const q = useQuery({ queryKey: ["me", "tenants"], queryFn: fetchTenants });
  const mut = useMutation({
    mutationFn: async (tenantId: string) => {
      const res = await fetch("/api/v1/me/active-tenant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error?.message ?? "Switch failed");
      return body.data as { activeTenantId: string };
    },
    onSuccess: async () => {
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ["me"] });
      await qc.invalidateQueries({ queryKey: ["org"] });
      router.refresh();
    },
  });

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const memberships = q.data?.memberships ?? [];
  const active =
    q.data?.activeTenantId ?? memberships.find((m) => m.isPrimary)?.tenantId ?? null;

  if (memberships.length <= 1 && !q.isLoading) {
    if (!active) return null;
    return (
      <span
        className={`inline-flex max-w-[140px] items-center gap-1 truncate font-mono text-[10px] text-[var(--color-muted-foreground)] ${className}`}
        title={active}
      >
        <Building2 className="h-3 w-3 shrink-0" aria-hidden />
        {active.slice(0, 8)}
      </span>
    );
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        className="inline-flex h-7 max-w-[180px] items-center gap-1 rounded px-1.5 text-[11px] hover:bg-[var(--color-muted)]"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Switch organisation"
        onClick={() => setOpen((v) => !v)}
      >
        <Building2 className="h-3.5 w-3.5 shrink-0 text-[var(--color-muted-foreground)]" />
        <span className="truncate font-mono" title={active ?? undefined}>
          {active ? active.slice(0, 10) : "Tenant"}
        </span>
        <ChevronDown className="h-3 w-3 shrink-0 text-[var(--color-muted-foreground)]" />
      </button>
      {open ? (
        <div
          role="listbox"
          className="absolute top-full right-0 z-50 mt-1 min-w-[220px] rounded border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-md"
        >
          <p className="px-3 py-1.5 text-[10px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
            Organisations
          </p>
          {memberships.map((m) => {
            const selected = m.tenantId === active;
            return (
              <button
                key={m.tenantId}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={mut.isPending || selected}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[12px] hover:bg-[var(--color-muted)] disabled:opacity-60"
                onClick={() => mut.mutate(m.tenantId)}
              >
                <span className="min-w-0 flex-1 truncate font-mono">{m.tenantId}</span>
                {selected ? (
                  <Check className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                ) : null}
              </button>
            );
          })}
          {mut.error ? (
            <p className="px-3 py-2 text-[11px] text-[var(--color-destructive)]">
              {(mut.error as Error).message}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
