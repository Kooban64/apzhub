export type OrchestrationLogLevel = "debug" | "info" | "warn" | "error";

export interface OrchestrationLogRecord {
  readonly level: OrchestrationLogLevel;
  readonly message: string;
  readonly orchestrationId?: string;
  readonly correlationId?: string;
  readonly at: string;
  readonly fields?: Readonly<Record<string, unknown>>;
}

export type OrchestrationLogger = (record: OrchestrationLogRecord) => void;

export function createConsoleOrchestrationLogger(): OrchestrationLogger {
  return (record) => {
    const line = JSON.stringify(record);
    if (record.level === "error") {
      console.error(line);
      return;
    }
    if (record.level === "warn") {
      console.warn(line);
      return;
    }
    console.info(line);
  };
}

export function createSilentOrchestrationLogger(): OrchestrationLogger {
  return () => undefined;
}
