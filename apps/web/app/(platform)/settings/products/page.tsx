import { redirect } from "next/navigation";

/** Stream 1 §34 — Settings → Products expands catalogue without new org. */
export default function SettingsProductsPage() {
  redirect("/marketplace");
}
