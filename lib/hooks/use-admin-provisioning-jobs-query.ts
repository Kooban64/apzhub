"use client";

import { useQuery } from "@tanstack/react-query";

import type { AdminProvisioningJob } from "@/lib/admin/provisioning/job-contract";

export function useAdminProvisioningJobsQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["admin-provisioning-jobs"],
    queryFn: async () => {
      const res = await fetch("/api/admin/provisioning/jobs", { credentials: "include" });
      if (!res.ok) {
        throw new Error(`provisioning jobs ${res.status}`);
      }
      const body = (await res.json()) as { jobs: AdminProvisioningJob[] };
      return body.jobs;
    },
    staleTime: 10_000,
    enabled: options?.enabled ?? true,
  });
}
