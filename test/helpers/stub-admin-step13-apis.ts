import { vi } from "vitest";

import { mockAdminSession } from "@/lib/auth/mock-session";
import { getMockAccessData } from "@/lib/admin/mock-access-data";
import { getMockAdminHomeData, getMockPrivilegedActionTraces } from "@/lib/admin/mock-admin-home-data";
import {
  getProvisioningJobsSnapshot,
  resolveProvisioningJobManual,
  retryProvisioningJob,
} from "@/lib/admin/provisioning/provisioning-mock-jobs-core";
import type { AdminAccessApiResponse } from "@/lib/admin/access/admin-access-load-meta";
import { readMatrixPostureFromModel } from "@/lib/launch/workspace-launch-bridge";
import { workspaceServiceIdSchema } from "@/lib/workspace/workspace-config";

/**
 * Stub Step 13 admin/workspace API routes for Vitest (no real Next server).
 */
export function stubAdminStep13Apis(): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.url;
      const method = init?.method ?? "GET";

      if (url.includes("/api/auth/session") && method === "GET") {
        return {
          ok: true,
          json: () => Promise.resolve({ snapshot: mockAdminSession(), credential: "active" as const }),
        } as Response;
      }

      if (url.includes("/api/admin/access/posture") && method === "GET") {
        const u = new URL(url, "http://localhost");
        const userId = u.searchParams.get("userId") ?? "";
        const serviceIdRaw = u.searchParams.get("serviceId") ?? "";
        const svc = workspaceServiceIdSchema.safeParse(serviceIdRaw);
        if (!svc.success) {
          return { ok: false, status: 400, json: () => Promise.resolve({ error: "bad service" }) } as Response;
        }
        const posture = readMatrixPostureFromModel(getMockAccessData(), userId, svc.data);
        return { ok: true, json: () => Promise.resolve(posture) } as Response;
      }

      if (url.includes("/api/workspace/access-posture") && method === "GET") {
        const u = new URL(url, "http://localhost");
        const userId = u.searchParams.get("userId") ?? "";
        const serviceIdRaw = u.searchParams.get("serviceId") ?? "";
        const svc = workspaceServiceIdSchema.safeParse(serviceIdRaw);
        if (!svc.success) {
          return { ok: false, status: 400, json: () => Promise.resolve({ error: "bad service" }) } as Response;
        }
        const posture = readMatrixPostureFromModel(getMockAccessData(), userId, svc.data);
        return { ok: true, json: () => Promise.resolve(posture) } as Response;
      }

      if (url.includes("/api/admin/access") && method === "GET" && !url.includes("posture")) {
        const payload: AdminAccessApiResponse = {
          ...getMockAccessData(),
          _meta: { origin: "mock_catalog" },
        };
        return { ok: true, json: () => Promise.resolve(payload) } as Response;
      }

      if (url.includes("/api/admin/control-plane") && method === "GET") {
        return { ok: true, json: () => Promise.resolve(getMockAdminHomeData()) } as Response;
      }

      if (url.includes("/api/admin/provisioning/jobs") && method === "GET") {
        return { ok: true, json: () => Promise.resolve({ jobs: getProvisioningJobsSnapshot() }) } as Response;
      }

      const jobAction = url.match(/\/api\/admin\/provisioning\/jobs\/([^/]+)\/(retry|resolve)/);
      if (jobAction && method === "POST") {
        const id = jobAction[1]!;
        const kind = jobAction[2]!;
        if (kind === "retry") {
          const job = retryProvisioningJob(id);
          if (!job) {
            return { ok: false, status: 400, json: () => Promise.resolve({ error: "retry" }) } as Response;
          }
          return { ok: true, json: () => Promise.resolve({ job }) } as Response;
        }
        const ok = resolveProvisioningJobManual(id);
        if (!ok) {
          return { ok: false, status: 400, json: () => Promise.resolve({ error: "resolve" }) } as Response;
        }
        return { ok: true, json: () => Promise.resolve({ ok: true }) } as Response;
      }

      if (url.includes("/api/admin/privileged-traces") && method === "GET") {
        return { ok: true, json: () => Promise.resolve({ items: getMockPrivilegedActionTraces() }) } as Response;
      }

      return { ok: false, status: 404, json: () => Promise.resolve({ error: "unstubbed", url }) } as Response;
    }),
  );
}
