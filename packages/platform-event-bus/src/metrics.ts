export type EventBusMetricsSnapshot = {
  readonly ingressAccepted: number;
  readonly ingressRejected: number;
  readonly ingressIgnored: number;
  readonly dispatched: number;
  readonly dispatchFailed: number;
  readonly outboxEnqueued: number;
  readonly outboxRelayOk: number;
  readonly outboxRelayFailed: number;
  readonly routed: number;
};

export type EventBusMetrics = {
  readonly increment: (key: keyof EventBusMetricsSnapshot, by?: number) => void;
  readonly snapshot: () => EventBusMetricsSnapshot;
  readonly reset: () => void;
};

export function createEventBusMetrics(): EventBusMetrics {
  const state: Record<keyof EventBusMetricsSnapshot, number> = {
    ingressAccepted: 0,
    ingressRejected: 0,
    ingressIgnored: 0,
    dispatched: 0,
    dispatchFailed: 0,
    outboxEnqueued: 0,
    outboxRelayOk: 0,
    outboxRelayFailed: 0,
    routed: 0,
  };

  return {
    increment(key, by = 1) {
      state[key] += by;
    },
    snapshot() {
      return { ...state };
    },
    reset() {
      for (const key of Object.keys(state) as (keyof EventBusMetricsSnapshot)[]) {
        state[key] = 0;
      }
    },
  };
}
