import { existsSync, readFileSync } from "fs";
import path from "path";

import type { AccessAdapterContract } from "@/lib/adapters/adapter-contracts";
import {
  getAccessFilePath,
  getAccessSource,
  getAccessStrictReal,
  getProvisioningSource,
} from "@/lib/adapters/env";
import type { AdapterHealthResult } from "@/lib/adapters/adapter-health-types";
import { adminAccessDataSchema } from "@/lib/admin/access/admin-access-data-schema";
import type { AdminAccessDataPlaneMeta } from "@/lib/admin/access/admin-access-load-meta";
import type { AdminAccessData } from "@/lib/admin/mock-access-data";
import { getMockAccessData } from "@/lib/admin/mock-access-data";
import { buildAdminAccessDataFromDb } from "@/lib/access/materialize-admin-access";
import { mergeProvisioningRealizationOverlay } from "@/lib/provisioning/access-overlay";
import { isProvisioningEngineConfigured } from "@/lib/provisioning/service/provisioning-service";
import { logStructured } from "@/lib/observability/log";

function resolveAccessFileAbsolutePath(): string {
  const rel = getAccessFilePath();
  return path.join(/* turbopackIgnore: true */ process.cwd(), rel);
}

function strictOrFallback(detail: string): void {
  if (getAccessStrictReal()) {
    throw new Error(`APZHUB_ACCESS_STRICT_REAL: ${detail}`);
  }
}

/**
 * When `APZHUB_ACCESS_SOURCE=real`, mutable access rows are read from Postgres and the **catalog**
 * (bundles, services, directory) is still the in-repo mock baseline for this slice.
 * If `APZHUB_ACCESS_FILE` is also set, it is **ignored** for reads (health reports `degraded` so operators notice).
 */
export function getAccessAdapterHealth(): AdapterHealthResult {
  const src = getAccessSource();
  if (src === "mock") {
    return { domain: "access", signal: "healthy", detail: "Mock access bundle (in-memory)." };
  }
  if (src === "real") {
    if ((process.env.APZHUB_ACCESS_FILE ?? "").trim()) {
      return {
        domain: "access",
        signal: "degraded",
        detail:
          "APZHUB_ACCESS_FILE is ignored while APZHUB_ACCESS_SOURCE=real (catalog baseline is mock; mutable state is Postgres).",
      };
    }
    if (!isProvisioningEngineConfigured()) {
      return {
        domain: "access",
        signal: "misconfigured",
        detail:
          "Real access requires a database URL (APZHUB_DATABASE_URL, DATABASE_URL, or APZHUB_DATABASE_URL_FILE).",
      };
    }
    return {
      domain: "access",
      signal: "healthy",
      detail:
        "Postgres-backed access (mock catalog + DB assignments/overrides/flags). If DB materialization throws, the server logs an error and temporarily serves the in-repo mock baseline — see docs/DEPLOYMENT.md (Transitional behavior).",
    };
  }
  if (src === "file") {
    const p = resolveAccessFileAbsolutePath();
    if (!existsSync(p)) {
      return {
        domain: "access",
        signal: "misconfigured",
        detail: `APZHUB_ACCESS_FILE path not found: ${getAccessFilePath()}`,
      };
    }
    try {
      adminAccessDataSchema.parse(JSON.parse(readFileSync(p, "utf8")) as unknown);
      return { domain: "access", signal: "healthy", detail: `Loaded access file ${getAccessFilePath()}` };
    } catch {
      return { domain: "access", signal: "degraded", detail: "Access file failed Zod validation." };
    }
  }
  return { domain: "access", signal: "degraded", detail: "Unknown access source." };
}

/**
 * Loads admin access data and metadata describing the load path (Postgres vs mock fallback).
 * Use from `GET /api/admin/access` for `_meta`; use {@link getAdminAccessData} when only the graph is needed.
 */
export async function loadAdminAccessDataWithMeta(): Promise<{
  data: AdminAccessData;
  meta: AdminAccessDataPlaneMeta;
}> {
  let base: AdminAccessData;
  let meta: AdminAccessDataPlaneMeta;

  if (getAccessSource() === "real") {
    if (isProvisioningEngineConfigured()) {
      try {
        base = await buildAdminAccessDataFromDb();
        meta = { origin: "postgres" };
      } catch (e) {
        const detail = String(e);
        logStructured("error", "access", "real access materialization failed; falling back to mock", {
          detail,
        });
        strictOrFallback(`Postgres materialization failed: ${detail}`);
        base = getMockAccessData();
        meta = { origin: "mock_fallback_db_error", detail };
      }
    } else {
      logStructured("warn", "access", "APZHUB_ACCESS_SOURCE=real but database is not configured; using mock", {});
      strictOrFallback("APZHUB_ACCESS_SOURCE=real but database is not configured.");
      base = getMockAccessData();
      meta = { origin: "mock_fallback_no_database_url" };
    }
  } else if (getAccessSource() === "file") {
    const p = resolveAccessFileAbsolutePath();
    if (existsSync(p)) {
      try {
        const raw = JSON.parse(readFileSync(p, "utf8")) as unknown;
        base = adminAccessDataSchema.parse(raw) as AdminAccessData;
        meta = { origin: "access_file" };
      } catch (e) {
        const detail = String(e);
        logStructured("error", "access", "failed to parse access file", { path: p, detail });
        strictOrFallback(`Access file failed to load: ${detail}`);
        base = getMockAccessData();
        meta = { origin: "mock_fallback_file_parse", detail };
      }
    } else {
      logStructured("warn", "access", "access file missing; falling back to mock", { path: p });
      strictOrFallback(`Access file missing: ${p}`);
      base = getMockAccessData();
      meta = { origin: "mock_fallback_file_missing", detail: p };
    }
  } else {
    base = getMockAccessData();
    meta = { origin: "mock_catalog" };
  }

  if (getProvisioningSource() === "real" && isProvisioningEngineConfigured()) {
    base = await mergeProvisioningRealizationOverlay(base);
  }

  return { data: base, meta };
}

export async function getAdminAccessData(): Promise<AdminAccessData> {
  const { data } = await loadAdminAccessDataWithMeta();
  return data;
}

export const accessAdapter: AccessAdapterContract = {
  getAccessData: getAdminAccessData,
  getHealth: getAccessAdapterHealth,
};

export function getAccessAdapter(): AccessAdapterContract {
  return accessAdapter;
}
