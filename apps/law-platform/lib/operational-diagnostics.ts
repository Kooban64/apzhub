import { loadConsolidatedOperationalDiagnostics as loadCanonicalOperationalDiagnostics } from "@apzhub/platform-bootstrap/diagnostics";

import { WORKSPACE_ROOT } from "./runtime-init";

export async function loadConsolidatedOperationalDiagnostics() {
  return loadCanonicalOperationalDiagnostics(WORKSPACE_ROOT, {
    lawPlatformDiagnostics: {
      product: "law-platform",
      mirroredPersonalisationApis: true,
    },
    trustAccountingDiagnostics: {
      capability: "law.trust.accounting",
      status: "product-scoped",
      note: "Trust accounting diagnostics surface via Law Platform product APIs.",
    },
  });
}
