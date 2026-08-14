import { Suspense } from "react";

import { CheckoutClient } from "./checkout-client";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Loading checkout…</div>}>
      <CheckoutClient />
    </Suspense>
  );
}
