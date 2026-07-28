export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import {
  handlePostZammadWebhookIngress,
  zammadWebhookMethodNotAllowed,
} from "@/lib/api/v1/handlers/zammad-webhook-ingress";

const ALLOWED = ["POST"] as const;

export async function POST(request: NextRequest) {
  return handlePostZammadWebhookIngress(request);
}

export async function GET(request: NextRequest) {
  return zammadWebhookMethodNotAllowed(request, ALLOWED);
}

export async function PATCH(request: NextRequest) {
  return zammadWebhookMethodNotAllowed(request, ALLOWED);
}

export async function PUT(request: NextRequest) {
  return zammadWebhookMethodNotAllowed(request, ALLOWED);
}

export async function DELETE(request: NextRequest) {
  return zammadWebhookMethodNotAllowed(request, ALLOWED);
}
