/** Blocks until the promise settles — bridges sync repository interfaces to async PostgreSQL I/O. */
export function runSync<T>(promise: Promise<T>, timeoutMs = 10_000): T {
  const signal = new Int32Array(new SharedArrayBuffer(4));
  let result: T | undefined;
  let error: unknown;

  const timer = setTimeout(() => {
    error = new Error(`runSync timed out after ${timeoutMs}ms`);
    Atomics.store(signal, 0, 1);
    Atomics.notify(signal, 0);
  }, timeoutMs);

  void promise.then(
    (value) => {
      clearTimeout(timer);
      result = value;
      Atomics.store(signal, 0, 1);
      Atomics.notify(signal, 0);
    },
    (err) => {
      clearTimeout(timer);
      error = err;
      Atomics.store(signal, 0, 1);
      Atomics.notify(signal, 0);
    },
  );

  Atomics.wait(signal, 0, 0);

  if (error) {
    throw error;
  }

  return result as T;
}
