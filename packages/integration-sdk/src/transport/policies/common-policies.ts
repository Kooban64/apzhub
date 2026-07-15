import type {
  CompressionConfiguration,
  CompressionEncoding,
  RateLimitPolicy,
  RateLimitPolicyOptions,
  RedirectConfiguration,
  TlsConfiguration,
  TransportHeaders,
  TransportPolicy,
  TransportRequest,
  TransportExecutionContext,
} from "../types";

export const DEFAULT_TLS: TlsConfiguration = {
  validateCertificates: true,
};

export const DEFAULT_COMPRESSION: CompressionConfiguration = {
  acceptEncoding: ["gzip", "br", "identity"],
  autoDecompress: true,
};

export const DEFAULT_REDIRECTS: RedirectConfiguration = {
  maxRedirects: 20,
  follow: true,
  detectLoops: true,
};

export function resolveTlsConfiguration(
  partial?: Partial<TlsConfiguration>,
): TlsConfiguration {
  return {
    validateCertificates: partial?.validateCertificates ?? true,
    customCA: partial?.customCA,
    developmentOverrides: partial?.developmentOverrides,
  };
}

export function resolveCompressionConfiguration(
  partial?: Partial<CompressionConfiguration>,
): CompressionConfiguration {
  return {
    acceptEncoding: partial?.acceptEncoding ?? DEFAULT_COMPRESSION.acceptEncoding,
    autoDecompress: partial?.autoDecompress ?? true,
  };
}

export function resolveRedirectConfiguration(
  partial?: Partial<RedirectConfiguration>,
): RedirectConfiguration {
  return {
    maxRedirects: partial?.maxRedirects ?? DEFAULT_REDIRECTS.maxRedirects,
    follow: partial?.follow ?? DEFAULT_REDIRECTS.follow,
    detectLoops: partial?.detectLoops ?? DEFAULT_REDIRECTS.detectLoops,
  };
}

export function buildAcceptEncodingHeader(
  config: CompressionConfiguration,
): string {
  return config.acceptEncoding.join(", ");
}

/**
 * Applies Accept-Encoding from compression config when not already set.
 */
export class CompressionPolicy implements TransportPolicy {
  readonly name = "compression";

  constructor(private readonly config: CompressionConfiguration) {}

  applyRequest(
    request: TransportRequest,
    _ctx: TransportExecutionContext,
  ): TransportRequest {
    const headers: Record<string, string> = { ...(request.headers ?? {}) };
    const hasAcceptEncoding = Object.keys(headers).some(
      (key) => key.toLowerCase() === "accept-encoding",
    );

    if (!hasAcceptEncoding && this.config.acceptEncoding.length > 0) {
      headers["Accept-Encoding"] = buildAcceptEncodingHeader(this.config);
    }

    return { ...request, headers };
  }
}

/**
 * Documents redirect preferences. Fetch follows redirects by default;
 * loop detection / maxRedirects are tracked in diagnostics and applied
 * where the runtime exposes redirect control.
 */
export class RedirectPolicy implements TransportPolicy {
  readonly name = "redirects";

  constructor(private readonly config: RedirectConfiguration) {}

  get configuration(): RedirectConfiguration {
    return this.config;
  }

  applyRequest(
    request: TransportRequest,
    ctx: TransportExecutionContext,
  ): TransportRequest {
    ctx.metadata.redirectFollow = this.config.follow;
    ctx.metadata.redirectMax = this.config.maxRedirects;
    ctx.metadata.redirectDetectLoops = this.config.detectLoops;
    return request;
  }
}

/**
 * TLS policy stores configuration for diagnostics. Node undici/fetch does not
 * accept custom CA or validateCertificates via RequestInit.
 */
export class TlsPolicy implements TransportPolicy {
  readonly name = "tls";

  constructor(private readonly config: TlsConfiguration) {}

  get configuration(): TlsConfiguration {
    return this.config;
  }

  applyRequest(
    request: TransportRequest,
    ctx: TransportExecutionContext,
  ): TransportRequest {
    ctx.metadata.tlsValidateCertificates = this.config.validateCertificates;
    if (this.config.developmentOverrides?.allowInsecure) {
      ctx.metadata.tlsAllowInsecure = true;
    }
    return request;
  }
}

/** No-op rate limit stub — acquire always succeeds immediately. */
export class NoopRateLimitPolicy implements RateLimitPolicy {
  readonly limitPerWindow: number;
  readonly windowMs: number;

  constructor(options: RateLimitPolicyOptions = {}) {
    this.limitPerWindow = options.limitPerWindow ?? Number.POSITIVE_INFINITY;
    this.windowMs = options.windowMs ?? 60_000;
  }

  async acquire(_key: string): Promise<{ readonly release: () => void }> {
    return { release: () => undefined };
  }
}

export function createNoopRateLimitPolicy(
  options?: RateLimitPolicyOptions,
): NoopRateLimitPolicy {
  return new NoopRateLimitPolicy(options);
}

export function mergeHeaders(
  ...parts: Array<TransportHeaders | undefined>
): TransportHeaders {
  const result: Record<string, string> = {};
  for (const part of parts) {
    if (!part) continue;
    for (const [key, value] of Object.entries(part)) {
      result[key] = value;
    }
  }
  return result;
}

export type { CompressionEncoding };
