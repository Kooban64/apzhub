import { MAX_RECENT_ITEMS, type RecentItem, type TrackRecentItemInput } from "./personalisation-types";
import type { RecentItemsRepository } from "./repositories/repository-interfaces";

export class RecentItemsService {
  constructor(private readonly repository: RecentItemsRepository) {}

  async listRecentItems(userId: string, limit = MAX_RECENT_ITEMS): Promise<readonly RecentItem[]> {
    return this.repository.listByUser(userId, limit);
  }

  async trackRecentItem(input: TrackRecentItemInput): Promise<RecentItem> {
    return this.repository.track(input);
  }

  async clearRecentItems(userId: string): Promise<void> {
    await this.repository.clear(userId);
  }
}
