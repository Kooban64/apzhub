"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getAccessPostureUsesApi } from "@/lib/adapters/env";
import type { AccessRealizationStatus } from "@/lib/admin/access/realization-status";
import { useSession } from "@/components/providers/session-provider";
import { directorySubjectIdForSession, readMatrixPostureForUserSync } from "@/lib/launch/workspace-launch-bridge";
import { resolveLaunchDecision } from "@/lib/launch/resolve-launch-decision";
import { effectiveLauncherVisibleForSubject } from "@/lib/workspace/launcher-semantics";
import { isServiceAllowed, type WorkspaceConfig, type WorkspaceServiceId } from "@/lib/workspace/workspace-config";

export function useWorkspaceServiceLaunchDecision(serviceId: WorkspaceServiceId, config: WorkspaceConfig) {
  const { snapshot } = useSession();
  const uid = useMemo(() => directorySubjectIdForSession(snapshot), [snapshot]);
  const useApi = getAccessPostureUsesApi();

  const { data: postureFromApi, isPending: posturePending } = useQuery({
    queryKey: ["admin-access-posture", uid, serviceId],
    queryFn: async () => {
      const res = await fetch(
        `/api/workspace/access-posture?userId=${encodeURIComponent(uid!)}&serviceId=${encodeURIComponent(serviceId)}`,
        { credentials: "include" },
      );
      if (!res.ok) {
        throw new Error(`posture ${res.status}`);
      }
      return res.json() as Promise<{ effectiveRole: string; realization: AccessRealizationStatus | null }>;
    },
    enabled: useApi && !!uid,
    staleTime: 30_000,
  });

  return useMemo(() => {
    const tenantAllowsService = isServiceAllowed(config, serviceId);
    const platformRole = snapshot.sessionStatus === "active" ? snapshot.platformRole : "user";
    const launcherShowsService = effectiveLauncherVisibleForSubject(config, platformRole).includes(serviceId);
    if (!uid) {
      return resolveLaunchDecision({
        serviceId,
        tenantAllowsService,
        launcherShowsService,
        effectiveRole: "none",
        realization: null,
      });
    }

    const superPosture =
      snapshot.sessionStatus === "active" && snapshot.platformRole === "superadmin"
        ? ({ effectiveRole: "superadmin", realization: "provisioned" as AccessRealizationStatus } as const)
        : null;

    const { effectiveRole, realization } = superPosture
      ? superPosture
      : useApi
        ? posturePending
          ? { effectiveRole: "none", realization: "pending" as AccessRealizationStatus }
          : {
              effectiveRole: postureFromApi?.effectiveRole ?? "none",
              realization: postureFromApi?.realization ?? null,
            }
        : readMatrixPostureForUserSync(uid, serviceId);

    return resolveLaunchDecision({
      serviceId,
      tenantAllowsService,
      launcherShowsService,
      effectiveRole,
      realization,
    });
  }, [config, serviceId, uid, useApi, postureFromApi, posturePending, snapshot]);
}
