import { NextResponse } from "next/server";

/** Liveness for Docker HEALTHCHECK, Caddy, and deploy smoke scripts (no auth, no DB). */
export function GET() {
  return NextResponse.json({ status: "ok" as const, service: "apzhub" });
}
