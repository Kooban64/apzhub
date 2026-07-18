export const runtime = "nodejs";

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getValidatedSession } from "@apzhub/auth/server";
import { Runtime } from "@apzhub/platform-runtime/server";

import { ensurePlatformRuntimeReady } from "@/lib/runtime-init";

const PRODUCT_IDS = new Set(["legal-platform", "law-platform"]);

function mapProduct(
  record: ReturnType<ReturnType<typeof Runtime.registry>["getServices"]>[number],
) {
  return {
    id: record.id,
    name: record.name,
    kind: record.kind,
    version: record.version,
    lifecycleState: record.lifecycleState,
    healthState: record.healthState,
    category: record.metadata.category,
    enabled:
      record.lifecycleState === "active" || record.lifecycleState === "discovered",
  };
}

export async function GET(): Promise<NextResponse> {
  await getValidatedSession(await headers());
  await ensurePlatformRuntimeReady();
  const registry = Runtime.registry();
  const products = registry
    .getServices()
    .filter(
      (record) => PRODUCT_IDS.has(record.id) || record.metadata.category === "product",
    )
    .map(mapProduct);

  const modules = registry.getModules();
  const lawModules = modules.filter((record) => record.id.startsWith("law-"));

  return NextResponse.json({
    data: products,
    meta: {
      count: products.length,
      lawModuleCount: lawModules.length,
      diagnostics: registry.getHealth(),
    },
  });
}
