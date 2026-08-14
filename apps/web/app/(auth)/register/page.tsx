import { isDevRegistrationAllowed } from "@apzhub/config";
import { notFound } from "next/navigation";

import { RegisterForm } from "./register-form";

function selfServeRegisterEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ALLOW_SELF_SERVE_REGISTER === "true";
}

export default function RegisterPage() {
  if (!isDevRegistrationAllowed() && !selfServeRegisterEnabled()) {
    notFound();
  }

  return <RegisterForm />;
}
