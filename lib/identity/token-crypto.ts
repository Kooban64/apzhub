import { createHash, randomBytes } from "node:crypto";

export function randomUrlToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashOpaqueToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}
