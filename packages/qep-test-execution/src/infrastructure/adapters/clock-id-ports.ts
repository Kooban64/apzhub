/**
 * Clock and Id Port adapters — APZQEP-ENG-100D.
 * Thin, dependency-free production implementations.
 */
import { randomUUID } from "node:crypto";

import type { ClockPort, IdPort } from "../../application/ports";

export function createSystemClockPort(): ClockPort {
  return {
    portId: "ClockPort",
    now: () => new Date().toISOString(),
  };
}

export function createUuidIdPort(): IdPort {
  return {
    portId: "IdPort",
    nextId(prefix) {
      const uuid = randomUUID();
      return prefix ? `${prefix}_${uuid}` : uuid;
    },
  };
}
