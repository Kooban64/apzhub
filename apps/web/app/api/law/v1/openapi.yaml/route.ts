export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { loadOpenApiSpecYaml } from "@/lib/api/docs/load-openapi-spec";

export async function GET(): Promise<NextResponse> {
  const yaml = loadOpenApiSpecYaml();

  return new NextResponse(yaml, {
    status: 200,
    headers: {
      "Content-Type": "application/yaml; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "Content-Disposition": 'inline; filename="LAW-OpenAPI-v1.yaml"',
    },
  });
}
