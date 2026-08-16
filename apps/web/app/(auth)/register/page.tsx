import Link from "next/link";
import {
  isDevRegistrationAllowed,
  isSelfServeRegistrationAllowed,
} from "@apzhub/config";

import { RegisterForm } from "./register-form";

function RegistrationClosed() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Registration</h1>
      <p
        className="text-sm text-[var(--color-muted-foreground)]"
        data-testid="registration-closed"
      >
        Self-serve account creation is not enabled on this environment. Use an
        organisation invite, or sign in if you already have access.
      </p>
      <p className="text-sm">
        <Link href="/login" className="text-[var(--color-primary)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  if (!isDevRegistrationAllowed() && !isSelfServeRegistrationAllowed()) {
    return <RegistrationClosed />;
  }

  return <RegisterForm />;
}
