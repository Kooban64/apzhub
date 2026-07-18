import { z } from "zod";

import {
  PLATFORM_API_DEFAULT_PAGE_LIMIT,
  PLATFORM_API_MAX_PAGE_LIMIT,
} from "../constants";
import { validationError } from "../errors";

const GLOBAL_ID_PATTERN = /^([a-z]+)_([0-9a-f]{32})$/i;

export const globalIdSchema = z
  .string()
  .min(1)
  .regex(GLOBAL_ID_PATTERN, "Invalid APZHUB global ID format");

export function globalIdWithPrefix(prefix: string) {
  return z
    .string()
    .min(1)
    .refine(
      (value) => {
        const match = GLOBAL_ID_PATTERN.exec(value);
        return match !== null && match[1]!.toLowerCase() === prefix.toLowerCase();
      },
      { message: `Expected global ID with prefix '${prefix}_'` },
    );
}

export const paginationQuerySchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(PLATFORM_API_MAX_PAGE_LIMIT).optional(),
    cursor: z.string().min(1).max(512).optional(),
    page: z.coerce.number().int().min(1).optional(),
    perPage: z.coerce.number().int().min(1).max(PLATFORM_API_MAX_PAGE_LIMIT).optional(),
    sort: z.string().min(1).max(64).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  })
  .strict();

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export function resolvePageLimit(query: PaginationQuery): number {
  return query.limit ?? query.perPage ?? PLATFORM_API_DEFAULT_PAGE_LIMIT;
}

export function parseQuery<T>(schema: z.ZodType<T>, searchParams: URLSearchParams): T {
  const raw: Record<string, string> = {};
  for (const [key, value] of searchParams.entries()) {
    raw[key] = value;
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw validationError("Invalid query parameters.", {
      fieldErrors: result.error.flatten().fieldErrors,
      formErrors: result.error.flatten().formErrors,
    });
  }
  return result.data;
}

export function parsePathParam<T>(
  schema: z.ZodType<T>,
  value: string,
  name: string,
): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw validationError(`Invalid path parameter '${name}'.`, {
      fieldErrors: { [name]: result.error.issues.map((issue) => issue.message) },
    });
  }
  return result.data;
}

export async function parseJsonBody<T>(
  request: Request,
  schema: z.ZodType<T>,
  maxBytes: number,
): Promise<T> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    throw validationError("Content-Type must be application/json.");
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > maxBytes) {
    throw validationError("Request body exceeds size limit.");
  }

  let raw: unknown;
  try {
    const text = await request.text();
    if (text.length > maxBytes) {
      throw validationError("Request body exceeds size limit.");
    }
    if (text.trim().length === 0) {
      throw validationError("Request body is required.");
    }
    raw = JSON.parse(text) as unknown;
  } catch (error) {
    if (error instanceof Error && error.name === "PlatformApiHttpError") {
      throw error;
    }
    throw validationError("Malformed JSON request body.");
  }

  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    throw validationError("Request body must be a JSON object.");
  }

  // Prototype pollution guard — reject __proto__ / constructor keys
  for (const key of Object.keys(raw as object)) {
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      throw validationError("Request body contains forbidden keys.");
    }
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw validationError("Request body validation failed.", {
      fieldErrors: result.error.flatten().fieldErrors,
      formErrors: result.error.flatten().formErrors,
    });
  }
  return result.data;
}
