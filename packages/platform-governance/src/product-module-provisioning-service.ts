import type { StartProvisioningInput } from "./governance-types";
import { ProvisioningService } from "./provisioning-service";

export class ProductProvisioningService {
  constructor(private readonly provisioning: ProvisioningService) {}

  provisionProduct(input: StartProvisioningInput) {
    return this.provisioning.provisionProduct(input);
  }
}

export class ModuleProvisioningService {
  constructor(private readonly provisioning: ProvisioningService) {}

  provisionModule(input: StartProvisioningInput) {
    return this.provisioning.provisionModule(input);
  }
}
