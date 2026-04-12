"use client";

import { useQuery } from "@tanstack/react-query";

import type { AdminAccessDataPlaneMeta } from "@/lib/admin/access/admin-access-load-meta";
import { stripAdminAccessMeta, type AdminAccessApiResponse } from "@/lib/admin/access/admin-access-load-meta";
import type { AdminAccessData } from "@/lib/admin/mock-access-data";

export type AdminAccessQuerySelection = {
  accessData: AdminAccessData;
  loadMeta: AdminAccessDataPlaneMeta;
};

export function useAdminAccessQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["admin-access"],
    queryFn: async () => {
      const res = await fetch(`/api/admin/access`, { credentials: "include" });
      if (!res.ok) {
        throw new Error(`admin access ${res.status}`);
      }
      return res.json() as Promise<AdminAccessApiResponse>;
    },
    select: (json: AdminAccessApiResponse): AdminAccessQuerySelection => ({
      accessData: stripAdminAccessMeta(json),
      loadMeta: json._meta,
    }),
    staleTime: 60_000,
    enabled: options?.enabled ?? true,
  });
}
