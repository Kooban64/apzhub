/** Mock sequence provider — no persistence (LAW-002-02). */
export interface ReferenceSequenceProvider {
  nextSequence(prefix: string, year: number): number;
  reset(prefix?: string, year?: number): void;
}

/** In-memory sequence counter for reference generation. */
export class MockReferenceSequenceProvider implements ReferenceSequenceProvider {
  private readonly counters = new Map<string, number>();

  private key(prefix: string, year: number): string {
    return `${prefix}:${year}`;
  }

  nextSequence(prefix: string, year: number): number {
    const key = this.key(prefix, year);
    const next = (this.counters.get(key) ?? 0) + 1;
    this.counters.set(key, next);
    return next;
  }

  reset(prefix?: string, year?: number): void {
    if (!prefix) {
      this.counters.clear();
      return;
    }

    if (year === undefined) {
      for (const key of [...this.counters.keys()]) {
        if (key.startsWith(`${prefix}:`)) {
          this.counters.delete(key);
        }
      }
      return;
    }

    this.counters.delete(this.key(prefix, year));
  }
}
