import { Suspense } from "react";

import { CustomerPortalPage } from "@/components/apzpen/apzpen-follow-on-pages";

export default function Page() {
  return (
    <Suspense
      fallback={
        <p className="p-6 text-sm text-[var(--color-muted-foreground)]">
          Loading portal…
        </p>
      }
    >
      <CustomerPortalPage />
    </Suspense>
  );
}
