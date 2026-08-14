export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ApzpenDomainError } from "@/lib/apzpen/domain";
import { ingestGithubWebhookPullRequest } from "@/lib/apzpen/follow-on-service";
import { verifyGithubWebhookSignature } from "@/lib/apzpen/github-pr-security";

/**
 * Public GitHub webhook ingress for pull_request events.
 * Requires APZPEN_GITHUB_WEBHOOK_SECRET + query engagementId + tenantId.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.APZPEN_GITHUB_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      {
        error: {
          code: "NOT_CONFIGURED",
          message: "Set APZPEN_GITHUB_WEBHOOK_SECRET to enable ingress.",
        },
      },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  if (
    !verifyGithubWebhookSignature({
      secret,
      rawBody,
      signatureHeader: signature,
    })
  ) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid webhook signature." } },
      { status: 401 },
    );
  }

  const tenantId = request.nextUrl.searchParams.get("tenantId");
  const engagementId = request.nextUrl.searchParams.get("engagementId");
  if (!tenantId || !engagementId) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION",
          message: "tenantId and engagementId query params required",
        },
      },
      { status: 400 },
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "Invalid JSON body" } },
      { status: 400 },
    );
  }

  const eventName = request.headers.get("x-github-event") ?? "";
  if (eventName && eventName !== "pull_request" && eventName !== "ping") {
    return NextResponse.json({ ok: true, ignored: eventName });
  }
  if (eventName === "ping") {
    return NextResponse.json({ ok: true, pong: true });
  }

  try {
    const assessment = ingestGithubWebhookPullRequest({
      tenantId,
      engagementId,
      payload,
    });
    return NextResponse.json({ data: { assessment } }, { status: 201 });
  } catch (error) {
    if (error instanceof ApzpenDomainError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.code === "NOT_FOUND" ? 404 : 400 },
      );
    }
    throw error;
  }
}
