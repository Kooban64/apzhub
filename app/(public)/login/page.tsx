import { Suspense } from "react";

import { getIdentitySource } from "@/lib/adapters/env";

import { LoginShell } from "./login-shell";

/** Must not be statically prerendered at image build time (defaults to mock); use runtime env in Docker. */
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const identitySource = getIdentitySource();
  return (
    <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">Loading…</div>}>
      <LoginShell identitySource={identitySource} />
    </Suspense>
  );
}
