export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { loadOpenApiSpecObject } from "@/lib/api/docs/load-openapi-spec";

export async function GET(): Promise<NextResponse> {
  const spec = loadOpenApiSpecObject();

  return NextResponse.json(spec, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=300",
      "Content-Disposition": 'inline; filename="LAW-OpenAPI-v1.json"',
    },
  });
}
