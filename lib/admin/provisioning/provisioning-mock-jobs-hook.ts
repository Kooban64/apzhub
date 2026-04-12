"use client";

import { useSyncExternalStore } from "react";

import {
  getProvisioningJobsSnapshot,
  subscribe,
} from "@/lib/admin/provisioning/provisioning-mock-jobs-core";

export function useProvisioningJobs(): ReturnType<typeof getProvisioningJobsSnapshot> {
  return useSyncExternalStore(subscribe, getProvisioningJobsSnapshot, getProvisioningJobsSnapshot);
}
