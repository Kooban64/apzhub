"use client";

import { useQuery } from "@tanstack/react-query";

import type { LaunchEventRowDto } from "@/lib/launch/launch-event-api";

export function useAdminLaunchEventsQuery(limit = 100) {
  return useQuery({
    queryKey: ["admin-launch-events", limit],
    queryFn: async () => {
      const res = await fetch(`/api/admin/launch/events?limit=${limit}`, { credentials: "include" });
      if (!res.ok) {
        throw new Error(`launch events ${res.status}`);
      }
      return res.json() as Promise<{ items: LaunchEventRowDto[] }>;
    },
  });
}
