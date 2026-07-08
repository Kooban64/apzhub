import type { Client } from "../domain";
import { ReferenceNumberGenerator } from "../reference";
import { createEntityId } from "./id";

export interface ClientFactoryInput {
  readonly displayName: string;
  readonly clientType?: Client["clientType"];
  readonly status?: Client["status"];
  readonly clientReference?: string;
  readonly tags?: readonly string[];
  readonly customFields?: Readonly<Record<string, string>>;
}

const defaultReferenceGenerator = new ReferenceNumberGenerator({ sequenceWidth: 5 });

export const ClientFactory = {
  create(input: ClientFactoryInput): Client {
    return {
      clientId: createEntityId("c"),
      clientReference:
        input.clientReference ?? defaultReferenceGenerator.nextClientReference(),
      displayName: input.displayName.trim(),
      clientType: input.clientType ?? "individual",
      status: input.status ?? "prospect",
      tags: input.tags ?? [],
      customFields: input.customFields ?? {},
    };
  },
};
