export class TestingClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly correlationId?: string;
  readonly requestId?: string;

  constructor(
    message: string,
    code = "TESTING_CLIENT_ERROR",
    status = 400,
    options?: { readonly correlationId?: string; readonly requestId?: string },
  ) {
    super(message);
    this.name = "TestingClientError";
    this.code = code;
    this.status = status;
    if (options?.correlationId !== undefined) {
      this.correlationId = options.correlationId;
    }
    if (options?.requestId !== undefined) {
      this.requestId = options.requestId;
    }
  }

  static fromHttp(input: {
    readonly status: number;
    readonly message?: string;
    readonly code?: string;
    readonly correlationId?: string;
    readonly requestId?: string;
  }): TestingClientError {
    return new TestingClientError(
      input.message ?? "Unable to load Testing data.",
      input.code ?? "TESTING_HTTP_ERROR",
      input.status,
      {
        correlationId: input.correlationId,
        requestId: input.requestId,
      },
    );
  }
}

export function isTestingClientError(error: unknown): error is TestingClientError {
  return error instanceof TestingClientError;
}

export function toTestingUserMessage(error: unknown): string {
  if (isTestingClientError(error)) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Unable to load Testing data.";
}
