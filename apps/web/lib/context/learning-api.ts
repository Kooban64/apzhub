import type { ContextLearningSummary } from "@apzhub/platform-service-contracts";

export async function fetchContextLearningSummary(options?: {
  readonly signal?: AbortSignal;
}): Promise<ContextLearningSummary> {
  const response = await fetch("/api/v1/context/learning/summary", {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
    signal: options?.signal,
  });

  if (!response.ok) {
    throw new Error("Failed to load Context learning summary");
  }

  const body = (await response.json()) as { data: ContextLearningSummary };
  return body.data;
}
