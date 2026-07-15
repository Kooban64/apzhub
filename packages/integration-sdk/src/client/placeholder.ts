import { createNotImplementedIntegrationError } from "../errors/factory";
import { IntegrationSdkError } from "../errors/types";
import type { IntegrationClient, IntegrationRequestOptions } from "./types";

/** Placeholder client — all requests throw not_implemented. Prefer `createHttpIntegrationClient` from transport. */
export class PlaceholderIntegrationClient implements IntegrationClient {
  async request<TResponse>(
    options: IntegrationRequestOptions,
  ): Promise<import("./types").IntegrationResponse<TResponse>> {
    throw new IntegrationSdkError(
      createNotImplementedIntegrationError(
        `IntegrationClient.request(${options.method} ${options.path})`,
        options.context.correlationId,
      ),
    );
  }
}

export function createPlaceholderIntegrationClient(): IntegrationClient {
  return new PlaceholderIntegrationClient();
}
