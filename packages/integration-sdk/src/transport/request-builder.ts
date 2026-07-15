import type {
  TransportBodyKind,
  TransportHeaders,
  TransportHttpMethod,
  TransportRequest,
  TransportRequestBody,
} from "./types";

export function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

export function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export function buildUrl(
  baseUrl: string,
  path: string,
  query?: Readonly<Record<string, string | number | boolean>>,
): string {
  const normalizedBase = stripTrailingSlash(baseUrl);
  const normalizedPath = normalizePath(path);
  const url = new URL(`${normalizedBase}${normalizedPath}`);

  if (query) {
    for (const [key, value] of Object.entries(query)) {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export function resolveRequestUrl(
  baseUrl: string,
  request: TransportRequest,
): string {
  if (request.url) {
    if (!request.query) {
      return request.url;
    }
    const url = new URL(request.url);
    for (const [key, value] of Object.entries(request.query)) {
      url.searchParams.set(key, String(value));
    }
    return url.toString();
  }

  if (!request.path) {
    throw new Error("Transport request requires url or path");
  }

  return buildUrl(baseUrl, request.path, request.query);
}

export function serializeBody(
  body: TransportRequestBody | undefined,
): { readonly initBody: BodyInit | undefined; readonly contentType?: string; readonly bytes: number } {
  if (!body || body.kind === "empty") {
    return { initBody: undefined, bytes: 0 };
  }

  switch (body.kind) {
    case "json": {
      const text = JSON.stringify(body.json ?? null);
      return {
        initBody: text,
        contentType: "application/json",
        bytes: text.length,
      };
    }
    case "text": {
      const text = body.text ?? "";
      return {
        initBody: text,
        contentType: "text/plain",
        bytes: text.length,
      };
    }
    case "multipart":
      throw new Error(
        "Transport multipart body is a placeholder — binary/multipart transfer is not implemented",
      );
    case "binary":
      throw new Error(
        "Transport binary body is a placeholder — binary transfer is not implemented",
      );
    case "stream":
      throw new Error(
        "Transport stream body is a placeholder — streaming is not implemented",
      );
  }
}

export function estimateHeaderBytes(headers: TransportHeaders): number {
  let total = 0;
  for (const [key, value] of Object.entries(headers)) {
    total += key.length + value.length + 4;
  }
  return total;
}

export function createJsonBody(json: unknown): TransportRequestBody {
  return { kind: "json", json };
}

export function createTextBody(text: string): TransportRequestBody {
  return { kind: "text", text };
}

export function createEmptyBody(): TransportRequestBody {
  return { kind: "empty" };
}

export function createMultipartPlaceholderBody(): TransportRequestBody {
  return { kind: "multipart", multipart: { placeholder: true } };
}

export function createBinaryPlaceholderBody(): TransportRequestBody {
  return { kind: "binary", binary: { placeholder: true } };
}

export function createStreamPlaceholderBody(): TransportRequestBody {
  return { kind: "stream", stream: { placeholder: true } };
}

export const ALL_TRANSPORT_METHODS: readonly TransportHttpMethod[] = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
];

export const ALL_BODY_KINDS: readonly TransportBodyKind[] = [
  "json",
  "text",
  "multipart",
  "binary",
  "stream",
  "empty",
];
