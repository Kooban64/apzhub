import type { AdminAccessData } from "@/lib/admin/mock-access-data";
import type { AdminProvisioningJobType } from "@/lib/admin/provisioning/job-contract";
import { mergeBundleRoleMap, serviceDisplayName } from "@/lib/access/effective-access";
import { PROVISIONING_JOB_ACTION } from "@/lib/provisioning/contracts/provisioning-job-actions";
import type { ProvisioningTriggerSource } from "@/lib/provisioning/contracts/enums";

export type ProvisioningIntent = {
  userId: string;
  serviceId: string;
  jobType: AdminProvisioningJobType;
  desiredEffectiveRole: string | null;
  triggerSource: ProvisioningTriggerSource;
  subjectLabel: string;
};

export { mergeBundleRoleMap } from "@/lib/access/effective-access";

export function computeBundleAssignmentIntents(
  data: AdminAccessData,
  userId: string,
  addBundleIds: string[],
  removeBundleIds: string[],
): ProvisioningIntent[] {
  const detail = data.userAccessByUserId[userId];
  if (!detail) {
    return [];
  }
  const previousBundleIds = detail.bundleAssignments.map((b) => b.bundleId);
  const nextIds = new Set(previousBundleIds);
  for (const r of removeBundleIds) {
    nextIds.delete(r);
  }
  for (const a of addBundleIds) {
    nextIds.add(a);
  }

  const oldMap = mergeBundleRoleMap(previousBundleIds, data.bundleDetailsById);
  const newMap = mergeBundleRoleMap([...nextIds], data.bundleDetailsById);

  const serviceIds = new Set([...oldMap.keys(), ...newMap.keys()]);
  const intents: ProvisioningIntent[] = [];
  for (const sid of serviceIds) {
    const oldR = oldMap.get(sid) ?? null;
    const newR = newMap.get(sid) ?? null;
    const oldId = oldR?.roleId ?? null;
    const newId = newR?.roleId ?? null;
    if (oldId === newId) {
      continue;
    }
    const svcName = serviceDisplayName(data, sid);
    const label = `${detail.displayName} · ${svcName}`;
    if (!oldId && newId) {
      intents.push({
        userId,
        serviceId: sid,
        jobType: PROVISIONING_JOB_ACTION.grant,
        desiredEffectiveRole: newId,
        triggerSource: "bundle_assignment",
        subjectLabel: label,
      });
    } else if (oldId && !newId) {
      intents.push({
        userId,
        serviceId: sid,
        jobType: PROVISIONING_JOB_ACTION.revoke,
        desiredEffectiveRole: null,
        triggerSource: "bundle_assignment",
        subjectLabel: label,
      });
    } else if (oldId && newId) {
      intents.push({
        userId,
        serviceId: sid,
        jobType: PROVISIONING_JOB_ACTION.repair,
        desiredEffectiveRole: newId,
        triggerSource: "bundle_assignment",
        subjectLabel: label,
      });
    }
  }
  return intents;
}

export function computeServiceOverrideIntents(
  data: AdminAccessData,
  userId: string,
  serviceId: string,
  effectiveRole: string | null,
): ProvisioningIntent[] {
  const detail = data.userAccessByUserId[userId];
  if (!detail) {
    return [];
  }
  const svcName = serviceDisplayName(data, serviceId);
  const label = `${detail.displayName} · ${svcName}`;
  const bundleIds = detail.bundleAssignments.map((b) => b.bundleId);
  const baseline = mergeBundleRoleMap(bundleIds, data.bundleDetailsById).get(serviceId)?.roleId ?? null;

  if (effectiveRole) {
    return [
      {
        userId,
        serviceId,
        jobType: PROVISIONING_JOB_ACTION.grant,
        desiredEffectiveRole: effectiveRole,
        triggerSource: "service_override",
        subjectLabel: label,
      },
    ];
  }
  if (!baseline) {
    return [
      {
        userId,
        serviceId,
        jobType: PROVISIONING_JOB_ACTION.revoke,
        desiredEffectiveRole: null,
        triggerSource: "service_override",
        subjectLabel: label,
      },
    ];
  }
  return [
    {
      userId,
      serviceId,
      jobType: PROVISIONING_JOB_ACTION.repair,
      desiredEffectiveRole: baseline,
      triggerSource: "service_override",
      subjectLabel: label,
    },
  ];
}

export function computeUserSuspendIntents(data: AdminAccessData, userId: string): ProvisioningIntent[] {
  const detail = data.userAccessByUserId[userId];
  if (!detail) {
    return [];
  }
  const intents: ProvisioningIntent[] = [];
  for (const line of detail.serviceAccess) {
    if (!line.effectiveRole || line.effectiveRole === "none") {
      continue;
    }
    intents.push({
      userId,
      serviceId: line.serviceId,
      jobType: PROVISIONING_JOB_ACTION.revoke,
      desiredEffectiveRole: null,
      triggerSource: "user_suspend",
      subjectLabel: `${detail.displayName} · ${line.serviceName}`,
    });
  }
  return intents;
}

export function computeUserResumeIntents(data: AdminAccessData, userId: string): ProvisioningIntent[] {
  const detail = data.userAccessByUserId[userId];
  if (!detail) {
    return [];
  }
  const bundleIds = detail.bundleAssignments.map((b) => b.bundleId);
  const map = mergeBundleRoleMap(bundleIds, data.bundleDetailsById);
  const intents: ProvisioningIntent[] = [];
  for (const [serviceId, role] of map) {
    intents.push({
      userId,
      serviceId,
      jobType: PROVISIONING_JOB_ACTION.grant,
      desiredEffectiveRole: role.roleId,
      triggerSource: "user_resume",
      subjectLabel: `${detail.displayName} · ${serviceDisplayName(data, serviceId)}`,
    });
  }
  return intents;
}
