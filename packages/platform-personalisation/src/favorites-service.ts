import type { AddFavoriteInput, FavoriteItem } from "./personalisation-types";
import type { FavoritesRepository } from "./repositories/repository-interfaces";

export class FavoritesService {
  constructor(private readonly repository: FavoritesRepository) {}

  async listFavorites(userId: string): Promise<readonly FavoriteItem[]> {
    return this.repository.listByUser(userId);
  }

  async addFavorite(input: AddFavoriteInput): Promise<FavoriteItem> {
    return this.repository.add(input);
  }

  async removeFavorite(userId: string, favoriteId: string): Promise<boolean> {
    return this.repository.remove(userId, favoriteId);
  }
}
