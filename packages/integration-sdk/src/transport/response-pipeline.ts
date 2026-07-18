import type {
  TransportHeaders,
  TransportResponse,
  TransportResponseKind,
} from "./types";

export function detectContentType(
  headers: Headers | TransportHeaders,
): string | undefined {
  if (headers instanceof Headers) {
    return headers.get("content-type") ?? undefined;
  }

  const entry = Object.entries(headers).find(
    ([key]) => key.toLowerCase() === "content-type",
  );
  return entry?.[1];
}

export function headersToRecord(headers: Headers): TransportHeaders {
  return Object.fromEntries(headers.entries());
}

export function classifyResponseKind(
  contentType: string | undefined,
  text: string,
  status: number,
): TransportResponseKind {
  if (status === 204 || text.length === 0) {
    return "empty";
  }

  const lower = (contentType ?? "").toLowerCase();
  if (lower.includes("application/json") || lower.includes("+json")) {
    return "json";
  }
  if (lower.includes("event-stream") || lower.includes("ndjson")) {
    return "stream";
  }
  if (
    lower.startsWith("text/") ||
    lower.includes("xml") ||
    lower.includes("javascript")
  ) {
    return "text";
  }
  if (
    lower.includes("octet-stream") ||
    lower.startsWith("image/") ||
    lower.startsWith("audio/") ||
    lower.startsWith("video/")
  ) {
    return "binary";
  }

  // Heuristic: try JSON when no content-type
  if (!contentType) {
    const trimmed = text.trim();
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      return "json";
    }
  }

  return "text";
}

export async function decodeResponse<TData>(
  response: Response,
  options: { readonly method?: string } = {},
): Promise<{
  readonly kind: TransportResponseKind;
  readonly data?: TData;
  readonly text?: string;
  readonly binary?: { readonly placeholder: true };
  readonly stream?: { readonly placeholder: true };
  readonly contentType?: string;
  readonly headers: TransportHeaders;
  readonly bytesReceived: number;
}> {
  const headers = headersToRecord(response.headers);
  const contentType = detectContentType(response.headers);

  // HEAD typically has no body; 204 is always empty
  if (response.status === 204 || options.method === "HEAD") {
    return {
      kind: "empty",
      data: {} as TData,
      text: "",
      contentType,
      headers,
      bytesReceived: 0,
    };
  }

  const text = await response.text();
  const kind = classifyResponseKind(contentType, text, response.status);

  if (kind === "empty") {
    return {
      kind: "empty",
      data: {} as TData,
      text: "",
      contentType,
      headers,
      bytesReceived: 0,
    };
  }

  if (kind === "json") {
    const data = text ? (JSON.parse(text) as TData) : ({} as TData);
    return {
      kind: "json",
      data,
      text,
      contentType,
      headers,
      bytesReceived: text.length,
    };
  }

  if (kind === "binary") {
    return {
      kind: "binary",
      binary: { placeholder: true },
      text,
      contentType,
      headers,
      bytesReceived: text.length,
    };
  }

  if (kind === "stream") {
    return {
      kind: "stream",
      stream: { placeholder: true },
      text,
      contentType,
      headers,
      bytesReceived: text.length,
    };
  }

  return {
    kind: "text",
    data: text as TData,
    text,
    contentType,
    headers,
    bytesReceived: text.length,
  };
}

export function typedDecodeJson<T>(text: string): T {
  if (!text) {
    return {} as T;
  }
  return JSON.parse(text) as T;
}

export function buildTransportResponse<TData>(
  partial: Omit<TransportResponse<TData>, "ok"> & { readonly ok?: boolean },
): TransportResponse<TData> {
  return {
    ...partial,
    ok: partial.ok ?? (partial.status >= 200 && partial.status < 300),
  };
}
