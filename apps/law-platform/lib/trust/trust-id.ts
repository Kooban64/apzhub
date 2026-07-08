let trustIdCounter = 0;

export function createTrustId(prefix: string): string {
  trustIdCounter += 1;
  const suffix = trustIdCounter.toString(16).padStart(12, "0");
  return `${prefix}_${suffix.slice(0, 8)}-0001-4000-8000-${suffix.padStart(12, "0")}`;
}

export function resetTrustIdCounter(): void {
  trustIdCounter = 0;
}
