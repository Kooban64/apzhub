/**
 * Ensure the APZHUB platform Meilisearch index exists with filterable attrs.
 * Safe to re-run (idempotent). Uses `.secrets/meilisearch` + SEARCH_* env.
 */
import { config } from "dotenv";

config({ path: ".env" });

import {
  ensureLocalSecretsLoaded,
  resetEnvCache,
  resetLocalSecretsLoadForTests,
} from "@apzhub/config";

resetLocalSecretsLoadForTests();
resetEnvCache();
ensureLocalSecretsLoaded();

const endpoint = (process.env.SEARCH_MEILISEARCH_ENDPOINT ?? "").replace(/\/$/, "");
const apiKey = process.env.SEARCH_MEILISEARCH_API_KEY?.trim();
const indexUid =
  process.env.SEARCH_MEILISEARCH_DEFAULT_INDEX?.trim() || "apzhub_platform";
const tenantId =
  process.env.SEARCH_BOOTSTRAP_TENANT_ID?.trim() ||
  "t0000001-0000-4000-8000-000000000001";

if (!endpoint) {
  console.error("[meili] SEARCH_MEILISEARCH_ENDPOINT is not set — skip");
  process.exit(0);
}
if (!apiKey) {
  console.error(
    "[meili] SEARCH_MEILISEARCH_API_KEY missing — provide `.secrets/meilisearch`",
  );
  process.exit(1);
}

async function meili(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; json: unknown }> {
  const response = await fetch(`${endpoint}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let json: unknown = undefined;
  try {
    json = text ? JSON.parse(text) : undefined;
  } catch {
    json = { raw: text };
  }
  return { status: response.status, json };
}

async function waitTask(
  taskUid: number,
  options?: { readonly allowCodes?: readonly string[] },
): Promise<void> {
  for (let i = 0; i < 40; i += 1) {
    const { json } = await meili("GET", `/tasks/${taskUid}`);
    const body = json as {
      status?: string;
      error?: { code?: string };
    };
    const status = body.status;
    if (status === "succeeded" || status === "failed" || status === "canceled") {
      if (status === "succeeded") return;
      const code = body.error?.code;
      if (code && options?.allowCodes?.includes(code)) return;
      throw new Error(`Meilisearch task ${taskUid} ${status}: ${JSON.stringify(json)}`);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Meilisearch task ${taskUid} timed out`);
}

async function main(): Promise<void> {
  const create = await meili("POST", "/indexes", {
    uid: indexUid,
    primaryKey: "id",
  });
  const createCode = (create.json as { code?: string } | undefined)?.code;
  if (create.status === 202 || create.status === 201) {
    const taskUid = (create.json as { taskUid?: number }).taskUid;
    if (typeof taskUid === "number") {
      await waitTask(taskUid, { allowCodes: ["index_already_exists"] });
    }
  } else if (createCode !== "index_already_exists" && create.status !== 409) {
    throw new Error(
      `create index failed: ${create.status} ${JSON.stringify(create.json)}`,
    );
  }

  const settings = await meili(
    "PATCH",
    `/indexes/${encodeURIComponent(indexUid)}/settings`,
    {
      filterableAttributes: [
        "tenantId",
        "organisationId",
        "productId",
        "sourceId",
        "entityType",
      ],
      searchableAttributes: ["title", "body", "summary"],
    },
  );
  if (settings.status === 202) {
    const taskUid = (settings.json as { taskUid?: number }).taskUid;
    if (typeof taskUid === "number") await waitTask(taskUid);
  } else if (settings.status < 200 || settings.status >= 300) {
    throw new Error(
      `settings failed: ${settings.status} ${JSON.stringify(settings.json)}`,
    );
  }

  const docs = await meili(
    "POST",
    `/indexes/${encodeURIComponent(indexUid)}/documents`,
    [
      {
        id: "pob-1",
        title: "APZHUB Platform Operational Baseline",
        body: "Search notifications activity shell",
        summary: "POB smoke document",
        tenantId,
        productId: "platform",
        entityType: "document",
        sourceId: "src_platform",
      },
      {
        id: "pob-2",
        title: "Meilisearch wired",
        body: "Keyword search works on port 17700",
        summary: "Meilisearch reference adapter",
        tenantId,
        productId: "platform",
        entityType: "document",
        sourceId: "src_platform",
      },
    ],
  );
  if (docs.status === 202) {
    const taskUid = (docs.json as { taskUid?: number }).taskUid;
    if (typeof taskUid === "number") await waitTask(taskUid);
  } else if (docs.status < 200 || docs.status >= 300) {
    throw new Error(`documents failed: ${docs.status} ${JSON.stringify(docs.json)}`);
  }

  console.info(`[meili] Index ready: ${indexUid} @ ${endpoint}`);
}

main().catch((error) => {
  console.error("[meili]", error instanceof Error ? error.message : error);
  process.exit(1);
});
