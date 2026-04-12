"use client";

import { useEffect, useMemo } from "react";

import { AdminInspectorPanel } from "@/features/admin/admin-inspector-panel";
import { setAdminRightPanelSlot } from "@/lib/admin/admin-right-panel-slot";
import type { AdminAccessData } from "@/lib/admin/mock-access-data";
import type { AdminHomeData } from "@/lib/admin/mock-admin-home-data";
import { useAdminAccessQuery } from "@/lib/hooks/use-admin-access-query";
import { useAdminControlPlaneQuery } from "@/lib/hooks/use-admin-control-plane-query";
import { useAdminProvisioningJobsQuery } from "@/lib/hooks/use-admin-provisioning-jobs-query";

export function AdminRightPanelRegistrar({
  overrideHomeData,
  overrideAccessData,
}: {
  overrideHomeData?: AdminHomeData;
  overrideAccessData?: AdminAccessData;
}) {
  const homeQuery = useAdminControlPlaneQuery({ enabled: !overrideHomeData });
  const accessQuery = useAdminAccessQuery({ enabled: !overrideAccessData });

  const homeData = overrideHomeData ?? homeQuery.data;
  const accessData = overrideAccessData ?? accessQuery.data?.accessData;

  const jobsEnabled = Boolean(homeData && accessData);
  const jobsQuery = useAdminProvisioningJobsQuery({ enabled: jobsEnabled });
  const provisioningJobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data]);

  useEffect(() => {
    if (!homeData || !accessData) {
      return;
    }
    setAdminRightPanelSlot(
      <AdminInspectorPanel homeData={homeData} accessData={accessData} provisioningJobs={provisioningJobs} />,
    );
    return () => {
      setAdminRightPanelSlot(null);
    };
  }, [homeData, accessData, provisioningJobs]);

  return null;
}
