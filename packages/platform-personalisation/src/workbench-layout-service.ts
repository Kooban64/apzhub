import type { WorkbenchLayoutRecord } from "./personalisation-types";
import type { WorkbenchLayoutRepository } from "./repositories/repository-interfaces";

export class WorkbenchLayoutService {
  constructor(private readonly repository: WorkbenchLayoutRepository) {}

  async getLayout(userId: string): Promise<WorkbenchLayoutRecord | undefined> {
    return this.repository.get(userId);
  }

  async saveLayout(
    userId: string,
    layout: Record<string, unknown>,
  ): Promise<WorkbenchLayoutRecord> {
    return this.repository.save(userId, layout);
  }

  async clearLayout(userId: string): Promise<boolean> {
    return this.repository.delete(userId);
  }
}
