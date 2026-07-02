/**
 * Synchronous operation guard for future concurrent registration.
 *
 * **Current assumption:** single-process, single-threaded Node.js runtime.
 * All registry mutations are synchronous. A future implementation may replace
 * this with an async mutex or transactional store without changing the public API.
 */
export class RegistryOperationGuard {
  private generation = 0;

  /** Returns current store generation — increments on clear() for staleness detection. */
  getGeneration(): number {
    return this.generation;
  }

  bumpGeneration(): void {
    this.generation += 1;
  }
}
