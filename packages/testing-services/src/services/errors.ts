import { notFoundError } from "@apzhub/testing-persistence";

import { DomainRuleError } from "../lifecycle/state-machines";

export function requireFound<T>(value: T | undefined, kind: string, id: string): T {
  if (!value) {
    throw notFoundError(kind, id);
  }
  return value;
}

export { DomainRuleError };
