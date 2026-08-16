import {
  isDevRegistrationAllowed,
  isSelfServeRegistrationAllowed,
} from "@apzhub/config";
import { notFound } from "next/navigation";

import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  if (!isDevRegistrationAllowed() && !isSelfServeRegistrationAllowed()) {
    notFound();
  }

  return <RegisterForm />;
}
