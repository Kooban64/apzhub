"use client";

import { useQuery } from "@tanstack/react-query";

import type { AdminHomeData } from "@/lib/admin/mock-admin-home-data";

export function useAdminControlPlaneQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["admin-control-plane"],
    queryFn: async () => {
      const res = await fetch("/api/admin/control-plane", { credentials: "include" });
      if (!res.ok) {
        throw new Error(`control plane ${res.status}`);
      }
      return res.json() as Promise<AdminHomeData>;
    },
    staleTime: 30_000,
    enabled: options?.enabled ?? true,
  });
}
