export type ErrorReporter = {
  capture: (err: unknown, context?: Record<string, string | number | boolean | undefined>) => void;
};

const noopReporter: ErrorReporter = {
  capture: () => {},
};

let reporter: ErrorReporter = noopReporter;

/** Wire Sentry or similar in production via env-driven registration. */
export function setErrorReporter(next: ErrorReporter): void {
  reporter = next;
}

export function getErrorReporter(): ErrorReporter {
  return reporter;
}
