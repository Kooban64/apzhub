import type {
  CreateOperationalFrictionInput,
  OperationalFriction,
  OperationalFrictionAuditEntry,
  UpdateOperationalFrictionInput,
} from "@apzhub/platform-service-contracts";

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function listOperationalFriction(options?: {
  readonly signal?: AbortSignal;
}): Promise<readonly OperationalFriction[]> {
  const response = await fetch("/api/v1/product-board/friction", {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    signal: options?.signal,
  });
  const body = (await parseJson(response)) as {
    data?: { items?: OperationalFriction[] };
  };
  if (!response.ok) throw new Error("Failed to list friction records");
  return body.data?.items ?? [];
}

export async function createOperationalFriction(
  input: CreateOperationalFrictionInput,
): Promise<OperationalFriction> {
  const response = await fetch("/api/v1/product-board/friction", {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const body = (await parseJson(response)) as {
    data?: OperationalFriction;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? "Failed to create friction record");
  }
  return body.data as OperationalFriction;
}

export async function getOperationalFriction(
  id: string,
  options?: { readonly signal?: AbortSignal },
): Promise<OperationalFriction> {
  const response = await fetch(`/api/v1/product-board/friction/${id}`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    signal: options?.signal,
  });
  const body = (await parseJson(response)) as { data?: OperationalFriction };
  if (!response.ok) throw new Error("Failed to load friction record");
  return body.data as OperationalFriction;
}

export async function updateOperationalFriction(
  id: string,
  input: UpdateOperationalFrictionInput,
): Promise<OperationalFriction> {
  const response = await fetch(`/api/v1/product-board/friction/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const body = (await parseJson(response)) as {
    data?: OperationalFriction;
    error?: { message?: string };
  };
  if (!response.ok) {
    throw new Error(body.error?.message ?? "Failed to update friction record");
  }
  return body.data as OperationalFriction;
}

export async function listOperationalFrictionAudit(
  id: string,
  options?: { readonly signal?: AbortSignal },
): Promise<readonly OperationalFrictionAuditEntry[]> {
  const response = await fetch(`/api/v1/product-board/friction/${id}/audit`, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    signal: options?.signal,
  });
  const body = (await parseJson(response)) as {
    data?: { items?: OperationalFrictionAuditEntry[] };
  };
  if (!response.ok) throw new Error("Failed to load audit history");
  return body.data?.items ?? [];
}
