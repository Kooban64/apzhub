import type {
  ProvisioningRecord,
  ProvisioningStatus,
  StartProvisioningInput,
} from "./governance-types";
import type { ProvisioningRepository } from "./repositories/repository-interfaces";

export class ProvisioningService {
  constructor(private readonly repository: ProvisioningRepository) {}

  async listProvisioningHistory(filter?: {
    scopeType?: string;
    scopeKey?: string;
    status?: ProvisioningStatus;
  }): Promise<readonly ProvisioningRecord[]> {
    return this.repository.listRecords(filter);
  }

  async getProvisioningStatus(
    provisioningId: string,
  ): Promise<ProvisioningRecord | undefined> {
    return this.repository.getRecord(provisioningId);
  }

  async startProvisioning(input: StartProvisioningInput): Promise<ProvisioningRecord> {
    return this.repository.createRecord(input);
  }

  async completeProvisioning(
    provisioningId: string,
    message = "Provisioning completed.",
  ): Promise<ProvisioningRecord | undefined> {
    return this.repository.updateRecordStatus(provisioningId, "completed", message);
  }

  async failProvisioning(
    provisioningId: string,
    message: string,
  ): Promise<ProvisioningRecord | undefined> {
    return this.repository.updateRecordStatus(provisioningId, "failed", message);
  }

  async provisionProduct(input: StartProvisioningInput): Promise<ProvisioningRecord> {
    const record = await this.startProvisioning(input);
    return (await this.completeProvisioning(
      record.provisioningId,
      `Product ${input.targetKey} provisioned for ${input.scopeType}:${input.scopeKey}`,
    ))!;
  }

  async provisionModule(input: StartProvisioningInput): Promise<ProvisioningRecord> {
    const record = await this.startProvisioning(input);
    return (await this.completeProvisioning(
      record.provisioningId,
      `Module ${input.targetKey} provisioned for ${input.scopeType}:${input.scopeKey}`,
    ))!;
  }

  async provisionTenant(input: {
    readonly tenantId: string;
    readonly productKeys?: readonly string[];
  }): Promise<readonly ProvisioningRecord[]> {
    const records: ProvisioningRecord[] = [];
    const tenantRecord = await this.startProvisioning({
      scopeType: "tenant",
      scopeKey: input.tenantId,
      targetType: "platform",
      targetKey: "tenant",
    });
    records.push(
      (await this.completeProvisioning(
        tenantRecord.provisioningId,
        `Tenant ${input.tenantId} provisioned`,
      ))!,
    );

    for (const productKey of input.productKeys ?? ["law-platform"]) {
      records.push(
        await this.provisionProduct({
          scopeType: "tenant",
          scopeKey: input.tenantId,
          targetType: "product",
          targetKey: productKey,
        }),
      );
    }

    return records;
  }
}
