/**
 * Provider-neutral operational contracts (QO-016).
 * Contracts describe state only — never perform actions.
 */

import type {
  OperationalContract,
  OperationalContractKind,
  OperationalContractState,
  OperationalEndpointRef,
} from "../contracts/operational";
import { OPERATIONAL_CONTRACT_KINDS } from "../contracts/operational";

export function isOperationalContractKind(
  value: string,
): value is OperationalContractKind {
  return (OPERATIONAL_CONTRACT_KINDS as readonly string[]).includes(value);
}

export function buildOperationalContract(input: {
  readonly kind: OperationalContractKind;
  readonly state: OperationalContractState;
  readonly detail: string;
  readonly sourceRefs?: readonly string[];
  readonly metadata?: Readonly<Record<string, string>>;
}): OperationalContract {
  return Object.freeze({
    contractId: `op_contract_${input.kind}`,
    kind: input.kind,
    state: input.state,
    checkedAt: new Date().toISOString(),
    detail: input.detail,
    sourceRefs: Object.freeze([...(input.sourceRefs ?? [])]),
    descriptive: true as const,
    prescriptive: false as const,
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}

/** Logical operational endpoint catalogue — descriptive path hints only. */
export const BUILTIN_OPERATIONAL_ENDPOINTS: readonly OperationalEndpointRef[] =
  Object.freeze([
    Object.freeze({
      endpointId: "op_ep_health",
      name: "health",
      pathHint: "/api/operational/health",
      methodHint: "GET" as const,
      purpose: "Read descriptive health contract",
      metadata: Object.freeze({}),
    }),
    Object.freeze({
      endpointId: "op_ep_readiness",
      name: "readiness",
      pathHint: "/api/operational/readiness",
      methodHint: "GET" as const,
      purpose: "Read descriptive readiness contract",
      metadata: Object.freeze({}),
    }),
    Object.freeze({
      endpointId: "op_ep_liveness",
      name: "liveness",
      pathHint: "/api/operational/liveness",
      methodHint: "GET" as const,
      purpose: "Read descriptive liveness contract",
      metadata: Object.freeze({}),
    }),
    Object.freeze({
      endpointId: "op_ep_diagnostics",
      name: "diagnostics",
      pathHint: "/api/operational/diagnostics",
      methodHint: "GET" as const,
      purpose: "Read operational diagnostics snapshot",
      metadata: Object.freeze({}),
    }),
    Object.freeze({
      endpointId: "op_ep_version",
      name: "version",
      pathHint: "/api/operational/version",
      methodHint: "GET" as const,
      purpose: "Read version metadata",
      metadata: Object.freeze({}),
    }),
    Object.freeze({
      endpointId: "op_ep_metadata",
      name: "metadata",
      pathHint: "/api/operational/metadata",
      methodHint: "GET" as const,
      purpose: "Read operational metadata",
      metadata: Object.freeze({}),
    }),
    Object.freeze({
      endpointId: "op_ep_package",
      name: "readiness_package",
      pathHint: "/api/operational/readiness-package",
      methodHint: "GET" as const,
      purpose: "Read Operational Readiness Package",
      metadata: Object.freeze({}),
    }),
  ]);

export function listBuiltinOperationalEndpoints(): readonly OperationalEndpointRef[] {
  return BUILTIN_OPERATIONAL_ENDPOINTS;
}
