import { NextResponse } from "next/server";

import type { ProfileAdapterContract } from "@/lib/adapters/adapter-contracts";
import type { AdapterHealthResult } from "@/lib/adapters/adapter-health-types";
import { getProfileSource } from "@/lib/adapters/env";
import { mutateActiveSessionCookie } from "@/lib/profile/google-link-session-mutate";
import { logStructured } from "@/lib/observability/log";

function mockProfileHealth(): AdapterHealthResult {
  return { domain: "profile", signal: "healthy", detail: "Mock Google link via session cookie mutation." };
}

function realProfileHealth(): AdapterHealthResult {
  return {
    domain: "profile",
    signal: "misconfigured",
    detail: "Real OAuth/token store not wired (connect/disconnect return 501).",
  };
}

function mockProfileAdapter(): ProfileAdapterContract {
  return {
    getHealth: mockProfileHealth,
    connectGoogle: () =>
      mutateActiveSessionCookie((s) => ({
        ...s,
        linkedAccounts: { google: "linked" },
        mockProfileFlags: { googleDisconnected: false },
      })),
    disconnectGoogle: () =>
      mutateActiveSessionCookie((s) => ({
        ...s,
        linkedAccounts: { google: "not_linked" },
        mockProfileFlags: { googleDisconnected: true },
      })),
  };
}

async function notImplemented(): Promise<Response> {
  return NextResponse.json({ error: "Profile integration not configured." }, { status: 501 });
}

function realProfileAdapter(): ProfileAdapterContract {
  return {
    getHealth: realProfileHealth,
    connectGoogle: notImplemented,
    disconnectGoogle: notImplemented,
  };
}

export function getProfileAdapter(): ProfileAdapterContract {
  const src = getProfileSource();
  logStructured("debug", "profile", "profile adapter resolve", { source: src });
  return src === "real" ? realProfileAdapter() : mockProfileAdapter();
}
