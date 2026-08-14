import { Suspense } from "react";

import {
  isDemoPersonasEnabled,
  listDemoPersonasForClient,
} from "@/lib/demo/demo-personas";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  const demoPersonas = isDemoPersonasEnabled() ? listDemoPersonasForClient() : [];

  return (
    <Suspense fallback={<div className="p-6 text-center text-sm">Loading…</div>}>
      <LoginForm demoPersonas={demoPersonas} />
    </Suspense>
  );
}
