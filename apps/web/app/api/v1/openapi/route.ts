export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { HttpSecurityHeaderService } from "@apzhub/platform-security/headers";

import {
  loadPlatformOpenApiSpecObject,
  loadPlatformOpenApiSpecYaml,
} from "@/lib/api/v1/openapi";
import { PLATFORM_API_CACHE_CONTROL } from "@/lib/api/v1/constants";

const securityHeaders = new HttpSecurityHeaderService().getApiResponseHeaders("web");

export async function GET(request: Request) {
  const url = new URL(request.url);
  const format = url.searchParams.get("format");

  if (format === "yaml" || url.pathname.endsWith(".yaml")) {
    return new NextResponse(loadPlatformOpenApiSpecYaml(), {
      status: 200,
      headers: {
        ...securityHeaders,
        "content-type": "application/yaml; charset=utf-8",
        "cache-control": PLATFORM_API_CACHE_CONTROL,
      },
    });
  }

  return NextResponse.json(loadPlatformOpenApiSpecObject(), {
    status: 200,
    headers: {
      ...securityHeaders,
      "cache-control": PLATFORM_API_CACHE_CONTROL,
    },
  });
}
