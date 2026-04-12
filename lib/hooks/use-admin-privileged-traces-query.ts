"use client";

import { useQuery } from "@tanstack/react-query";

import type { AdminPrivilegedActionTrace } from "@/lib/admin/contracts/privileged-action-trace";

export function useAdminPrivilegedTracesQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["admin-privileged-traces"],
    queryFn: async () => {
      const res = await fetch("/api/admin/privileged-traces", { credentials: "include" });
      if (!res.ok) {
        throw new Error(`privileged traces ${res.status}`);
      }
      const body = (await res.json()) as { items: AdminPrivilegedActionTrace[] };
      return body.items;
    },
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });
}
