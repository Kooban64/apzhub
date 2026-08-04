import type { OrchestrationContractDescriptor } from "../contracts/contracts";
import { OrchestrationError } from "../contracts/errors";

export class ContractRegistry {
  private readonly records = new Map<string, OrchestrationContractDescriptor>();

  register(descriptor: OrchestrationContractDescriptor): void {
    const id = String(descriptor.contractId).trim();
    if (!id) {
      throw new OrchestrationError(
        "registry",
        "INVALID_CONTRACT_ID",
        "contractId is required",
      );
    }
    if (this.records.has(id)) {
      throw new OrchestrationError(
        "registry",
        "CONTRACT_ALREADY_REGISTERED",
        `Contract already registered: ${id}`,
        { contractId: id },
      );
    }
    this.records.set(id, { ...descriptor, contractId: id });
  }

  get(contractId: string): OrchestrationContractDescriptor | undefined {
    return this.records.get(contractId);
  }

  list(): readonly OrchestrationContractDescriptor[] {
    return [...this.records.values()];
  }

  count(): number {
    return this.records.size;
  }
}
