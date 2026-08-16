"use client";

import { useQuery } from "@tanstack/react-query";
import { Boxes, Check, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { productDisplayName } from "@/lib/commercial/soft-product-access";

type HomeEntitlements = {
  readonly productKeys?: readonly string[];
};

const PRODUCT_HOME: Record<string, string> = {
  support: "/workspace/support",
  time: "/workspace/time",
  knowledge: "/workspace/knowledge",
  projects: "/workspace/projects",
  qep: "/workspace/qep",
  documents: "/workspace/documents",
  analytics: "/workspace/analytics",
  workflow: "/workspace/workflows",
  pentest: "/apzpen",
};

async function fetchEntitlements(): Promise<HomeEntitlements> {
  const res = await fetch("/api/v1/me/home-context");
  const body = (await res.json()) as {
    data?: { entitlements?: HomeEntitlements };
  };
  if (!res.ok) return {};
  return body.data?.entitlements ?? {};
}

function activeProductFromPath(pathname: string): string | null {
  for (const [key, href] of Object.entries(PRODUCT_HOME)) {
    if (pathname === href || pathname.startsWith(`${href}/`)) return key;
  }
  return null;
}

/** Entitled-products only — Stream 5 Product ▼ switcher. */
export function ProductSwitcher({ className = "" }: { readonly className?: string }) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const q = useQuery({
    queryKey: ["me", "home-context", "product-switcher"],
    queryFn: fetchEntitlements,
  });

  const products = [...(q.data?.productKeys ?? [])].sort();
  const active = activeProductFromPath(pathname);
  const loading = q.isLoading || q.isFetching;

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // Always mount chrome control (loading / empty / entitled) so shell audits and
  // humans never see a missing header affordance after entitlements resolve late.
  if (!loading && products.length === 0) {
    return (
      <div
        className={`relative ${className}`}
        data-testid="product-switcher"
        data-empty="true"
      >
        <button
          type="button"
          disabled
          className="inline-flex h-7 max-w-[160px] items-center gap-1 rounded px-1.5 text-[11px] text-[var(--color-muted-foreground)] opacity-70"
          aria-label="No entitled products"
        >
          <Boxes className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Products</span>
        </button>
      </div>
    );
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        className="inline-flex h-7 max-w-[160px] items-center gap-1 rounded px-1.5 text-[11px] hover:bg-[var(--color-muted)]"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Switch product"
        data-testid="product-switcher"
        disabled={loading}
        onClick={() => setOpen((v) => !v)}
      >
        <Boxes className="h-3.5 w-3.5 shrink-0 text-[var(--color-muted-foreground)]" />
        <span className="truncate">
          {loading ? "Products…" : active ? productDisplayName(active) : "Product"}
        </span>
        <ChevronDown className="h-3 w-3 shrink-0 text-[var(--color-muted-foreground)]" />
      </button>
      {open ? (
        <div
          role="listbox"
          className="absolute top-full left-0 z-50 mt-1 min-w-[200px] rounded border border-[var(--color-border)] bg-[var(--color-surface)] py-1 shadow-md"
        >
          <p className="px-3 py-1.5 text-[10px] tracking-wide text-[var(--color-muted-foreground)] uppercase">
            Entitled products
          </p>
          {products.map((productKey) => {
            const selected = productKey === active;
            const href = PRODUCT_HOME[productKey] ?? "/workspace/home";
            return (
              <button
                key={productKey}
                type="button"
                role="option"
                aria-selected={selected}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-[var(--color-muted)]"
                onClick={() => {
                  setOpen(false);
                  router.push(href);
                }}
              >
                <span className="flex-1 truncate">
                  {productDisplayName(productKey)}
                </span>
                {selected ? <Check className="h-3 w-3" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
