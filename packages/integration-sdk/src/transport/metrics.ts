import type { TransportMetrics, TransportMetricsSnapshot } from "./types";

export class DefaultTransportMetrics implements TransportMetrics {
  private requestCount = 0;
  private responseCount = 0;
  private errorCount = 0;
  private timeoutCount = 0;
  private retryCount = 0;
  private redirectCount = 0;
  private totalLatencyMs = 0;
  private bytesSent = 0;
  private bytesReceived = 0;

  recordRequest(bytesSent = 0): void {
    this.requestCount += 1;
    this.bytesSent += bytesSent;
  }

  recordResponse(latencyMs: number, bytesReceived = 0): void {
    this.responseCount += 1;
    this.totalLatencyMs += latencyMs;
    this.bytesReceived += bytesReceived;
  }

  recordError(): void {
    this.errorCount += 1;
  }

  recordTimeout(): void {
    this.timeoutCount += 1;
  }

  recordRetry(): void {
    this.retryCount += 1;
  }

  recordRedirect(): void {
    this.redirectCount += 1;
  }

  getSnapshot(): TransportMetricsSnapshot {
    return {
      requestCount: this.requestCount,
      responseCount: this.responseCount,
      errorCount: this.errorCount,
      timeoutCount: this.timeoutCount,
      retryCount: this.retryCount,
      redirectCount: this.redirectCount,
      totalLatencyMs: this.totalLatencyMs,
      averageLatencyMs:
        this.responseCount === 0 ? 0 : this.totalLatencyMs / this.responseCount,
      bytesSent: this.bytesSent,
      bytesReceived: this.bytesReceived,
    };
  }

  reset(): void {
    this.requestCount = 0;
    this.responseCount = 0;
    this.errorCount = 0;
    this.timeoutCount = 0;
    this.retryCount = 0;
    this.redirectCount = 0;
    this.totalLatencyMs = 0;
    this.bytesSent = 0;
    this.bytesReceived = 0;
  }
}

export function createTransportMetrics(): DefaultTransportMetrics {
  return new DefaultTransportMetrics();
}
