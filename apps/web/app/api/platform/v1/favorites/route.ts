import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import {
  handleDeleteFavorite,
  handleGetFavorites,
  handlePostFavorite,
} from "@apzhub/platform-personalisation/server";

async function resolveSession() {
  return getValidatedSession(await headers());
}

export async function GET(): Promise<Response> {
  return handleGetFavorites(resolveSession);
}

export async function POST(request: Request): Promise<Response> {
  return handlePostFavorite(resolveSession, request);
}

export async function DELETE(request: Request): Promise<Response> {
  return handleDeleteFavorite(resolveSession, request);
}
